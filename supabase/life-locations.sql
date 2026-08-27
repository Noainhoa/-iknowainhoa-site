-- Life locations migration for existing ainhoa-life databases.
-- Safe to re-run (IF NOT EXISTS / conditional policy updates).
-- Run in Supabase SQL Editor after supabase/life.sql.

-- ---------------------------------------------------------------------------
-- life_locations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS life_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  full_address TEXT NULL,
  google_place_id TEXT NULL,
  latitude DOUBLE PRECISION NULL,
  longitude DOUBLE PRECISION NULL,
  country TEXT NULL,
  country_code TEXT NULL,
  region TEXT NULL,
  city TEXT NULL,
  postal_code TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS life_locations_user_id_idx ON life_locations (user_id);
CREATE INDEX IF NOT EXISTS life_locations_user_place_idx ON life_locations (user_id, google_place_id)
  WHERE google_place_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- life_entries.location_id
-- ---------------------------------------------------------------------------

ALTER TABLE life_entries
  ADD COLUMN IF NOT EXISTS location_id UUID NULL REFERENCES life_locations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS life_entries_location_id_idx ON life_entries (location_id)
  WHERE location_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- updated_at trigger (life_locations)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION life_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS life_locations_set_updated_at ON life_locations;
CREATE TRIGGER life_locations_set_updated_at
  BEFORE UPDATE ON life_locations
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — life_locations
-- ---------------------------------------------------------------------------

ALTER TABLE life_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS life_locations_select_own ON life_locations;
CREATE POLICY life_locations_select_own
  ON life_locations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS life_locations_insert_own ON life_locations;
CREATE POLICY life_locations_insert_own
  ON life_locations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS life_locations_update_own ON life_locations;
CREATE POLICY life_locations_update_own
  ON life_locations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS life_locations_delete_own ON life_locations;
CREATE POLICY life_locations_delete_own
  ON life_locations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- life_entries — require linked location ownership when location_id is set
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS life_entries_insert_own ON life_entries;
CREATE POLICY life_entries_insert_own
  ON life_entries FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_tracks t
      WHERE t.id = track_id AND t.user_id = auth.uid()
    )
    AND (
      location_id IS NULL
      OR EXISTS (
        SELECT 1 FROM life_locations l
        WHERE l.id = location_id AND l.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS life_entries_update_own ON life_entries;
CREATE POLICY life_entries_update_own
  ON life_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_tracks t
      WHERE t.id = track_id AND t.user_id = auth.uid()
    )
    AND (
      location_id IS NULL
      OR EXISTS (
        SELECT 1 FROM life_locations l
        WHERE l.id = location_id AND l.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Table privileges
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.life_locations TO authenticated;

NOTIFY pgrst, 'reload schema';
