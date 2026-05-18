import { NextResponse } from 'next/server';
import { getSupabase, supabaseErrorMessage } from '../../../lib/supabase';
import { resolveWorkspaceRequest } from '../../../lib/workspace-auth';
import { reindexVagmiSequentialInvoiceNumbers } from '../../../lib/vagmi-invoice-index';

export async function GET(request) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ error: sb.error }, { status: 503 });
    }
    const supabase = sb.client;

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    const { data, error } = await supabase
        .from('invoices')
        .select('id, name, month, year, workspace, created_at, updated_at')
        .eq('workspace', auth.workspace)
        .eq('year', year)
        .order('month', { ascending: true });

    if (error) {
        return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }
    return NextResponse.json(data);
}

export async function POST(request) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ error: sb.error }, { status: 503 });
    }
    const supabase = sb.client;

    const body = await request.json();
    const { month: rawMonth, year: rawYear, data: invoiceData, settings, name } = body || {};

    const month = Number.parseInt(String(rawMonth), 10);
    const year = Number.parseInt(String(rawYear), 10);

    if (
        !Number.isFinite(month) ||
        !Number.isFinite(year) ||
        month < 1 ||
        month > 12 ||
        year < 1900 ||
        year > 2100
    ) {
        return NextResponse.json(
            { error: 'Valid month (1–12) and year are required' },
            { status: 400 }
        );
    }

    const workspace = auth.workspace;

    async function respondSaved(id, message) {
        if (workspace === 'vagmi') {
            const rx = await reindexVagmiSequentialInvoiceNumbers(supabase, year);
            if (!rx.ok) {
                return NextResponse.json({ error: rx.error }, { status: 500 });
            }
        }
        return NextResponse.json({ id, message });
    }

    const displayName =
        name?.trim?.() ||
        `Invoice_${year}_${String(month).padStart(2, '0')}`;
    const payload = {
        name: displayName,
        data: invoiceData ?? {},
        settings: settings ?? {},
        updated_at: new Date().toISOString(),
    };

    async function updateByWorkspaceMonthYear() {
        return await supabase
            .from('invoices')
            .update(payload)
            .eq('workspace', workspace)
            .eq('month', month)
            .eq('year', year)
            .select('id')
            .limit(2);
    }

    async function insertRow() {
        return await supabase
            .from('invoices')
            .insert({
                workspace,
                month,
                year,
                name: payload.name,
                data: payload.data,
                settings: payload.settings,
            })
            .select('id')
            .single();
    }

    let { data: updatedList, error: updateErr } = await updateByWorkspaceMonthYear();
    if (updateErr) {
        return NextResponse.json({ error: supabaseErrorMessage(updateErr) }, { status: 500 });
    }
    if (updatedList?.length >= 1) {
        const id = updatedList[0].id;
        if (updatedList.length > 1) {
            console.warn(
                '[invoices] duplicate rows for workspace=%s month=%s year=%s; updated first row id=%s',
                workspace,
                month,
                year,
                id
            );
        }
        return respondSaved(id, 'Invoice updated');
    }

    let { data: inserted, error: insertErr } = await insertRow();

    if (insertErr?.code === '23505') {
        const retry = await updateByWorkspaceMonthYear();
        if (retry.error) {
            return NextResponse.json({ error: supabaseErrorMessage(retry.error) }, { status: 500 });
        }
        const row = retry.data?.[0];
        if (row) {
            return respondSaved(row.id, 'Invoice updated');
        }
        return NextResponse.json(
            { error: 'Could not save invoice after conflict; try again' },
            { status: 409 }
        );
    }

    if (insertErr) {
        return NextResponse.json({ error: supabaseErrorMessage(insertErr) }, { status: 500 });
    }

    return respondSaved(inserted.id, 'Invoice created');
}
