-- Parking availability — Supabase setup
-- Run this in the Supabase SQL editor for your project.

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$ BEGIN
  CREATE TYPE parking_booking_status AS ENUM (
    'reserved',
    'completed',
    'blocked',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS parking_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status parking_booking_status NOT NULL,
  customer_name TEXT,
  customer_surnames TEXT,
  customer_dni TEXT,
  customer_dni_image_path TEXT,
  customer_phone TEXT,
  vehicle_registration TEXT,
  vehicle_description TEXT,
  arrival_time TIME,
  departure_time TIME,
  price_eur NUMERIC(10, 2),
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT parking_bookings_dates_ok CHECK (end_date >= start_date)
);

ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_surnames TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni_image_path TEXT;

ALTER TABLE parking_bookings DROP CONSTRAINT IF EXISTS parking_bookings_no_overlap;
ALTER TABLE parking_bookings
  ADD CONSTRAINT parking_bookings_no_overlap
  EXCLUDE USING gist (
    daterange(
      start_date,
      CASE
        WHEN end_date = start_date THEN end_date + 1
        ELSE end_date
      END,
      '[)'
    ) WITH &&
  )
  WHERE (status IN ('reserved', 'blocked'));

CREATE OR REPLACE FUNCTION parking_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS parking_bookings_updated_at ON parking_bookings;
CREATE TRIGGER parking_bookings_updated_at
  BEFORE UPDATE ON parking_bookings
  FOR EACH ROW EXECUTE FUNCTION parking_set_updated_at();

ALTER TABLE parking_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parking_bookings_admin_all ON parking_bookings;
CREATE POLICY parking_bookings_admin_all
  ON parking_bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.parking_unavailable_ranges()
RETURNS TABLE (
  id UUID,
  start_date DATE,
  end_date DATE,
  availability TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.start_date,
    b.end_date,
    'unavailable'::text AS availability
  FROM parking_bookings b
  WHERE b.status IN ('reserved', 'blocked', 'completed');
$$;

REVOKE ALL ON FUNCTION public.parking_unavailable_ranges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parking_unavailable_ranges() TO anon, authenticated;

-- Prefer RPC over a SECURITY DEFINER view (avoids advisor lint).
DROP VIEW IF EXISTS public.parking_public_availability;

-- Private bucket for DNI images (admin only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'parking-dni',
  'parking-dni',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "parking_dni_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_delete_authenticated" ON storage.objects;

CREATE POLICY "parking_dni_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'parking-dni');

CREATE POLICY "parking_dni_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'parking-dni');

CREATE POLICY "parking_dni_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'parking-dni')
  WITH CHECK (bucket_id = 'parking-dni');

CREATE POLICY "parking_dni_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'parking-dni');
