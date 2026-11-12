-- Guardamar Click · private 30-minute sessions at 10 €.
-- Apply to the Tech Made Easy Supabase project after tech-session-language.sql.

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
  v_duration INT;
  v_price INT;
  taken INT;
  week_count INT;
  venue TEXT;
  constraint_name TEXT;
  v_session_language TEXT;
BEGIN
  v_session_language := COALESCE(NULLIF(payload->>'session_language', ''), 'es');
  IF v_session_language NOT IN ('es', 'en') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
  END IF;

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
      'session_language', sess.session_language,
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
  v_duration := COALESCE((payload->>'duration_minutes')::INT, 60);
  IF v_kind = 'group' THEN
    IF v_duration <> 60 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
    END IF;
    v_price := 1000;
  ELSIF v_duration = 30 THEN
    v_price := 1000;
  ELSIF v_duration = 60 THEN
    v_price := 2500;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'tech_failed');
  END IF;

  IF v_starts <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_session_started');
  END IF;
  IF v_starts > now() + INTERVAL '120 days' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_too_far');
  END IF;

  -- Prefer joining an existing open group at this exact start (same language only).
  IF v_kind = 'group' THEN
    SELECT s.* INTO open_group
    FROM tech_sessions s
    WHERE s.kind = 'group'
      AND s.status = 'published'
      AND s.venue_public
      AND s.starts_at = v_starts
      AND s.session_language = v_session_language
    FOR UPDATE;
    IF FOUND THEN
      SELECT count(*) INTO taken
      FROM tech_bookings
      WHERE session_id = open_group.id AND status = 'confirmed';
      IF taken < open_group.capacity THEN
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
            email, question, locale, session_language, source, price_cents
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
            v_session_language,
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
          'kind', open_group.kind,
          'session_language', open_group.session_language
        );
      END IF;
    END IF;
  END IF;

  week_count := public.tech_week_slot_count(v_starts);
  IF week_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_week_full');
  END IF;

  IF public.tech_slot_blocked_by_life(v_starts, v_duration) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tech_outside_hours');
  END IF;

  IF EXISTS (
    SELECT 1 FROM tech_blocks b
    WHERE tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(v_starts, public.tech_session_ends_at(v_starts, v_duration), '[)')
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
          ) && tstzrange(v_starts, public.tech_session_ends_at(v_starts, v_duration), '[)')
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
      venue_label, venue_public, status, session_language
    ) VALUES (
      v_kind,
      v_starts,
      v_duration,
      CASE WHEN v_kind = 'group' THEN 7 ELSE 1 END,
      v_price,
      venue,
      true,
      'published',
      v_session_language
    )
    RETURNING id INTO v_session_id;

    INSERT INTO tech_bookings (
      session_id, public_reference, cancel_token_hash, idempotency_key,
      contact_name, attendee_name, booking_for_other, phone, phone_key,
      email, question, locale, session_language, source, price_cents
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
      v_session_language,
      NULLIF(payload->>'source', ''),
      v_price
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
    'kind', sess.kind,
    'session_language', sess.session_language
  );
END;
$$;

REVOKE ALL ON FUNCTION public.tech_create_and_book(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tech_create_and_book(JSONB) TO service_role;
