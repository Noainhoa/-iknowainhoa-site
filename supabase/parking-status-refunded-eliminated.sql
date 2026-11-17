-- Soft statuses: refunded + eliminated (bin). Never hard-delete.
-- Idempotent.

ALTER TYPE parking_booking_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE parking_booking_status ADD VALUE IF NOT EXISTS 'eliminated';

-- Public calendar: cancelled / refunded / eliminated free the spot.
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
