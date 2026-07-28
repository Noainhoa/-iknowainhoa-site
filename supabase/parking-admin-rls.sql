-- Restrict parking admin access to an explicit email allowlist.
-- Run after parking.sql (or use the bootstrap in parking-rates.sql).
-- Replace the email below with your real admin account if needed.

CREATE TABLE IF NOT EXISTS parking_admin_allowlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE parking_admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_parking_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM parking_admin_allowlist a
    WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_parking_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_parking_admin() TO authenticated;

INSERT INTO parking_admin_allowlist (email)
VALUES ('ainhoaferrandis@gmail.com')
ON CONFLICT (email) DO NOTHING;

DROP POLICY IF EXISTS parking_bookings_admin_all ON parking_bookings;
CREATE POLICY parking_bookings_admin_all
  ON parking_bookings
  FOR ALL
  TO authenticated
  USING (public.is_parking_admin())
  WITH CHECK (public.is_parking_admin());

DROP POLICY IF EXISTS "parking_dni_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "parking_dni_delete_authenticated" ON storage.objects;

CREATE POLICY "parking_dni_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'parking-dni' AND public.is_parking_admin());

CREATE POLICY "parking_dni_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'parking-dni' AND public.is_parking_admin());

CREATE POLICY "parking_dni_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'parking-dni' AND public.is_parking_admin())
  WITH CHECK (bucket_id = 'parking-dni' AND public.is_parking_admin());

CREATE POLICY "parking_dni_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'parking-dni' AND public.is_parking_admin());

NOTIFY pgrst, 'reload schema';
