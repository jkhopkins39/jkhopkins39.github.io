-- Contact-form security: request metadata, validation results, and screening verdicts.
-- Run in the Supabase SQL Editor against the Hoppy Tech project.

ALTER TABLE hoppy_tech.contact_submissions
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS referer text,
  ADD COLUMN IF NOT EXISTS geo text,
  ADD COLUMN IF NOT EXISTS screening_decision text,
  ADD COLUMN IF NOT EXISTS screening_category text,
  ADD COLUMN IF NOT EXISTS screening_confidence integer,
  ADD COLUMN IF NOT EXISTS screening_reason text,
  ADD COLUMN IF NOT EXISTS validation jsonb;

COMMENT ON COLUMN hoppy_tech.contact_submissions.ip_address IS
  'Client IP from X-Forwarded-For. Used for abuse rate-limiting and audit trail.';
COMMENT ON COLUMN hoppy_tech.contact_submissions.screening_decision IS
  'accept | review | reject — verdict from the Claude Haiku screening agent.';
COMMENT ON COLUMN hoppy_tech.contact_submissions.validation IS
  'Email/phone verification detail (DNS, disposable-domain, NANP, provider lookups).';

-- Supports the per-IP rate-limit lookup in api/contact.js.
CREATE INDEX IF NOT EXISTS contact_submissions_ip_created_idx
  ON hoppy_tech.contact_submissions (ip_address, created_at DESC);

-- Existing rows predate screening; treat them as accepted so the dashboard
-- doesn't show them as unreviewed.
UPDATE hoppy_tech.contact_submissions
   SET screening_decision = 'accept',
       screening_category = 'legacy'
 WHERE screening_decision IS NULL;
