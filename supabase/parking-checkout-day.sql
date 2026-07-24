-- Checkout / exit day stays free for the next booking.
-- Occupancy is half-open [start_date, end_date): end_date may start a new stay.
-- Same-day rows (start = end) still occupy that single day.
-- Run in Supabase SQL Editor (idempotent).

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
