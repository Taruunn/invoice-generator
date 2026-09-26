-- =============================================================================
-- One-time cleanup: the Vagmi workspace was removed from the app.
-- Run in Supabase → SQL Editor. This permanently deletes Vagmi's saved invoices
-- and master prefill. Run the SELECTs first to see what will go.
-- =============================================================================

SELECT id, month, year, name FROM invoices WHERE workspace = 'vagmi';
SELECT workspace, updated_at FROM invoice_prefills WHERE workspace = 'vagmi';

DELETE FROM invoices WHERE workspace = 'vagmi';
DELETE FROM invoice_prefills WHERE workspace = 'vagmi';
