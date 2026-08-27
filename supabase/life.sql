-- Life feature: private personal timeline data (groups, tracks, entries, relations).
-- Run in Supabase SQL Editor. Requires Supabase Auth (auth.users).
-- Independent from Parking tables and RPCs.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS life_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS life_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES life_groups (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS life_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES life_tracks (id) ON DELETE CASCADE,
  location_id UUID NULL REFERENCES life_locations (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('event', 'period')),
  start_date DATE NOT NULL,
  start_precision TEXT NOT NULL CHECK (
    start_precision IN ('exact', 'month', 'year', 'approximate')
  ),
  end_date DATE NULL,
  end_precision TEXT NULL CHECK (
    end_precision IS NULL
    OR end_precision IN ('exact', 'month', 'year', 'approximate')
  ),
  is_ongoing BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS life_entry_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  from_entry_id UUID NOT NULL REFERENCES life_entries (id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES life_entries (id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT life_entry_relations_distinct CHECK (from_entry_id <> to_entry_id),
  CONSTRAINT life_entry_relations_unique UNIQUE (from_entry_id, to_entry_id, relation_type)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS life_groups_user_id_idx ON life_groups (user_id);
CREATE INDEX IF NOT EXISTS life_groups_user_sort_idx ON life_groups (user_id, sort_order);

CREATE INDEX IF NOT EXISTS life_tracks_user_id_idx ON life_tracks (user_id);
CREATE INDEX IF NOT EXISTS life_tracks_group_id_idx ON life_tracks (group_id);
CREATE INDEX IF NOT EXISTS life_tracks_user_group_sort_idx ON life_tracks (user_id, group_id, sort_order);

CREATE INDEX IF NOT EXISTS life_locations_user_id_idx ON life_locations (user_id);
CREATE INDEX IF NOT EXISTS life_locations_user_place_idx ON life_locations (user_id, google_place_id)
  WHERE google_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS life_entries_user_id_idx ON life_entries (user_id);
CREATE INDEX IF NOT EXISTS life_entries_track_id_idx ON life_entries (track_id);
CREATE INDEX IF NOT EXISTS life_entries_location_id_idx ON life_entries (location_id)
  WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS life_entries_user_track_start_idx ON life_entries (user_id, track_id, start_date);

CREATE INDEX IF NOT EXISTS life_entry_relations_user_id_idx ON life_entry_relations (user_id);
CREATE INDEX IF NOT EXISTS life_entry_relations_from_idx ON life_entry_relations (from_entry_id);
CREATE INDEX IF NOT EXISTS life_entry_relations_to_idx ON life_entry_relations (to_entry_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
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

DROP TRIGGER IF EXISTS life_groups_set_updated_at ON life_groups;
CREATE TRIGGER life_groups_set_updated_at
  BEFORE UPDATE ON life_groups
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

DROP TRIGGER IF EXISTS life_tracks_set_updated_at ON life_tracks;
CREATE TRIGGER life_tracks_set_updated_at
  BEFORE UPDATE ON life_tracks
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

DROP TRIGGER IF EXISTS life_entries_set_updated_at ON life_entries;
CREATE TRIGGER life_entries_set_updated_at
  BEFORE UPDATE ON life_entries
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

DROP TRIGGER IF EXISTS life_locations_set_updated_at ON life_locations;
CREATE TRIGGER life_locations_set_updated_at
  BEFORE UPDATE ON life_locations
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE life_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_entry_relations ENABLE ROW LEVEL SECURITY;

-- life_groups
DROP POLICY IF EXISTS life_groups_select_own ON life_groups;
CREATE POLICY life_groups_select_own
  ON life_groups FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS life_groups_insert_own ON life_groups;
CREATE POLICY life_groups_insert_own
  ON life_groups FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS life_groups_update_own ON life_groups;
CREATE POLICY life_groups_update_own
  ON life_groups FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS life_groups_delete_own ON life_groups;
CREATE POLICY life_groups_delete_own
  ON life_groups FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- life_tracks
DROP POLICY IF EXISTS life_tracks_select_own ON life_tracks;
CREATE POLICY life_tracks_select_own
  ON life_tracks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS life_tracks_insert_own ON life_tracks;
CREATE POLICY life_tracks_insert_own
  ON life_tracks FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_groups g
      WHERE g.id = group_id AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS life_tracks_update_own ON life_tracks;
CREATE POLICY life_tracks_update_own
  ON life_tracks FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_groups g
      WHERE g.id = group_id AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS life_tracks_delete_own ON life_tracks;
CREATE POLICY life_tracks_delete_own
  ON life_tracks FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- life_locations
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

-- life_entries
DROP POLICY IF EXISTS life_entries_select_own ON life_entries;
CREATE POLICY life_entries_select_own
  ON life_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid());

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

DROP POLICY IF EXISTS life_entries_delete_own ON life_entries;
CREATE POLICY life_entries_delete_own
  ON life_entries FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- life_entry_relations
DROP POLICY IF EXISTS life_entry_relations_select_own ON life_entry_relations;
CREATE POLICY life_entry_relations_select_own
  ON life_entry_relations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS life_entry_relations_insert_own ON life_entry_relations;
CREATE POLICY life_entry_relations_insert_own
  ON life_entry_relations FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_entries e
      WHERE e.id = from_entry_id AND e.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM life_entries e
      WHERE e.id = to_entry_id AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS life_entry_relations_update_own ON life_entry_relations;
CREATE POLICY life_entry_relations_update_own
  ON life_entry_relations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM life_entries e
      WHERE e.id = from_entry_id AND e.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM life_entries e
      WHERE e.id = to_entry_id AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS life_entry_relations_delete_own ON life_entry_relations;
CREATE POLICY life_entry_relations_delete_own
  ON life_entry_relations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Table privileges (required when "Automatically expose new tables" is off)
-- RLS policies above still enforce row ownership; grants only allow the role
-- to attempt operations that policies then filter.
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.life_groups,
  public.life_tracks,
  public.life_locations,
  public.life_entries,
  public.life_entry_relations
TO authenticated;

-- No sequence grants: primary keys use gen_random_uuid(), not serial/identity.

NOTIFY pgrst, 'reload schema';
