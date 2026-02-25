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

    const { id } = req.query;

    // GET — single invoice
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return res.status(404).json({ error: 'Invoice not found' });
        return res.status(200).json(data);
    }

    // PUT — update invoice
    if (req.method === 'PUT') {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { /* ignore */ }
        }
        const { name, data: invoiceData, settings } = body || {};
        const { error } = await supabase
            .from('invoices')
            .update({
                name: name || 'Untitled Invoice',
                data: invoiceData || {},
                settings: settings || {},
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Invoice updated' });
    }

    // DELETE — delete invoice
    if (req.method === 'DELETE') {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Invoice deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
