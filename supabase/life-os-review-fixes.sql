-- Apply after life-os.sql on existing and new installations.
BEGIN;

-- An inbox reference must belong to the same user, just like evidence references.
DROP POLICY IF EXISTS os_inbox_insert_own ON public.os_inbox;
CREATE POLICY os_inbox_insert_own ON public.os_inbox FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND (entry_id IS NULL OR EXISTS (
    SELECT 1 FROM public.os_entries e WHERE e.id = entry_id AND e.user_id = (SELECT auth.uid())
  ))
);
DROP POLICY IF EXISTS os_inbox_update_own ON public.os_inbox;
CREATE POLICY os_inbox_update_own ON public.os_inbox FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND (entry_id IS NULL OR EXISTS (
    SELECT 1 FROM public.os_entries e WHERE e.id = entry_id AND e.user_id = (SELECT auth.uid())
  ))
);

-- Explicit approval is one transaction. Locking prevents retries/two tabs from
-- creating duplicates; any failed inbox update also rolls back the entry insert.
CREATE OR REPLACE FUNCTION public.approve_os_inbox(p_inbox_id uuid, p_edits jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  item public.os_inbox;
  entry public.os_entries;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO item FROM public.os_inbox
    WHERE id = p_inbox_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Inbox item not found'; END IF;
  IF item.decision = 'approved' AND item.entry_id IS NOT NULL THEN
    SELECT * INTO STRICT entry FROM public.os_entries WHERE id = item.entry_id;
    RETURN jsonb_build_object('entry', to_jsonb(entry), 'inbox', to_jsonb(item));
  END IF;
  IF item.decision = 'rejected' OR NOT item.processed THEN
    RAISE EXCEPTION 'Inbox item is not awaiting approval';
  END IF;
  IF jsonb_typeof(p_edits) IS DISTINCT FROM 'object'
    OR jsonb_typeof(p_edits->'candidate_title') IS DISTINCT FROM 'string'
    OR btrim(p_edits->>'candidate_title') = ''
    OR jsonb_typeof(p_edits->'observation') IS DISTINCT FROM 'string'
    OR btrim(p_edits->>'observation') = ''
    OR jsonb_typeof(p_edits->'possible_type') IS DISTINCT FROM 'string'
    OR jsonb_typeof(p_edits->'hypothesis') IS DISTINCT FROM 'string'
    OR jsonb_typeof(p_edits->'question_to_investigate') IS DISTINCT FROM 'string'
    OR jsonb_typeof(p_edits->'confidence') IS DISTINCT FROM 'string'
    OR jsonb_typeof(p_edits->'unknowns') IS DISTINCT FROM 'array'
  THEN RAISE EXCEPTION 'Invalid candidate'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_edits->'unknowns') AS u(value)
             WHERE jsonb_typeof(value) <> 'string') THEN
    RAISE EXCEPTION 'Invalid unknowns';
  END IF;

  -- Derive summary from the visible, edited observation. Do not approve an
  -- invisible AI summary or copy unreviewed raw text into NOA's canonical input.
  INSERT INTO public.os_entries (user_id, type, title, status, review_state, summary, body, identified_at)
  VALUES (auth.uid(), p_edits->>'possible_type', btrim(p_edits->>'candidate_title'), 'active', 'approved',
    left(btrim(p_edits->>'observation'), 240),
    jsonb_build_object(
      'observation', btrim(p_edits->>'observation'),
      'hypothesis', p_edits->>'hypothesis',
      'unknowns', p_edits->'unknowns',
      'question_to_investigate', p_edits->>'question_to_investigate',
      'confidence', p_edits->>'confidence',
      'source_inbox_id', item.id
    ), now()) RETURNING * INTO entry;
  UPDATE public.os_inbox SET decision = 'approved', ai_output = p_edits - 'summary', entry_id = entry.id
    WHERE id = item.id RETURNING * INTO item;
  RETURN jsonb_build_object('entry', to_jsonb(entry), 'inbox', to_jsonb(item));
END;
$$;
REVOKE ALL ON FUNCTION public.approve_os_inbox(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_os_inbox(uuid, jsonb) TO authenticated;

-- Remove only verbatim unrequested seed interpretations, preserving user edits.
UPDATE public.os_entries e SET body = e.body - v.field
FROM (VALUES
 ('C-002', 'meaning', 'Another person''s confusion is information about them, not an automatic duty for me to explain.'),
 ('C-003', 'meaning', 'What someone repeatedly does is more informative than what they say they could become.'),
 ('C-004', 'meaning', 'Naming my own pattern does not require professional certainty.'),
 ('C-005', 'meaning', 'I can notice urgency without adopting it as my operating tempo.')
) AS v(code, field, value)
WHERE e.user_id = '1cfb84ac-c59e-42c5-8df6-638db351afc1'
  AND e.entry_code = v.code AND e.body->>v.field = v.value;

-- One update per field so all matching keys on B-001 are removed.
DO $$
DECLARE f text; v jsonb;
BEGIN
  FOR f, v IN SELECT * FROM jsonb_each('{
    "what_it_protected": "Belonging, reduced conflict, and the sense of being seen as reasonable.",
    "what_i_keep": "Clarity when freely chosen and useful.",
    "current_cost": "Over-explaining and losing contact with my own simple wanting.",
    "integration_criteria": ["I can leave one short answer without adding justification.", "I notice the urge to explain without obeying it by default."]
  }'::jsonb) LOOP
    UPDATE public.os_entries SET body = body - f
    WHERE user_id = '1cfb84ac-c59e-42c5-8df6-638db351afc1'
      AND entry_code = 'B-001' AND body->f = v;
  END LOOP;
END $$;

-- Repair only values demonstrably copied by the old approval code.
UPDATE public.os_entries e SET body = e.body - 'source_raw_text'
FROM public.os_inbox i
WHERE i.entry_id = e.id AND i.user_id = e.user_id AND i.decision = 'approved'
  AND e.body->>'source_inbox_id' = i.id::text
  AND e.body->>'source_raw_text' = i.raw_text;
UPDATE public.os_entries e SET summary = left(btrim(e.body->>'observation'), 240)
FROM public.os_inbox i
WHERE i.entry_id = e.id AND i.user_id = e.user_id AND i.decision = 'approved'
  AND e.body->>'source_inbox_id' = i.id::text
  AND e.summary = i.ai_output->>'summary'
  AND jsonb_typeof(e.body->'observation') = 'string';

NOTIFY pgrst, 'reload schema';
COMMIT;
