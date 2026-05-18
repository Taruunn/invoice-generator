import { createClient } from '@supabase/supabase-js';

let client;
let cachedConfigError;

function stripQuotes(s) {
    const t = String(s).trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1).trim();
    }
    return t;
}

function readConfig() {
    const url = stripQuotes(process.env.SUPABASE_URL || '');
    const key = stripQuotes(
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    return { url, key };
}

/** Supabase admin client for API routes (service role). Validates env once. */
export function getSupabase() {
    if (cachedConfigError) {
        return { error: cachedConfigError };
    }
    if (client) {
        return { client };
    }

    const { url, key } = readConfig();
    if (!url || !key) {
        cachedConfigError =
            'Database is not configured: set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env, then restart next dev.';
        return { error: cachedConfigError };
    }

    if (!/^https:\/\//i.test(url)) {
        cachedConfigError =
            'SUPABASE_URL must be an https URL (see Supabase Project Settings → API → Project URL).';
        return { error: cachedConfigError };
    }

    client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return { client };
}

/**
 * Turn PostgREST / network errors into clearer API messages.
 * "TypeError: fetch failed" usually means Node could not reach SUPABASE_URL at all.
 */
export function supabaseErrorMessage(err) {
    if (!err) return 'Unknown database error';
    const msg = typeof err.message === 'string' ? err.message : String(err);
    const causeCode = err.cause?.code;
    const lower = msg.toLowerCase();

    if (
        lower.includes('fetch failed') ||
        causeCode === 'ENOTFOUND' ||
        causeCode === 'ECONNREFUSED' ||
        causeCode === 'ETIMEDOUT'
    ) {
        const hint =
            causeCode === 'ENOTFOUND'
                ? 'Host not found — confirm the ref in Supabase → Settings → API (typo, paused, or deleted project).'
                : causeCode === 'ECONNREFUSED'
                  ? 'Connection refused — firewall, VPN, or proxy may be blocking HTTPS.'
                  : causeCode === 'ETIMEDOUT'
                    ? 'Timed out — check network or Supabase project status.'
                    : 'Try `npm run dev` (IPv4-first DNS), turn off VPN briefly, and confirm the dashboard shows the project active.';
        return `Cannot reach Supabase (${msg}). ${hint}`;
    }

    return msg;
}
