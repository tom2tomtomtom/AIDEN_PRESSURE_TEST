-- Migration: Add what_works, key_concerns, and what_would_convince to persona_responses
-- These fields support balanced persona feedback

ALTER TABLE ppt.persona_responses
ADD COLUMN IF NOT EXISTS what_works TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_concerns TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS what_would_convince TEXT;

COMMENT ON COLUMN ppt.persona_responses.what_works IS 'Positive aspects identified by the persona (1-3 items)';
COMMENT ON COLUMN ppt.persona_responses.key_concerns IS 'Key concerns identified by the persona (1-3 items)';
COMMENT ON COLUMN ppt.persona_responses.what_would_convince IS 'What evidence would change the persona''s mind';
