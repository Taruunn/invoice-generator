import { NextResponse } from 'next/server';
import { getSupabase, supabaseErrorMessage } from '../../../../lib/supabase';
import { resolveWorkspaceRequest } from '../../../../lib/workspace-auth';
import { reindexVagmiSequentialInvoiceNumbers } from '../../../../lib/vagmi-invoice-index';

export async function GET(request, { params }) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ error: sb.error }, { status: 503 });
    }
    const supabase = sb.client;

    const { id } = await params;

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        const status = error.code === 'PGRST116' ? 404 : 500;
        const message =
            error.code === 'PGRST116' ? 'Invoice not found' : supabaseErrorMessage(error);
        return NextResponse.json({ error: message }, { status });
    }

    const rowWs = data.workspace || 'tarun';
    if (rowWs !== auth.workspace) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function PUT(request, { params }) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ error: sb.error }, { status: 503 });
    }
    const supabase = sb.client;

    const { id } = await params;
    const body = await request.json();
    const { name, data: invoiceData, settings } = body || {};

    const { data: existing, error: fetchErr } = await supabase
        .from('invoices')
        .select('id, workspace')
        .eq('id', id)
        .single();

    if (fetchErr || !existing) {
        const status = fetchErr?.code === 'PGRST116' ? 404 : 500;
        return NextResponse.json(
            { error: fetchErr?.code === 'PGRST116' ? 'Invoice not found' : supabaseErrorMessage(fetchErr) },
            { status }
        );
    }

    const rowWs = existing.workspace || 'tarun';
    if (rowWs !== auth.workspace) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const { error } = await supabase
        .from('invoices')
        .update({
            name: name || 'Untitled Invoice',
            data: invoiceData || {},
            settings: settings || {},
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('workspace', auth.workspace);

    if (error) {
        return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }
    return NextResponse.json({ message: 'Invoice updated' });
}

export async function DELETE(request, { params }) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ error: sb.error }, { status: 503 });
    }
    const supabase = sb.client;

    const { id } = await params;

    const { data: meta, error: metaErr } = await supabase
        .from('invoices')
        .select('year, workspace')
        .eq('id', id)
        .eq('workspace', auth.workspace)
        .maybeSingle();

    if (metaErr) {
        return NextResponse.json({ error: supabaseErrorMessage(metaErr) }, { status: 500 });
    }

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('workspace', auth.workspace);

    if (error) {
        return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }

    if (meta?.workspace === 'vagmi') {
        const rx = await reindexVagmiSequentialInvoiceNumbers(supabase, meta.year);
        if (!rx.ok) {
            return NextResponse.json(
                { error: `Invoice deleted but invoice numbers could not be updated: ${rx.error}` },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ message: 'Invoice deleted' });
}
