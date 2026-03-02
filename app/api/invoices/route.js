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

// GET — list invoices for a given year (default: current year)
export async function GET(request) {
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    const { data, error } = await supabase
        .from('invoices')
        .select('id, name, month, year, created_at, updated_at')
        .eq('year', year)
        .order('month', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST — upsert invoice for a specific month+year
export async function POST(request) {
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { month, year, data: invoiceData, settings, name } = body || {};

    if (!month || !year) {
        return NextResponse.json({ error: 'month and year are required' }, { status: 400 });
    }

    // Check if invoice exists for this month+year
    const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('year', year)
        .eq('month', month)
        .single();

    if (existing) {
        // Update existing
        const { error } = await supabase
            .from('invoices')
            .update({
                name: name || `Invoice_${year}_${String(month).padStart(2, '0')}`,
                data: invoiceData || {},
                settings: settings || {},
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ id: existing.id, message: 'Invoice updated' });
    } else {
        // Insert new
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                name: name || `Invoice_${year}_${String(month).padStart(2, '0')}`,
                month,
                year,
                data: invoiceData || {},
                settings: settings || {},
            })
            .select('id')
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ id: data.id, message: 'Invoice created' });
    }
}
