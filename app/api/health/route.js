import { NextResponse } from 'next/server';
import { getSupabase, supabaseErrorMessage } from '../../../lib/supabase';

// Never cache: every ping must reach the database.
export const dynamic = 'force-dynamic';

/**
 * Public keep-alive for UptimeRobot. Runs one tiny real query so Supabase's free tier
 * counts the project as active (it pauses after 7 days without database queries).
 * Returns no invoice data; 503 when the database is unreachable so the monitor alerts.
 */
export async function GET() {
    const sb = getSupabase();
    if (sb.error) {
        return NextResponse.json({ ok: false, error: sb.error }, { status: 503 });
    }

    const { error } = await sb.client.from('invoices').select('id', { head: true, count: 'exact' }).limit(1);

    if (error) {
        console.error('[health] Supabase query failed:', error);
        return NextResponse.json({ ok: false, error: supabaseErrorMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
