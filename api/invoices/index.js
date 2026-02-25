import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const expectedSig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        return signature === expectedSig;
    } catch (e) {
        return false;
    }
}

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // GET — list invoices
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('invoices')
            .select('id, name, created_at, updated_at')
            .order('updated_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // POST — create invoice
    if (req.method === 'POST') {
        const { name, data: invoiceData, settings } = req.body || {};
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                name: name || 'Untitled Invoice',
                data: invoiceData || {},
                settings: settings || {},
            })
            .select('id')
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ id: data.id, message: 'Invoice saved' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
