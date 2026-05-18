import { NextResponse } from 'next/server';
import { getSupabase, supabaseErrorMessage } from '../../../lib/supabase';
import { resolveWorkspaceRequest } from '../../../lib/workspace-auth';

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

    const { data, error } = await supabase
        .from('invoice_prefills')
        .select('data, updated_at')
        .eq('workspace', auth.workspace)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json({
        workspace: auth.workspace,
        data: data?.data ?? {},
        updated_at: data?.updated_at ?? null,
    });
}

export async function PUT(request) {
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
    const patch = body?.data;
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
        return NextResponse.json({ error: 'Body must include a JSON object `data`' }, { status: 400 });
    }

    const row = {
        workspace: auth.workspace,
        data: patch,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('invoice_prefills').upsert(row, {
        onConflict: 'workspace',
    });

    if (error) {
        return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, workspace: auth.workspace });
}
