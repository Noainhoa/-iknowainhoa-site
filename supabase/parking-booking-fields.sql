-- Run if you already created parking_bookings without these columns.
-- Idempotent; safe to re-run. Includes PostgREST schema cache reload.
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_surnames TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni_image_path TEXT;
NOTIFY pgrst, 'reload schema';
