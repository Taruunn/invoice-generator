import { supabaseErrorMessage } from './supabase';

/**
 * Vagmi workspace: invoice # is 1…n by chronological month order within a year
 * (first calendar month saved → #1; adding an earlier month renumbers everyone).
 * Tarun keeps invoice # = calendar month (1–12).
 */

/**
 * Provisional # shown in the editor before save (same rule as post-save reindex).
 * @param {number} monthNum – calendar month 1–12 being created
 * @param {number[]} savedMonthsThisYear – months that already have saved invoices (same workspace & year)
 */
export function vagmiSequentialInvoiceNo(monthNum, savedMonthsThisYear) {
    const s = new Set(
        (savedMonthsThisYear || [])
            .map((m) => Number(m))
            .filter((m) => Number.isFinite(m) && m >= 1 && m <= 12)
    );
    s.add(monthNum);
    const sorted = [...s].sort((a, b) => a - b);
    const idx = sorted.indexOf(monthNum);
    return String(idx >= 0 ? idx + 1 : 1);
}

export async function reindexVagmiSequentialInvoiceNumbers(supabase, year) {
    const { data: rows, error } = await supabase
        .from('invoices')
        .select('id, month, data')
        .eq('workspace', 'vagmi')
        .eq('year', year)
        .order('month', { ascending: true });

    if (error) {
        return { ok: false, error: supabaseErrorMessage(error) };
    }

    const list = rows || [];
    for (let i = 0; i < list.length; i++) {
        const row = list[i];
        const prevData = row.data && typeof row.data === 'object' ? row.data : {};
        const newNo = String(i + 1);
        if (String(prevData.invoiceNo) === newNo) continue;

        const newData = { ...prevData, invoiceNo: newNo };
        const { error: upErr } = await supabase
            .from('invoices')
            .update({
                data: newData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', row.id);

        if (upErr) {
            return { ok: false, error: supabaseErrorMessage(upErr) };
        }
    }

    return { ok: true };
}
