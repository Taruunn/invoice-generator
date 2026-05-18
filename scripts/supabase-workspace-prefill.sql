-- =============================================================================
-- Workspace support for invoices (run once in Supabase → SQL Editor → Run)
-- Fixes: "column invoices.workspace does not exist"
-- =============================================================================

-- 1) Add column; existing rows become workspace = 'tarun' automatically.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS workspace TEXT NOT NULL DEFAULT 'tarun';

-- 2) Allow the same calendar month for both people: unique per workspace + year + month.
--    If you never created this index, DROP INDEX is harmless.
DROP INDEX IF EXISTS unique_year_month;

CREATE UNIQUE INDEX IF NOT EXISTS unique_workspace_year_month ON invoices (workspace, year, month);

-- 3) Master prefill table (dashboard “Master prefill”).
CREATE TABLE IF NOT EXISTS invoice_prefills (
    workspace TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE invoice_prefills IS 'Master prefill JSON per workspace (merged into new invoices).';

-- Lock direct browser access (anon/authenticated keys). Next.js API uses the service role, which bypasses RLS.
ALTER TABLE invoice_prefills ENABLE ROW LEVEL SECURITY;

-- Optional: confirm column exists
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'workspace';
