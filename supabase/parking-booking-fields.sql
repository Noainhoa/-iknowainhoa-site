-- Run if you already created parking_bookings without these columns.
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_surnames TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni TEXT;
