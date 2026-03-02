import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function verifyToken(request) {
    const authHeader = request.headers.get('authorization');
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

// GET — single invoice
export async function GET(request, { params }) {
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json(data);
}

// PUT — update invoice
export async function PUT(request, { params }) {
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Invoice updated' });
}

// DELETE — delete invoice
export async function DELETE(request, { params }) {
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Invoice deleted' });
}
