-- Tech Made Easy · hour calendar (separate from parking).
-- Apply ONLY to the Tech Made Easy Supabase project.
-- Adds weekly busy template, calendar settings, 1h sessions (group max 7),
-- weekly slot cap of 3, and public create-or-join booking RPC.

-- 1) Session shape: fixed 60 minutes; group capacity up to 7.
UPDATE tech_sessions
SET duration_minutes = 60
WHERE kind = 'group' AND duration_minutes = 75;

UPDATE tech_sessions
SET capacity = LEAST(capacity, 7)
WHERE kind = 'group' AND capacity > 7;

ALTER TABLE tech_sessions DROP CONSTRAINT IF EXISTS tech_sessions_shape;
ALTER TABLE tech_sessions
  ADD CONSTRAINT tech_sessions_shape CHECK (
    (
      kind = 'group'
      AND duration_minutes = 60
      AND capacity BETWEEN 1 AND 7
      AND price_cents = 1000
    )
    OR (
      kind = 'individual'
      AND capacity = 1
      AND (
        (duration_minutes = 60 AND price_cents = 2500)
        OR (duration_minutes = 30 AND price_cents = 1000)
      )
    )
  );

-- 2) Calendar settings (single row). Public hours stay off until enabled.
CREATE TABLE IF NOT EXISTS tech_calendar_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT false,
  day_open_minute INT NOT NULL DEFAULT 480 CHECK (day_open_minute BETWEEN 0 AND 1439),
  day_close_minute INT NOT NULL DEFAULT 1200 CHECK (day_close_minute BETWEEN 1 AND 1440),
  buffer_minutes INT NOT NULL DEFAULT 15 CHECK (buffer_minutes BETWEEN 0 AND 60),
  default_venue_label TEXT NOT NULL DEFAULT 'Guardamar del Segura',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tech_calendar_settings_window CHECK (day_close_minute > day_open_minute + 60),
  CONSTRAINT tech_calendar_settings_venue CHECK (char_length(trim(default_venue_label)) BETWEEN 3 AND 160)
);

INSERT INTO tech_calendar_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3) Weekly busy / life commitments (ISO weekday: 1=Mon … 7=Sun).
CREATE TABLE IF NOT EXISTS tech_weekly_busy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_minute INT NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute INT NOT NULL CHECK (end_minute BETWEEN 1 AND 1440),
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tech_weekly_busy_range CHECK (end_minute > start_minute),
  CONSTRAINT tech_weekly_busy_label CHECK (label IS NULL OR char_length(label) <= 120)
);

CREATE INDEX IF NOT EXISTS tech_weekly_busy_weekday_idx
  ON tech_weekly_busy (weekday, start_minute);

-- 4) Helpers -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.tech_madrid_parts(p_at TIMESTAMPTZ)
RETURNS TABLE (
  local_date DATE,
  isodow INT,
  minute_of_day INT,
  iso_year INT,
  iso_week INT
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT
    (p_at AT TIME ZONE 'Europe/Madrid')::date AS local_date,
    EXTRACT(ISODOW FROM (p_at AT TIME ZONE 'Europe/Madrid'))::int AS isodow,
    (
      EXTRACT(HOUR FROM (p_at AT TIME ZONE 'Europe/Madrid'))::int * 60
      + EXTRACT(MINUTE FROM (p_at AT TIME ZONE 'Europe/Madrid'))::int
    ) AS minute_of_day,
    EXTRACT(ISOYEAR FROM (p_at AT TIME ZONE 'Europe/Madrid'))::int AS iso_year,
    EXTRACT(WEEK FROM (p_at AT TIME ZONE 'Europe/Madrid'))::int AS iso_week;
$$;

CREATE OR REPLACE FUNCTION public.tech_week_slot_count(p_at TIMESTAMPTZ)
RETURNS INT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  parts RECORD;
  n INT;
BEGIN
  SELECT * INTO parts FROM public.tech_madrid_parts(p_at);
  SELECT count(*)::int INTO n
  FROM tech_sessions s
  WHERE s.status IN ('published', 'completed')
    AND (SELECT iso_year FROM public.tech_madrid_parts(s.starts_at)) = parts.iso_year
    AND (SELECT iso_week FROM public.tech_madrid_parts(s.starts_at)) = parts.iso_week;
  RETURN n;
END;
$$;

CREATE OR REPLACE FUNCTION public.tech_slot_blocked_by_life(
  p_starts_at TIMESTAMPTZ,
  p_duration_minutes INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  settings tech_calendar_settings%ROWTYPE;
  parts RECORD;
  end_minute INT;
  busy RECORD;
  buf INT;
  busy_start INT;
  busy_end INT;
BEGIN
  SELECT * INTO settings FROM tech_calendar_settings WHERE id = 1;
  -- When the public calendar is off, life hours do not constrain admin-published sessions.
  IF NOT FOUND OR NOT settings.enabled THEN
    RETURN false;
  END IF;

  SELECT * INTO parts FROM public.tech_madrid_parts(p_starts_at);
  end_minute := parts.minute_of_day + p_duration_minutes;

  IF parts.minute_of_day < settings.day_open_minute
     OR end_minute > settings.day_close_minute THEN
    RETURN true;
  END IF;

  buf := settings.buffer_minutes;
  FOR busy IN
    SELECT start_minute, end_minute
    FROM tech_weekly_busy
    WHERE weekday = parts.isodow
  LOOP
    busy_start := GREATEST(0, busy.start_minute - buf);
    busy_end := LEAST(1440, busy.end_minute + buf);
    -- Half-open overlap of [minute_of_day, end_minute) with [busy_start, busy_end)
    IF parts.minute_of_day < busy_end AND busy_start < end_minute THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

-- Guard: also respect closed dates (tech_blocks) + weekly life buffer when publishing.
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
    IF public.tech_slot_blocked_by_life(NEW.starts_at, NEW.duration_minutes) THEN
      RAISE EXCEPTION 'tech_outside_hours' USING ERRCODE = 'check_violation';
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

-- 5) Create new 1h session + first booking (or join open group at that instant).
CREATE OR REPLACE FUNCTION public.tech_create_and_book(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings tech_calendar_settings%ROWTYPE;
  existing tech_bookings%ROWTYPE;
  open_group tech_sessions%ROWTYPE;
  sess tech_sessions%ROWTYPE;
  inserted tech_bookings%ROWTYPE;
  note_id UUID;
  v_kind tech_session_kind;
  v_starts TIMESTAMPTZ;
  v_session_id UUID;
  taken INT;
  week_count INT;
  venue TEXT;
  constraint_name TEXT;
BEGIN
  SELECT * INTO existing
  FROM tech_bookings
  WHERE idempotency_key = payload->>'idempotency_key';
  IF FOUND THEN
    SELECT * INTO sess FROM tech_sessions WHERE id = existing.session_id;
    RETURN jsonb_build_object(
      'ok', true,
      'replayed', true,
      'reference', existing.public_reference,
      'booking_id', existing.id,
      'session_id', existing.session_id,
      'starts_at', sess.starts_at,
      'duration_minutes', sess.duration_minutes,
      'price_cents', existing.price_cents,
      'venue_label', sess.venue_label,
      'kind', sess.kind,
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

  SELECT * INTO settings FROM tech_calendar_settings WHERE id = 1 FOR UPDATE;
  IF NOT FOUND OR NOT settings.enabled THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_calendar_off');
  END IF;

  IF payload->>'kind' NOT IN ('group', 'individual') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
  END IF;
  v_kind := (payload->>'kind')::tech_session_kind;
  v_starts := (payload->>'starts_at')::TIMESTAMPTZ;

  IF v_starts <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_session_started');
  END IF;
  IF v_starts > now() + INTERVAL '120 days' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_too_far');
  END IF;

  -- Prefer joining an existing open group at this exact start.
  IF v_kind = 'group' THEN
    SELECT s.* INTO open_group
    FROM tech_sessions s
    WHERE s.kind = 'group'
      AND s.status = 'published'
      AND s.venue_public
      AND s.starts_at = v_starts
    FOR UPDATE;
    IF FOUND THEN
      SELECT count(*) INTO taken
      FROM tech_bookings
      WHERE session_id = open_group.id AND status = 'confirmed';
      IF taken < open_group.capacity THEN
        -- Reuse join path via nested call shape (inline insert).
        IF EXISTS (
          SELECT 1 FROM tech_bookings bk
          WHERE bk.session_id = open_group.id
            AND bk.phone_key = payload->>'phone_key'
            AND bk.status = 'confirmed'
        ) THEN
          RETURN jsonb_build_object('ok', false, 'error', 'tech_duplicate');
        END IF;
        BEGIN
          INSERT INTO tech_bookings (
            session_id, public_reference, cancel_token_hash, idempotency_key,
            contact_name, attendee_name, booking_for_other, phone, phone_key,
            email, question, locale, source, price_cents
          ) VALUES (
            open_group.id,
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
            open_group.price_cents
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
                'booking_id', existing.id,
                'session_id', existing.session_id
              );
            ELSIF constraint_name LIKE '%one_phone%' THEN
              RETURN jsonb_build_object('ok', false, 'error', 'tech_duplicate');
            ELSE
              RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
            END IF;
          WHEN check_violation THEN
            RETURN jsonb_build_object('ok', false, 'error', 'tech_full');
        END;

        INSERT INTO tech_notifications (booking_id, subject, body, status)
        VALUES (inserted.id, payload->>'subject', payload->>'body', 'pending')
        RETURNING id INTO note_id;

        RETURN jsonb_build_object(
          'ok', true,
          'replayed', false,
          'joined', true,
          'reference', inserted.public_reference,
          'booking_id', inserted.id,
          'session_id', open_group.id,
          'notification_id', note_id,
          'starts_at', open_group.starts_at,
          'duration_minutes', open_group.duration_minutes,
          'price_cents', open_group.price_cents,
          'venue_label', open_group.venue_label,
          'kind', open_group.kind
        );
      END IF;
    END IF;
  END IF;

  -- Creating a new distinct slot: enforce weekly cap of 3.
  week_count := public.tech_week_slot_count(v_starts);
  IF week_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_week_full');
  END IF;

  IF public.tech_slot_blocked_by_life(v_starts, 60) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_outside_hours');
  END IF;

  IF EXISTS (
    SELECT 1 FROM tech_blocks b
    WHERE tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(v_starts, public.tech_session_ends_at(v_starts, 60), '[)')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_blocked');
  END IF;

  IF EXISTS (
    SELECT 1 FROM tech_sessions s
    WHERE s.status IN ('published', 'completed')
      AND tstzrange(
            s.starts_at,
            public.tech_session_ends_at(s.starts_at, s.duration_minutes),
            '[)'
          ) && tstzrange(v_starts, public.tech_session_ends_at(v_starts, 60), '[)')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_overlap');
  END IF;

  venue := trim(COALESCE(NULLIF(payload->>'venue_label', ''), settings.default_venue_label));
  IF char_length(venue) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_venue_required');
  END IF;

  BEGIN
    INSERT INTO tech_sessions (
      kind, starts_at, duration_minutes, capacity, price_cents,
      venue_label, venue_public, status
    ) VALUES (
      v_kind,
      v_starts,
      60,
      CASE WHEN v_kind = 'group' THEN 7 ELSE 1 END,
      CASE WHEN v_kind = 'group' THEN 1000 ELSE 2500 END,
      venue,
      true,
      'published'
    )
    RETURNING id INTO v_session_id;

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
      CASE WHEN v_kind = 'group' THEN 1000 ELSE 2500 END
    )
    RETURNING * INTO inserted;
  EXCEPTION
    WHEN exclusion_violation THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_overlap');
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS constraint_name = CONSTRAINT_NAME;
      IF constraint_name LIKE '%idempotency%' THEN
        SELECT * INTO existing FROM tech_bookings
        WHERE idempotency_key = payload->>'idempotency_key';
        RETURN jsonb_build_object(
          'ok', true,
          'replayed', true,
          'reference', existing.public_reference,
          'booking_id', existing.id,
          'session_id', existing.session_id
        );
      ELSE
        RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
      END IF;
    WHEN check_violation THEN
      IF SQLERRM ILIKE '%tech_blocked%' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'tech_blocked');
      ELSIF SQLERRM ILIKE '%tech_outside_hours%' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'tech_outside_hours');
      END IF;
      RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
  END;

  INSERT INTO tech_notifications (booking_id, subject, body, status)
  VALUES (inserted.id, payload->>'subject', payload->>'body', 'pending')
  RETURNING id INTO note_id;

  SELECT * INTO sess FROM tech_sessions WHERE id = v_session_id;

  RETURN jsonb_build_object(
    'ok', true,
    'replayed', false,
    'joined', false,
    'reference', inserted.public_reference,
    'booking_id', inserted.id,
    'session_id', v_session_id,
    'notification_id', note_id,
    'starts_at', sess.starts_at,
    'duration_minutes', sess.duration_minutes,
    'price_cents', sess.price_cents,
    'venue_label', sess.venue_label,
    'kind', sess.kind
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_create_and_book(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_create_and_book(JSONB) TO service_role;

-- 6) RLS for new tables
ALTER TABLE tech_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_weekly_busy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tech_calendar_settings_admin ON tech_calendar_settings;
CREATE POLICY tech_calendar_settings_admin ON tech_calendar_settings
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

DROP POLICY IF EXISTS tech_weekly_busy_admin ON tech_weekly_busy;
CREATE POLICY tech_weekly_busy_admin ON tech_weekly_busy
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

REVOKE ALL ON tech_calendar_settings FROM PUBLIC, anon;
REVOKE ALL ON tech_weekly_busy FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_calendar_settings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_weekly_busy TO authenticated, service_role;
