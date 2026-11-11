-- Tech Made Easy · atomic admin session cancellation
-- Apply only to project sfevsibnojkkqeyhoeco (tech-made-easy-dev).
-- Mirrors the security model of tech_approve_request / tech_decline_request.

CREATE OR REPLACE FUNCTION public.tech_cancel_session(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sess public.tech_sessions%ROWTYPE;
  v_session_id UUID;
  cancelled_bookings INT := 0;
BEGIN
  IF NOT public.is_tech_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_forbidden');
  END IF;

  BEGIN
    v_session_id := (payload->>'session_id')::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_bad_session');
  END;

  IF v_session_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_bad_session');
  END IF;

  SELECT * INTO sess
  FROM public.tech_sessions
  WHERE id = v_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;

  -- Heal leftover confirmed bookings if the session was already cancelled
  -- by a prior non-atomic client path; do not rewrite the session row.
  IF sess.status = 'cancelled' THEN
    UPDATE public.tech_bookings
      SET status = 'cancelled',
          cancelled_at = COALESCE(cancelled_at, pg_catalog.now())
      WHERE session_id = sess.id
        AND status = 'confirmed';
    GET DIAGNOSTICS cancelled_bookings = ROW_COUNT;
    RETURN jsonb_build_object(
      'ok', true,
      'session_id', sess.id,
      'already_cancelled', true,
      'cancelled_bookings', cancelled_bookings
    );
  END IF;

  IF sess.status NOT IN ('published', 'draft') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_cancellable');
  END IF;

  UPDATE public.tech_sessions
    SET status = 'cancelled'
    WHERE id = sess.id;

  UPDATE public.tech_bookings
    SET status = 'cancelled',
        cancelled_at = pg_catalog.now()
    WHERE session_id = sess.id
      AND status = 'confirmed';
  GET DIAGNOSTICS cancelled_bookings = ROW_COUNT;

  RETURN jsonb_build_object(
    'ok', true,
    'session_id', sess.id,
    'already_cancelled', false,
    'cancelled_bookings', cancelled_bookings
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_cancel_session(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tech_cancel_session(JSONB) TO authenticated;
