-- Life entry_status migration for existing ainhoa-life databases.
-- Safe to re-run (IF NOT EXISTS / conditional constraint).
-- Run in Supabase SQL Editor after supabase/life.sql.

-- ---------------------------------------------------------------------------
-- life_entries.entry_status
-- ---------------------------------------------------------------------------

ALTER TABLE life_entries
  ADD COLUMN IF NOT EXISTS entry_status TEXT NOT NULL DEFAULT 'complete';

UPDATE life_entries
SET entry_status = 'complete'
WHERE entry_status IS NULL;

ALTER TABLE life_entries
  ALTER COLUMN entry_status SET DEFAULT 'complete';

ALTER TABLE life_entries
  ALTER COLUMN entry_status SET NOT NULL;

ALTER TABLE life_entries
  DROP CONSTRAINT IF EXISTS life_entries_entry_status_check;

ALTER TABLE life_entries
  ADD CONSTRAINT life_entries_entry_status_check
  CHECK (entry_status IN ('skeleton', 'complete'));
