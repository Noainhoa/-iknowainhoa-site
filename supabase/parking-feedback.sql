-- Private ops feedback from the public parking page.
-- Safe to re-run. Requires is_parking_admin() (parking-admin-rls.sql / parking-rates.sql).

DO $$ BEGIN
  CREATE TYPE parking_feedback_mood AS ENUM ('good', 'ok', 'problem');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE parking_feedback_status AS ENUM ('new', 'read', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS parking_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locale TEXT,
  mood parking_feedback_mood,
  message TEXT NOT NULL,
  reference TEXT,
  page_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status parking_feedback_status NOT NULL DEFAULT 'new',
  CONSTRAINT parking_feedback_message_len CHECK (
    char_length(btrim(message)) BETWEEN 3 AND 1000
  ),
  CONSTRAINT parking_feedback_reference_len CHECK (
    reference IS NULL OR char_length(btrim(reference)) BETWEEN 1 AND 80
  )
);

CREATE INDEX IF NOT EXISTS parking_feedback_created_at_idx
  ON parking_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS parking_feedback_status_idx
  ON parking_feedback (status, created_at DESC);

ALTER TABLE parking_feedback ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.parking_feedback TO authenticated;
-- Public writes go through parking_submit_feedback() only.
REVOKE INSERT, DELETE ON public.parking_feedback FROM anon, authenticated;
GRANT ALL ON public.parking_feedback TO service_role;

DROP POLICY IF EXISTS parking_feedback_admin_select ON parking_feedback;
DROP POLICY IF EXISTS parking_feedback_admin_update ON parking_feedback;

CREATE POLICY parking_feedback_admin_select
  ON parking_feedback
  FOR SELECT
  TO authenticated
  USING (public.is_parking_admin());

CREATE POLICY parking_feedback_admin_update
  ON parking_feedback
  FOR UPDATE
  TO authenticated
  USING (public.is_parking_admin())
  WITH CHECK (public.is_parking_admin());

DROP FUNCTION IF EXISTS public.parking_submit_feedback(TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.parking_submit_feedback(
  p_message TEXT,
  p_mood TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_locale TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_contact_name TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  msg TEXT := btrim(coalesce(p_message, ''));
  ref TEXT := NULLIF(btrim(coalesce(p_reference, '')), '');
  mood_val parking_feedback_mood;
  new_id UUID;
BEGIN
  IF char_length(msg) < 3 OR char_length(msg) > 1000 THEN
    RAISE EXCEPTION 'invalid message length';
  END IF;

  IF ref IS NOT NULL AND char_length(ref) > 80 THEN
    RAISE EXCEPTION 'invalid reference length';
  END IF;

  IF p_mood IS NULL OR btrim(p_mood) = '' THEN
    mood_val := NULL;
  ELSIF lower(btrim(p_mood)) IN ('good', 'ok', 'problem') THEN
    mood_val := lower(btrim(p_mood))::parking_feedback_mood;
  ELSE
    RAISE EXCEPTION 'invalid mood';
  END IF;

  INSERT INTO parking_feedback (
    message,
    mood,
    reference,
    locale,
    page_url,
    contact_name,
    contact_email,
    contact_phone
  ) VALUES (
    msg,
    mood_val,
    ref,
    NULLIF(left(btrim(coalesce(p_locale, '')), 8), ''),
    NULLIF(left(btrim(coalesce(p_page_url, '')), 500), ''),
    NULLIF(left(btrim(coalesce(p_contact_name, '')), 80), ''),
    NULLIF(left(btrim(coalesce(p_contact_email, '')), 120), ''),
    NULLIF(left(btrim(coalesce(p_contact_phone, '')), 40), '')
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.parking_submit_feedback(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parking_submit_feedback(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
