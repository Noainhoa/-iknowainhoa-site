-- Run if parking_bookings / storage already exist without DNI image support.

ALTER TABLE parking_bookings ADD COLUMN IF NOT EXISTS customer_dni_image_path TEXT;

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

DROP VIEW IF EXISTS public.parking_public_availability;
