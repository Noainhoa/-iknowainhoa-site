-- Optional reply details on private parking feedback.
-- Safe to re-run. Adds columns, then replaces parking_submit_feedback.

ALTER TABLE public.parking_feedback
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

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
