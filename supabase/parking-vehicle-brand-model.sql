-- Split vehicle identity into brand + model (keep vehicle_description as free-text).
-- Idempotent; safe to re-run. Includes PostgREST schema cache reload.
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS vehicle_brand TEXT;
ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS vehicle_model TEXT;

UPDATE parking_bookings
SET
  vehicle_brand = CASE
    WHEN vehicle_description ILIKE 'Mercedes%' THEN 'Mercedes'
    WHEN vehicle_description ILIKE 'Bikes%' OR vehicle_description ILIKE 'Bicicleta%' THEN 'Bikes'
    ELSE NULL
  END,
  vehicle_model = CASE
    WHEN vehicle_description ILIKE 'Mercedes%' THEN trim(regexp_replace(vehicle_description, '^Mercedes\s*', '', 'i'))
    WHEN vehicle_description ILIKE 'Bikes%' THEN trim(regexp_replace(vehicle_description, '^Bikes\s*', '', 'i'))
    WHEN vehicle_description IS NOT NULL AND btrim(vehicle_description) <> '' THEN vehicle_description
    ELSE NULL
  END
WHERE vehicle_brand IS NULL AND vehicle_model IS NULL
  AND vehicle_description IS NOT NULL
  AND btrim(vehicle_description) <> '';

NOTIFY pgrst, 'reload schema';
