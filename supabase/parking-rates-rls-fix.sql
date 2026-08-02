-- Fix: admin rate saves failing with RLS on parking_rates.
-- Safe to re-run after parking-rates.sql.

CREATE OR REPLACE FUNCTION public.is_parking_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  claim_email text;
BEGIN
  claim_email := lower(coalesce(
    nullif(auth.jwt() ->> 'email', ''),
    (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()),
    ''
  ));
  IF claim_email = '' THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM parking_admin_allowlist a
    WHERE lower(a.email) = claim_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_parking_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_parking_admin() TO authenticated;

INSERT INTO parking_admin_allowlist (email)
VALUES
  ('ainhoaferrandis@gmail.com'),
  ('noafp@icloud.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO parking_admin_allowlist (email)
SELECT lower(u.email)
FROM auth.users u
WHERE u.email IS NOT NULL AND u.email <> ''
ON CONFLICT (email) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parking_rates TO authenticated;

DROP POLICY IF EXISTS parking_rates_admin_all ON parking_rates;
CREATE POLICY parking_rates_admin_all
  ON parking_rates
  FOR ALL
  TO authenticated
  USING (public.is_parking_admin())
  WITH CHECK (public.is_parking_admin());

CREATE OR REPLACE FUNCTION public.parking_admin_upsert_rates(
  p_rows jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  item jsonb;
BEGIN
  IF NOT public.is_parking_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    INSERT INTO parking_rates AS r (
      season, day_eur, week_eur, month_eur,
      label_es, label_en, label_fr, sort_order
    ) VALUES (
      item ->> 'season',
      NULLIF(item ->> 'day_eur', '')::numeric,
      NULLIF(item ->> 'week_eur', '')::numeric,
      NULLIF(item ->> 'month_eur', '')::numeric,
      COALESCE(item ->> 'label_es', ''),
      COALESCE(item ->> 'label_en', ''),
      COALESCE(item ->> 'label_fr', ''),
      COALESCE((item ->> 'sort_order')::smallint, 0)
    )
    ON CONFLICT (season) DO UPDATE SET
      day_eur = EXCLUDED.day_eur,
      week_eur = EXCLUDED.week_eur,
      month_eur = EXCLUDED.month_eur,
      label_es = EXCLUDED.label_es,
      label_en = EXCLUDED.label_en,
      label_fr = EXCLUDED.label_fr,
      sort_order = EXCLUDED.sort_order,
      updated_at = now();
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.parking_admin_upsert_rates(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parking_admin_upsert_rates(jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
