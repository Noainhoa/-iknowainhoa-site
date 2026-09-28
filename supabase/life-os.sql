-- Ainhoa OS / NOA MVP tables for the ainhoa-life Supabase project.
-- Run in SQL Editor, then run life-os-review-fixes.sql. Independent from timeline tables.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS os_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  entry_code TEXT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'constitution',
      'belief',
      'pattern',
      'goal',
      'training',
      'selection',
      'regulation',
      'precedent'
    )
  ),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN (
      'exposed',
      'rebuilding',
      'testing',
      'integrated',
      'archived',
      'active'
    )
  ),
  review_state TEXT NOT NULL DEFAULT 'draft' CHECK (
    review_state IN ('draft', 'reviewed', 'approved')
  ),
  summary TEXT NULL,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  identified_at TIMESTAMPTZ NULL,
  review_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS os_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  ai_output JSONB NULL,
  decision TEXT NULL CHECK (
    decision IS NULL
    OR decision IN ('approved', 'rejected', 'pending')
  ),
  entry_id UUID NULL REFERENCES os_entries (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS os_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES os_entries (id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  event_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS os_entries_user_id_idx ON os_entries (user_id);
CREATE INDEX IF NOT EXISTS os_entries_user_type_idx ON os_entries (user_id, type);
CREATE INDEX IF NOT EXISTS os_entries_user_status_idx ON os_entries (user_id, status);
CREATE INDEX IF NOT EXISTS os_entries_user_review_idx ON os_entries (user_id, review_state);
CREATE UNIQUE INDEX IF NOT EXISTS os_entries_user_entry_code_uidx
  ON os_entries (user_id, entry_code)
  WHERE entry_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS os_inbox_user_id_idx ON os_inbox (user_id);
CREATE INDEX IF NOT EXISTS os_inbox_user_created_idx ON os_inbox (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS os_inbox_entry_id_idx ON os_inbox (entry_id)
  WHERE entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS os_evidence_user_id_idx ON os_evidence (user_id);
CREATE INDEX IF NOT EXISTS os_evidence_entry_id_idx ON os_evidence (entry_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuse life_set_updated_at if present)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION life_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS os_entries_set_updated_at ON os_entries;
CREATE TRIGGER os_entries_set_updated_at
  BEFORE UPDATE ON os_entries
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

DROP TRIGGER IF EXISTS os_inbox_set_updated_at ON os_inbox;
CREATE TRIGGER os_inbox_set_updated_at
  BEFORE UPDATE ON os_inbox
  FOR EACH ROW
  EXECUTE FUNCTION life_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE os_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS os_entries_select_own ON os_entries;
CREATE POLICY os_entries_select_own
  ON os_entries FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_entries_insert_own ON os_entries;
CREATE POLICY os_entries_insert_own
  ON os_entries FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_entries_update_own ON os_entries;
CREATE POLICY os_entries_update_own
  ON os_entries FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_entries_delete_own ON os_entries;
CREATE POLICY os_entries_delete_own
  ON os_entries FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_inbox_select_own ON os_inbox;
CREATE POLICY os_inbox_select_own
  ON os_inbox FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_inbox_insert_own ON os_inbox;
CREATE POLICY os_inbox_insert_own
  ON os_inbox FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_inbox_update_own ON os_inbox;
CREATE POLICY os_inbox_update_own
  ON os_inbox FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_inbox_delete_own ON os_inbox;
CREATE POLICY os_inbox_delete_own
  ON os_inbox FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_evidence_select_own ON os_evidence;
CREATE POLICY os_evidence_select_own
  ON os_evidence FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS os_evidence_insert_own ON os_evidence;
CREATE POLICY os_evidence_insert_own
  ON os_evidence FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM os_entries e
      WHERE e.id = entry_id AND e.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS os_evidence_update_own ON os_evidence;
CREATE POLICY os_evidence_update_own
  ON os_evidence FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM os_entries e
      WHERE e.id = entry_id AND e.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS os_evidence_delete_own ON os_evidence;
CREATE POLICY os_evidence_delete_own
  ON os_evidence FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.os_entries,
  public.os_inbox,
  public.os_evidence
TO authenticated;

NOTIFY pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Seed: minimal approved / reviewed starter material for primary Life user
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  uid UUID := '1cfb84ac-c59e-42c5-8df6-638db351afc1';
  belief_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid) THEN
    RAISE NOTICE 'Seed skipped: Life user % not found', uid;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM os_entries WHERE user_id = uid LIMIT 1) THEN
    RAISE NOTICE 'Seed skipped: os_entries already present for user';
    RETURN;
  END IF;

  INSERT INTO os_entries (user_id, entry_code, type, title, status, review_state, summary, body, identified_at)
  VALUES
    (
      uid, 'C-001', 'constitution', 'Wanting does not require a defence',
      'active', 'approved',
      'I do not need a defence for wanting what I want.',
      jsonb_build_object(
        'principle', 'I do not need a defence for wanting what I want.',
        'meaning', '"Because I want to" can be enough information. Explanation is optional unless genuinely useful or freely chosen.'
      ),
      now()
    ),
    (
      uid, 'C-002', 'constitution', 'Confusion does not require disclosure',
      'active', 'approved',
      'Confusion in another person does not create an obligation for disclosure in me.',
      jsonb_build_object(
        'principle', 'Confusion in another person does not create an obligation for disclosure in me.'
      ),
      now()
    ),
    (
      uid, 'C-003', 'constitution', 'Select from observed behaviour',
      'active', 'approved',
      'Select based on observed behaviour, not explained potential.',
      jsonb_build_object(
        'principle', 'Select based on observed behaviour, not explained potential.'
      ),
      now()
    ),
    (
      uid, 'C-004', 'constitution', 'Accuracy without minimisation',
      'active', 'approved',
      'I do not have to be an expert to accurately name what I am doing.',
      jsonb_build_object(
        'principle', 'I do not have to be an expert to accurately name what I am doing.'
      ),
      now()
    ),
    (
      uid, 'C-005', 'constitution', 'Other people''s urgency',
      'active', 'approved',
      'Other people''s urgency does not automatically become mine.',
      jsonb_build_object(
        'principle', 'Other people''s urgency does not automatically become mine.'
      ),
      now()
    );

  INSERT INTO os_entries (user_id, entry_code, type, title, status, review_state, summary, body, identified_at)
  VALUES (
    uid, 'B-001', 'belief', 'Explaining Myself',
    'rebuilding', 'approved',
    'Confusion in another person does not create an obligation for disclosure in me.',
    jsonb_build_object(
      'old_rule', 'If my choice is not understandable to someone, I need to explain enough that they can see why it is reasonable.',
      'chosen_belief', 'Confusion in another person does not create an obligation for disclosure in me.',
      'behavioural_evidence', 'I answer the question that was actually asked, once, without automatically explaining the explanation.',
      'bedtime_rehearsal', 'Imagine someone questioning an unconventional choice. Give one short truthful answer. Notice the urge to add justification. Let the silence remain.'
    ),
    now()
  )
  RETURNING id INTO belief_id;

  INSERT INTO os_entries (user_id, entry_code, type, title, status, review_state, summary, body, identified_at)
  VALUES (
    uid, 'PT-001', 'pattern', 'Advice Before Action',
    'exposed', 'reviewed',
    'Seeking more workout advice while consistency stays low.',
    jsonb_build_object(
      'observation', 'I repeatedly seek more information, plans and optimisation about exercise while actual training consistency remains low.',
      'hypothesis', 'Information gathering may sometimes be functioning as a substitute for beginning imperfectly.',
      'unknowns', jsonb_build_array(
        'uncertainty',
        'perfectionism',
        'physical constraints',
        'motivation',
        'scheduling',
        'fear of doing it wrong'
      ),
      'question_to_investigate', 'What do I believe I need to know or have in place before I am allowed to simply train?'
    ),
    now()
  );

  INSERT INTO os_entries (user_id, entry_code, type, title, status, review_state, summary, body, identified_at)
  VALUES (
    uid, 'R-001', 'regulation', 'Low-bandwidth regulation options',
    'active', 'approved',
    'Use known regulation options before turning every state into analysis or an avoidable decision.',
    jsonb_build_object(
      'when_useful', 'When emotionally activated, before turning every state into analysis or making an avoidable decision.',
      'options', jsonb_build_array(
        'origami',
        'watch a movie',
        'make bracelets',
        'do nothing for two minutes',
        'shower',
        'face-cleaning routine',
        'journaling',
        'audiobook',
        '15 minutes of a video game',
        'go outside / walk'
      ),
      'notes', 'Choose one small known option. Regulation first; analysis later if still useful.'
    ),
    now()
  );

  INSERT INTO os_entries (user_id, entry_code, type, title, status, review_state, summary, body, identified_at)
  VALUES (
    uid, 'P-001', 'precedent', 'Parking client',
    'active', 'approved',
    'Revenue is not automatically worth disruption.',
    jsonb_build_object(
      'what_happened', 'Ainhoa was willing to lose revenue rather than accept a disproportionately demanding customer.',
      'what_it_demonstrates', 'Revenue is not automatically worth disruption.',
      'related_principles', jsonb_build_array(
        'Selection / lower-friction people can be preferable even when that costs money.'
      ),
      'related_entry_ids', '[]'::jsonb
    ),
    now()
  );

  INSERT INTO os_entries (
    user_id, entry_code, type, title, status, review_state, summary, body, identified_at, review_at
  )
  VALUES (
    uid, 'T-001', 'training', 'Night rehearsal — Explaining Myself',
    'active', 'approved',
    'Current training focus linked to B-001.',
    jsonb_build_object(
      'linked_entry_id', belief_id,
      'linked_entry_code', 'B-001',
      'linked_title', 'Explaining Myself',
      'chosen_belief', 'Confusion in another person does not create an obligation for disclosure in me.',
      'practice_steps', jsonb_build_array(
        'What happened today that activated this old rule?',
        'What did the old rule tell me to do?',
        'What do I choose now?',
        'Rehearse one uncomfortable moment for 30–60 seconds using the chosen response.',
        'Go to sleep with one open question, not a command.'
      ),
      'sleep_question', 'What would it feel like to remain myself even when someone does not understand me?',
      'review_rule', 'A target date is a review point, not a deadline for psychological completion.'
    ),
    now(),
    (CURRENT_DATE + INTERVAL '14 days')::timestamptz
  );
END $$;
