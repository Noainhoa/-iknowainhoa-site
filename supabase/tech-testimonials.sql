-- Tech Made Easy · visitor opinions
-- Isolated migration. Apply ONLY to the Tech Made Easy Supabase project.
-- Public reads and writes go through the Next.js server (service role).
-- Admin uses the authenticated client and is_tech_admin().

CREATE TABLE IF NOT EXISTS tech_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  body TEXT NOT NULL,
  place TEXT,
  locale TEXT NOT NULL DEFAULT 'es',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tech_testimonials_name CHECK (char_length(display_name) BETWEEN 1 AND 60),
  CONSTRAINT tech_testimonials_body CHECK (char_length(body) BETWEEN 8 AND 400),
  CONSTRAINT tech_testimonials_place CHECK (place IS NULL OR char_length(place) BETWEEN 1 AND 80),
  CONSTRAINT tech_testimonials_locale CHECK (locale IN ('es', 'en', 'nl')),
  CONSTRAINT tech_testimonials_status CHECK (status IN ('pending', 'published', 'hidden'))
);

CREATE INDEX IF NOT EXISTS tech_testimonials_published_idx
  ON tech_testimonials (created_at DESC)
  WHERE status = 'published';

ALTER TABLE tech_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tech_testimonials_admin ON tech_testimonials;
CREATE POLICY tech_testimonials_admin ON tech_testimonials
  FOR ALL TO authenticated
  USING (public.is_tech_admin())
  WITH CHECK (public.is_tech_admin());

REVOKE ALL ON tech_testimonials FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tech_testimonials TO authenticated, service_role;
