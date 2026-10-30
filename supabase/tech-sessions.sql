-- Tech Made Easy · Guardamar
-- Isolated DEV migration. Apply ONLY to the Tech Made Easy Supabase project.
-- Do NOT run against Parking Guardamar Centro or ainhoa-life.
--
-- Independent of parking: admin access uses tech_admin_allowlist + is_tech_admin().
-- Visitors cannot read or write these tables. Public booking goes through
-- SECURITY DEFINER functions granted only to service_role, called by the
-- Next.js server. Confirmed sessions cannot overlap. Pending time requests
-- do not occupy the calendar.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Immutable helper so EXCLUDE / GiST expressions are valid on Postgres 17+.
CREATE OR REPLACE FUNCTION public.tech_session_ends_at(
  p_starts_at TIMESTAMPTZ,
  p_duration_minutes INT
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT p_starts_at + make_interval(mins => p_duration_minutes);
$$;

DO $$ BEGIN
  CREATE TYPE tech_session_kind AS ENUM ('group', 'individual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tech_session_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tech_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind tech_session_kind NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  capacity INT NOT NULL,
  price_cents INT NOT NULL,
  venue_label TEXT NOT NULL DEFAULT '',
  venue_public BOOLEAN NOT NULL DEFAULT false,
  status tech_session_status NOT NULL DEFAULT 'draft',
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tech_sessions_shape CHECK (
    (
      kind = 'group'
      AND duration_minutes = 75
      AND capacity BETWEEN 1 AND 5
      AND price_cents = 1000
    )
    OR (
      kind = 'individual'
      AND duration_minutes = 60
      AND capacity = 1
      AND price_cents = 2500
    )
  ),
  CONSTRAINT tech_sessions_venue_len CHECK (char_length(venue_label) <= 160)
);

ALTER TABLE tech_sessions DROP CONSTRAINT IF EXISTS tech_sessions_no_overlap;
ALTER TABLE tech_sessions
  ADD CONSTRAINT tech_sessions_no_overlap
  EXCLUDE USING gist (
    tstzrange(
      starts_at,
      public.tech_session_ends_at(starts_at, duration_minutes),
      '[)'
    ) WITH &&
  )
  WHERE (status IN ('published', 'completed'));

CREATE TABLE IF NOT EXISTS tech_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tech_blocks_range CHECK (ends_at > starts_at),
  CONSTRAINT tech_blocks_reason_len CHECK (reason IS NULL OR char_length(reason) <= 160)
);

CREATE TABLE IF NOT EXISTS tech_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES tech_sessions (id),
  public_reference TEXT NOT NULL,
  cancel_token_hash TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  booking_for_other BOOLEAN NOT NULL DEFAULT false,
  phone TEXT NOT NULL,
  phone_key TEXT NOT NULL,
  email TEXT,
  question TEXT,
  locale TEXT NOT NULL DEFAULT 'es',
  source TEXT,
  price_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  attendance TEXT NOT NULL DEFAULT 'unknown',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT tech_bookings_reference CHECK (
    public_reference ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'
  ),
  CONSTRAINT tech_bookings_token_hash CHECK (cancel_token_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT tech_bookings_status CHECK (status IN ('confirmed', 'cancelled')),
  CONSTRAINT tech_bookings_attendance CHECK (attendance IN ('unknown', 'attended', 'no_show')),
  CONSTRAINT tech_bookings_payment CHECK (payment_status IN ('unpaid', 'paid')),
  CONSTRAINT tech_bookings_locale CHECK (locale IN ('es', 'en', 'fr')),
  CONSTRAINT tech_bookings_names CHECK (
    char_length(contact_name) BETWEEN 1 AND 80
    AND char_length(attendee_name) BETWEEN 1 AND 80
  ),
  CONSTRAINT tech_bookings_phone CHECK (phone_key ~ '^[0-9]{8,15}$'),
  CONSTRAINT tech_bookings_email CHECK (email IS NULL OR char_length(email) <= 120),
  CONSTRAINT tech_bookings_question CHECK (question IS NULL OR char_length(question) <= 400)
);

CREATE UNIQUE INDEX IF NOT EXISTS tech_bookings_reference_key
  ON tech_bookings (public_reference);
CREATE UNIQUE INDEX IF NOT EXISTS tech_bookings_token_hash_key
  ON tech_bookings (cancel_token_hash);
CREATE UNIQUE INDEX IF NOT EXISTS tech_bookings_idempotency_key
  ON tech_bookings (idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS tech_bookings_one_phone_per_session
  ON tech_bookings (session_id, phone_key)
  WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS tech_bookings_session_idx
  ON tech_bookings (session_id);

CREATE TABLE IF NOT EXISTS tech_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_reference TEXT NOT NULL,
  status_token_hash TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  requested_start TIMESTAMPTZ NOT NULL,
  contact_name TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  booking_for_other BOOLEAN NOT NULL DEFAULT false,
  phone TEXT NOT NULL,
  phone_key TEXT NOT NULL,
  email TEXT,
  question TEXT,
  locale TEXT NOT NULL DEFAULT 'es',
  source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  session_id UUID REFERENCES tech_sessions (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  CONSTRAINT tech_requests_reference CHECK (
    public_reference ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'
  ),
  CONSTRAINT tech_requests_token_hash CHECK (status_token_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT tech_requests_status CHECK (status IN ('pending', 'approved', 'declined', 'cancelled')),
  CONSTRAINT tech_requests_locale CHECK (locale IN ('es', 'en', 'fr')),
  CONSTRAINT tech_requests_names CHECK (
    char_length(contact_name) BETWEEN 1 AND 80
    AND char_length(attendee_name) BETWEEN 1 AND 80
  ),
  CONSTRAINT tech_requests_phone CHECK (phone_key ~ '^[0-9]{8,15}$'),
  CONSTRAINT tech_requests_email CHECK (email IS NULL OR char_length(email) <= 120),
  CONSTRAINT tech_requests_question CHECK (question IS NULL OR char_length(question) <= 400)
);

CREATE UNIQUE INDEX IF NOT EXISTS tech_requests_reference_key
  ON tech_requests (public_reference);
CREATE UNIQUE INDEX IF NOT EXISTS tech_requests_token_hash_key
  ON tech_requests (status_token_hash);
CREATE UNIQUE INDEX IF NOT EXISTS tech_requests_idempotency_key
  ON tech_requests (idempotency_key);

CREATE TABLE IF NOT EXISTS tech_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES tech_bookings (id) ON DELETE CASCADE,
  request_id UUID REFERENCES tech_requests (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  CONSTRAINT tech_notifications_status CHECK (status IN ('pending', 'sent', 'failed')),
  CONSTRAINT tech_notifications_subject CHECK (char_length(subject) BETWEEN 1 AND 180),
  CONSTRAINT tech_notifications_body CHECK (char_length(body) BETWEEN 1 AND 4000)
);

CREATE INDEX IF NOT EXISTS tech_notifications_status_idx
  ON tech_notifications (status, created_at DESC);

CREATE TABLE IF NOT EXISTS tech_rate_buckets (
  bucket TEXT PRIMARY KEY,
  hits INT NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE OR REPLACE FUNCTION tech_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tech_sessions_updated_at ON tech_sessions;
CREATE TRIGGER tech_sessions_updated_at
  BEFORE UPDATE ON tech_sessions
  FOR EACH ROW EXECUTE FUNCTION tech_set_updated_at();

CREATE OR REPLACE FUNCTION tech_sessions_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  span tstzrange;
BEGIN
  span := tstzrange(
    NEW.starts_at,
    public.tech_session_ends_at(NEW.starts_at, NEW.duration_minutes),
    '[)'
  );

  IF NEW.status IN ('published', 'completed') THEN
    IF NOT NEW.venue_public OR length(trim(NEW.venue_label)) = 0 THEN
      RAISE EXCEPTION 'tech_venue_required' USING ERRCODE = 'check_violation';
    END IF;
    IF EXISTS (
      SELECT 1 FROM tech_blocks b
      WHERE tstzrange(b.starts_at, b.ends_at, '[)') && span
    ) THEN
      RAISE EXCEPTION 'tech_blocked' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE'
    AND (NEW.starts_at <> OLD.starts_at OR NEW.duration_minutes <> OLD.duration_minutes)
    AND EXISTS (
      SELECT 1 FROM tech_bookings bk
      WHERE bk.session_id = NEW.id AND bk.status = 'confirmed'
    ) THEN
    RAISE EXCEPTION 'tech_has_bookings' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tech_sessions_guard ON tech_sessions;
CREATE TRIGGER tech_sessions_guard
  BEFORE INSERT OR UPDATE ON tech_sessions
  FOR EACH ROW EXECUTE FUNCTION tech_sessions_guard();

CREATE OR REPLACE FUNCTION tech_bookings_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  sess tech_sessions%ROWTYPE;
  taken INT;
  span tstzrange;
BEGIN
  SELECT * INTO sess FROM tech_sessions WHERE id = NEW.session_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'tech_missing_session' USING ERRCODE = 'foreign_key_violation';
  END IF;

  span := tstzrange(
    sess.starts_at,
    public.tech_session_ends_at(sess.starts_at, sess.duration_minutes),
    '[)'
  );

  IF sess.status <> 'published' OR NOT sess.venue_public OR length(trim(sess.venue_label)) = 0 THEN
    RAISE EXCEPTION 'tech_not_bookable' USING ERRCODE = 'check_violation';
  END IF;
  IF sess.starts_at <= now() THEN
    RAISE EXCEPTION 'tech_session_started' USING ERRCODE = 'check_violation';
  END IF;
  IF EXISTS (
    SELECT 1 FROM tech_blocks b
    WHERE tstzrange(b.starts_at, b.ends_at, '[)') && span
  ) THEN
    RAISE EXCEPTION 'tech_blocked' USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO taken
  FROM tech_bookings
  WHERE session_id = NEW.session_id AND status = 'confirmed';

  IF taken >= sess.capacity THEN
    RAISE EXCEPTION 'tech_full' USING ERRCODE = 'check_violation';
  END IF;

  NEW.price_cents := sess.price_cents;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tech_bookings_before_insert ON tech_bookings;
CREATE TRIGGER tech_bookings_before_insert
  BEFORE INSERT ON tech_bookings
  FOR EACH ROW EXECUTE FUNCTION tech_bookings_before_insert();

CREATE TABLE IF NOT EXISTS tech_admin_allowlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tech_admin_allowlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON tech_admin_allowlist FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_admin_allowlist TO service_role;

-- Seed after creating the Auth user in the Tech project, e.g.:
-- INSERT INTO tech_admin_allowlist (email) VALUES ('you@example.com') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_tech_admin()
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
    FROM tech_admin_allowlist a
    WHERE lower(a.email) = claim_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_tech_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_tech_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.tech_bump_rate(
  p_bucket TEXT,
  p_max INT,
  p_window_seconds INT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_hits INT;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) < 8 OR length(p_bucket) > 128 THEN
    RETURN false;
  END IF;
  IF p_max < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  INSERT INTO tech_rate_buckets AS buckets (bucket, hits, reset_at)
  VALUES (p_bucket, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (bucket) DO UPDATE
    SET
      hits = CASE
        WHEN buckets.reset_at <= now() THEN 1
        ELSE buckets.hits + 1
      END,
      reset_at = CASE
        WHEN buckets.reset_at <= now() THEN now() + make_interval(secs => p_window_seconds)
        ELSE buckets.reset_at
      END
  RETURNING hits INTO current_hits;

  RETURN current_hits <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.tech_bump_rate(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_bump_rate(TEXT, INT, INT) TO service_role;

CREATE OR REPLACE FUNCTION public.tech_place_booking(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  sess tech_sessions%ROWTYPE;
  existing tech_bookings%ROWTYPE;
  inserted tech_bookings%ROWTYPE;
  note_id UUID;
  taken INT;
  constraint_name TEXT;
BEGIN
  v_session_id := (payload->>'session_id')::UUID;

  SELECT * INTO existing
  FROM tech_bookings
  WHERE idempotency_key = payload->>'idempotency_key';
  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'replayed', true,
      'reference', existing.public_reference,
      'booking_id', existing.id,
      'notification_id', (
        SELECT n.id FROM tech_notifications n
        WHERE n.booking_id = existing.id
        ORDER BY n.created_at DESC
        LIMIT 1
      ),
      'notification_status', (
        SELECT n.status FROM tech_notifications n
        WHERE n.booking_id = existing.id
        ORDER BY n.created_at DESC
        LIMIT 1
      )
    );
  END IF;

  SELECT * INTO sess FROM tech_sessions WHERE id = v_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_bookable');
  END IF;
  IF sess.status <> 'published' OR NOT sess.venue_public OR length(trim(sess.venue_label)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_bookable');
  END IF;
  IF sess.starts_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_session_started');
  END IF;
  IF EXISTS (
    SELECT 1 FROM tech_blocks b
    WHERE tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(
      sess.starts_at,
      public.tech_session_ends_at(sess.starts_at, sess.duration_minutes),
      '[)'
    )
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_blocked');
  END IF;

  IF EXISTS (
    SELECT 1 FROM tech_bookings bk
    WHERE bk.session_id = v_session_id
      AND bk.phone_key = payload->>'phone_key'
      AND bk.status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_duplicate');
  END IF;

  SELECT count(*) INTO taken
  FROM tech_bookings
  WHERE tech_bookings.session_id = v_session_id AND status = 'confirmed';
  IF taken >= sess.capacity THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_full');
  END IF;

  BEGIN
    INSERT INTO tech_bookings (
      session_id, public_reference, cancel_token_hash, idempotency_key,
      contact_name, attendee_name, booking_for_other, phone, phone_key,
      email, question, locale, source, price_cents
    ) VALUES (
      v_session_id,
      payload->>'reference',
      payload->>'token_hash',
      payload->>'idempotency_key',
      payload->>'contact_name',
      payload->>'attendee_name',
      COALESCE((payload->>'booking_for_other')::BOOLEAN, false),
      payload->>'phone',
      payload->>'phone_key',
      NULLIF(payload->>'email', ''),
      NULLIF(payload->>'question', ''),
      COALESCE(payload->>'locale', 'es'),
      NULLIF(payload->>'source', ''),
      sess.price_cents
    )
    RETURNING * INTO inserted;
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS constraint_name = CONSTRAINT_NAME;
      IF constraint_name LIKE '%idempotency%' THEN
        SELECT * INTO existing FROM tech_bookings
        WHERE idempotency_key = payload->>'idempotency_key';
        RETURN jsonb_build_object(
          'ok', true,
          'replayed', true,
          'reference', existing.public_reference,
          'booking_id', existing.id
        );
      ELSIF constraint_name LIKE '%one_phone%' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'tech_duplicate');
      ELSE
        RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
      END IF;
  END;

  INSERT INTO tech_notifications (booking_id, subject, body, status)
  VALUES (inserted.id, payload->>'subject', payload->>'body', 'pending')
  RETURNING id INTO note_id;

  RETURN jsonb_build_object(
    'ok', true,
    'replayed', false,
    'reference', inserted.public_reference,
    'booking_id', inserted.id,
    'notification_id', note_id,
    'starts_at', sess.starts_at,
    'duration_minutes', sess.duration_minutes,
    'price_cents', sess.price_cents,
    'venue_label', sess.venue_label,
    'kind', sess.kind
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_place_booking(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_place_booking(JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.tech_place_request(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing tech_requests%ROWTYPE;
  inserted tech_requests%ROWTYPE;
  requested TIMESTAMPTZ;
  note_id UUID;
  constraint_name TEXT;
BEGIN
  SELECT * INTO existing FROM tech_requests
  WHERE idempotency_key = payload->>'idempotency_key';
  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'replayed', true,
      'reference', existing.public_reference,
      'request_id', existing.id,
      'notification_id', (
        SELECT n.id FROM tech_notifications n
        WHERE n.request_id = existing.id
        ORDER BY n.created_at DESC
        LIMIT 1
      ),
      'notification_status', (
        SELECT n.status FROM tech_notifications n
        WHERE n.request_id = existing.id
        ORDER BY n.created_at DESC
        LIMIT 1
      )
    );
  END IF;

  requested := (payload->>'requested_start')::TIMESTAMPTZ;
  IF requested <= now() + INTERVAL '1 hour' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_too_soon');
  END IF;
  IF EXISTS (
    SELECT 1 FROM tech_blocks b
    WHERE tstzrange(b.starts_at, b.ends_at, '[)') @> requested
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_blocked');
  END IF;

  BEGIN
    INSERT INTO tech_requests (
      public_reference, status_token_hash, idempotency_key, requested_start,
      contact_name, attendee_name, booking_for_other, phone, phone_key,
      email, question, locale, source
    ) VALUES (
      payload->>'reference',
      payload->>'token_hash',
      payload->>'idempotency_key',
      requested,
      payload->>'contact_name',
      payload->>'attendee_name',
      COALESCE((payload->>'booking_for_other')::BOOLEAN, false),
      payload->>'phone',
      payload->>'phone_key',
      NULLIF(payload->>'email', ''),
      NULLIF(payload->>'question', ''),
      COALESCE(payload->>'locale', 'es'),
      NULLIF(payload->>'source', '')
    )
    RETURNING * INTO inserted;
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS constraint_name = CONSTRAINT_NAME;
      IF constraint_name LIKE '%idempotency%' THEN
        SELECT * INTO existing FROM tech_requests
        WHERE idempotency_key = payload->>'idempotency_key';
        RETURN jsonb_build_object(
          'ok', true,
          'replayed', true,
          'reference', existing.public_reference,
          'request_id', existing.id
        );
      END IF;
      RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
  END;

  INSERT INTO tech_notifications (request_id, subject, body, status)
  VALUES (inserted.id, payload->>'subject', payload->>'body', 'pending')
  RETURNING id INTO note_id;

  RETURN jsonb_build_object(
    'ok', true,
    'replayed', false,
    'reference', inserted.public_reference,
    'request_id', inserted.id,
    'notification_id', note_id,
    'requested_start', inserted.requested_start
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_place_request(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_place_request(JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.tech_access_by_token(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking tech_bookings%ROWTYPE;
  sess tech_sessions%ROWTYPE;
  req tech_requests%ROWTYPE;
BEGIN
  IF p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;

  SELECT * INTO booking FROM tech_bookings WHERE cancel_token_hash = p_token_hash;
  IF FOUND THEN
    SELECT * INTO sess FROM tech_sessions WHERE id = booking.session_id;
    RETURN jsonb_build_object(
      'ok', true,
      'record', 'booking',
      'reference', booking.public_reference,
      'status', booking.status,
      'attendee_name', booking.attendee_name,
      'kind', sess.kind,
      'starts_at', sess.starts_at,
      'duration_minutes', sess.duration_minutes,
      'price_cents', booking.price_cents,
      'venue_label', CASE WHEN sess.venue_public THEN sess.venue_label ELSE '' END,
      'can_cancel', booking.status = 'confirmed' AND sess.starts_at - now() >= INTERVAL '24 hours'
    );
  END IF;

  SELECT * INTO req FROM tech_requests WHERE status_token_hash = p_token_hash;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'record', 'request',
    'reference', req.public_reference,
    'status', req.status,
    'attendee_name', req.attendee_name,
    'kind', 'individual',
    'starts_at', req.requested_start,
    'duration_minutes', 60,
    'price_cents', 2500,
    'venue_label', '',
    'can_cancel', req.status = 'pending'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_access_by_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_access_by_token(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.tech_cancel_by_token(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking tech_bookings%ROWTYPE;
  sess tech_sessions%ROWTYPE;
  req tech_requests%ROWTYPE;
BEGIN
  IF p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;

  SELECT * INTO booking FROM tech_bookings WHERE cancel_token_hash = p_token_hash FOR UPDATE;
  IF FOUND THEN
    SELECT * INTO sess FROM tech_sessions WHERE id = booking.session_id FOR UPDATE;
    IF booking.status = 'cancelled' THEN
      RETURN jsonb_build_object('ok', true, 'already', true, 'reference', booking.public_reference);
    END IF;
    IF sess.starts_at - now() < INTERVAL '24 hours' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_too_late', 'reference', booking.public_reference);
    END IF;
    UPDATE tech_bookings
      SET status = 'cancelled', cancelled_at = now()
      WHERE id = booking.id;
    RETURN jsonb_build_object('ok', true, 'already', false, 'reference', booking.public_reference);
  END IF;

  SELECT * INTO req FROM tech_requests WHERE status_token_hash = p_token_hash FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;
  IF req.status = 'cancelled' THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'reference', req.public_reference);
  END IF;
  IF req.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_too_late', 'reference', req.public_reference);
  END IF;
  UPDATE tech_requests
    SET status = 'cancelled', decided_at = now()
    WHERE id = req.id;
  RETURN jsonb_build_object('ok', true, 'already', false, 'reference', req.public_reference);
END;
$$;

REVOKE ALL ON FUNCTION public.tech_cancel_by_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_cancel_by_token(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.tech_approve_request(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req tech_requests%ROWTYPE;
  sess_id UUID;
  venue TEXT;
BEGIN
  IF NOT public.is_tech_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_forbidden');
  END IF;

  venue := trim(COALESCE(payload->>'venue_label', ''));
  IF char_length(venue) < 3 OR char_length(venue) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_venue_required');
  END IF;

  SELECT * INTO req FROM tech_requests WHERE id = (payload->>'request_id')::UUID FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;
  IF req.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_pending');
  END IF;

  BEGIN
    INSERT INTO tech_sessions (
      kind, starts_at, duration_minutes, capacity, price_cents,
      venue_label, venue_public, status
    ) VALUES (
      'individual', req.requested_start, 60, 1, 2500,
      venue, true, 'published'
    )
    RETURNING id INTO sess_id;

    INSERT INTO tech_bookings (
      session_id, public_reference, cancel_token_hash, idempotency_key,
      contact_name, attendee_name, booking_for_other, phone, phone_key,
      email, question, locale, source, price_cents
    ) VALUES (
      sess_id,
      req.public_reference,
      req.status_token_hash,
      'approved:' || req.id::TEXT,
      req.contact_name,
      req.attendee_name,
      req.booking_for_other,
      req.phone,
      req.phone_key,
      req.email,
      req.question,
      req.locale,
      req.source,
      2500
    );

    UPDATE tech_requests
      SET status = 'approved', session_id = sess_id, decided_at = now()
      WHERE id = req.id;
  EXCEPTION
    WHEN exclusion_violation THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_overlap');
    WHEN check_violation THEN
      IF SQLERRM ILIKE '%tech_blocked%' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'tech_blocked');
      END IF;
      RETURN jsonb_build_object('ok', false, 'error', 'tech_overlap');
    WHEN unique_violation THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_duplicate');
  END;

  RETURN jsonb_build_object('ok', true, 'session_id', sess_id, 'reference', req.public_reference);
END;
$$;

REVOKE ALL ON FUNCTION public.tech_approve_request(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tech_approve_request(JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.tech_decline_request(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req tech_requests%ROWTYPE;
BEGIN
  IF NOT public.is_tech_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_forbidden');
  END IF;
  SELECT * INTO req FROM tech_requests WHERE id = (payload->>'request_id')::UUID FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_found');
  END IF;
  IF req.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_not_pending');
  END IF;
  UPDATE tech_requests SET status = 'declined', decided_at = now() WHERE id = req.id;
  RETURN jsonb_build_object('ok', true, 'reference', req.public_reference);
END;
$$;

REVOKE ALL ON FUNCTION public.tech_decline_request(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tech_decline_request(JSONB) TO authenticated;

ALTER TABLE tech_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_rate_buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tech_sessions_admin ON tech_sessions;
CREATE POLICY tech_sessions_admin ON tech_sessions
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

DROP POLICY IF EXISTS tech_blocks_admin ON tech_blocks;
CREATE POLICY tech_blocks_admin ON tech_blocks
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

DROP POLICY IF EXISTS tech_bookings_admin ON tech_bookings;
CREATE POLICY tech_bookings_admin ON tech_bookings
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

DROP POLICY IF EXISTS tech_requests_admin ON tech_requests;
CREATE POLICY tech_requests_admin ON tech_requests
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

DROP POLICY IF EXISTS tech_notifications_admin ON tech_notifications;
CREATE POLICY tech_notifications_admin ON tech_notifications
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

REVOKE ALL ON tech_sessions FROM PUBLIC, anon;
REVOKE ALL ON tech_blocks FROM PUBLIC, anon;
REVOKE ALL ON tech_bookings FROM PUBLIC, anon;
REVOKE ALL ON tech_requests FROM PUBLIC, anon;
REVOKE ALL ON tech_notifications FROM PUBLIC, anon;
REVOKE ALL ON tech_rate_buckets FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON tech_sessions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_blocks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_bookings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_requests TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_notifications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_rate_buckets TO service_role;
