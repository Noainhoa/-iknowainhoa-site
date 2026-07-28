-- Public seasonal tariffs for Parking Guardamar Centro.
-- Safe to re-run. Creates admin helper if missing, then rates + public RPC.

-- 1) Admin allowlist + is_parking_admin() (needed for RLS on parking_rates)
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

-- Replace with your real admin login email(s) if not already seeded.
INSERT INTO parking_admin_allowlist (email)
VALUES ('ainhoaferrandis@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2) Rates table
CREATE TABLE IF NOT EXISTS parking_rates (
  season TEXT PRIMARY KEY
    CHECK (season IN ('summer', 'september', 'winter')),
  day_eur NUMERIC(10, 2),
  week_eur NUMERIC(10, 2),
  month_eur NUMERIC(10, 2),
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION parking_rates_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS parking_rates_updated_at ON parking_rates;
CREATE TRIGGER parking_rates_updated_at
  BEFORE UPDATE ON parking_rates
  FOR EACH ROW EXECUTE FUNCTION parking_rates_set_updated_at();

INSERT INTO parking_rates (
  season, day_eur, week_eur, month_eur, label_es, label_en, label_fr, sort_order
) VALUES
  (
    'summer', 10, 70, NULL,
    'Junio–agosto', 'June–August', 'Juin–août', 1
  ),
  (
    'september', NULL, 50, NULL,
    'Septiembre', 'September', 'Septembre', 2
  ),
  (
    'winter', NULL, NULL, 75,
    'Octubre–mayo', 'October–May', 'Octobre–mai', 3
  )
ON CONFLICT (season) DO NOTHING;

ALTER TABLE parking_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parking_rates_admin_all ON parking_rates;
CREATE POLICY parking_rates_admin_all
  ON parking_rates
  FOR ALL
  TO authenticated
  USING (public.is_parking_admin())
  WITH CHECK (public.is_parking_admin());

CREATE OR REPLACE FUNCTION public.parking_public_rates()
RETURNS TABLE (
  season TEXT,
  day_eur NUMERIC,
  week_eur NUMERIC,
  month_eur NUMERIC,
  label_es TEXT,
  label_en TEXT,
  label_fr TEXT,
  sort_order SMALLINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    r.season,
    r.day_eur,
    r.week_eur,
    r.month_eur,
    r.label_es,
    r.label_en,
    r.label_fr,
    r.sort_order
  FROM parking_rates r
  ORDER BY r.sort_order, r.season;
$$;

REVOKE ALL ON FUNCTION public.parking_public_rates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parking_public_rates() TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
