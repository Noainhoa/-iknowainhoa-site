-- Prevent hard-deleting parking bookings from the admin client.
-- Cancel by setting status = 'cancelled' instead. Idempotent.

DROP POLICY IF EXISTS parking_bookings_admin_all ON parking_bookings;
DROP POLICY IF EXISTS parking_bookings_admin_select ON parking_bookings;
DROP POLICY IF EXISTS parking_bookings_admin_insert ON parking_bookings;
DROP POLICY IF EXISTS parking_bookings_admin_update ON parking_bookings;
DROP POLICY IF EXISTS parking_bookings_admin_delete ON parking_bookings;

CREATE POLICY parking_bookings_admin_select
  ON parking_bookings
  FOR SELECT
  TO authenticated
  USING (public.is_parking_admin());

CREATE POLICY parking_bookings_admin_insert
  ON parking_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_parking_admin());

CREATE POLICY parking_bookings_admin_update
  ON parking_bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_parking_admin())
  WITH CHECK (public.is_parking_admin());

-- Intentionally no DELETE policy for authenticated admins.
REVOKE DELETE ON parking_bookings FROM authenticated;
