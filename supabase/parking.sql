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

ALTER TABLE parking_bookings DROP CONSTRAINT IF EXISTS parking_bookings_no_overlap;
ALTER TABLE parking_bookings
  ADD CONSTRAINT parking_bookings_no_overlap
  EXCLUDE USING gist (
    daterange(start_date, end_date, '[]') WITH &&
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

-- No anon policies on the base table (private fields stay protected).

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

-- Optional convenience view (same SECURITY DEFINER function under the hood if preferred).
CREATE OR REPLACE VIEW parking_public_availability AS
SELECT * FROM public.parking_unavailable_ranges();

GRANT SELECT ON parking_public_availability TO anon, authenticated;
