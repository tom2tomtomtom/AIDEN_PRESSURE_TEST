-- Migration 008: Conversation Turns for Moderated Focus Groups
-- Stores the multi-turn conversation between moderator and personas

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE ppt.speaker_type AS ENUM ('moderator', 'persona');

CREATE TYPE ppt.turn_type AS ENUM (
  'introduction',      -- Moderator introduces stimulus
  'initial_response',  -- Persona's first reaction
  'probe',            -- Moderator probes for more
  'follow_up',        -- Persona responds to probe/clarification
  'clarification',    -- Moderator provides creative context
  'revised_response', -- Persona's view after clarification
  'draw_out',         -- Moderator invites quiet participant
  'closing'           -- Moderator wraps up
);

-- =============================================================================
-- CONVERSATION TURNS TABLE
-- =============================================================================

CREATE TABLE ppt.conversation_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ppt.pressure_tests(id) ON DELETE CASCADE,

  -- Turn sequencing
  turn_number INTEGER NOT NULL,

  -- Speaker info
  speaker_type ppt.speaker_type NOT NULL,
  speaker_name TEXT NOT NULL,              -- "Moderator" or persona's generated name
  archetype_slug TEXT,                     -- NULL for moderator, slug for personas
  archetype_id UUID REFERENCES ppt.persona_archetypes(id),

  -- Content
  content TEXT NOT NULL,
  turn_type ppt.turn_type NOT NULL,

  -- For follow-up tracking
  in_response_to UUID REFERENCES ppt.conversation_turns(id),  -- What turn this is responding to

  -- Metadata
  is_revised BOOLEAN DEFAULT FALSE,        -- True if this is a revised view after clarification
  sentiment TEXT,                          -- detected sentiment if applicable

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure turns are ordered within a test
  UNIQUE(test_id, turn_number)
);

-- =============================================================================
-- BRIEF ANALYSIS STORAGE
-- =============================================================================

-- Add brief_analysis column to test_results for storing the analysis
ALTER TABLE ppt.test_results
ADD COLUMN IF NOT EXISTS brief_analysis JSONB;

-- Add column to track if test used moderation
ALTER TABLE ppt.test_results
ADD COLUMN IF NOT EXISTS moderation_used BOOLEAN DEFAULT FALSE;

-- Add column to store moderation impact metrics
ALTER TABLE ppt.test_results
ADD COLUMN IF NOT EXISTS moderation_impact JSONB;
-- moderation_impact structure: {
--   personas_clarified: number,
--   view_shifts: [{ persona: string, before: number, after: number, metric: string }],
--   salvage_rate: number (percentage who changed view positively after clarification)
-- }

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Fast lookup of turns for a test
CREATE INDEX idx_ppt_conversation_turns_test ON ppt.conversation_turns(test_id);

-- Order turns chronologically
CREATE INDEX idx_ppt_conversation_turns_order ON ppt.conversation_turns(test_id, turn_number);

-- Find all turns by a specific persona
CREATE INDEX idx_ppt_conversation_turns_archetype ON ppt.conversation_turns(archetype_id) WHERE archetype_id IS NOT NULL;

-- Find moderator turns
CREATE INDEX idx_ppt_conversation_turns_moderator ON ppt.conversation_turns(test_id) WHERE speaker_type = 'moderator';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE ppt.conversation_turns ENABLE ROW LEVEL SECURITY;

-- Users can view conversation turns for tests in their organizations
CREATE POLICY "Users can view conversation turns for their org tests"
  ON ppt.conversation_turns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ppt.pressure_tests pt
      JOIN ppt.projects p ON pt.project_id = p.id
      WHERE pt.id = conversation_turns.test_id
      AND ppt.is_org_member(p.organization_id)
    )
  );

-- Only system can insert (happens during test execution)
CREATE POLICY "System can insert conversation turns"
  ON ppt.conversation_turns
  FOR INSERT
  WITH CHECK (true);

-- Users can delete turns for their org tests (when deleting tests)
CREATE POLICY "Users can delete conversation turns for their org tests"
  ON ppt.conversation_turns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ppt.pressure_tests pt
      JOIN ppt.projects p ON pt.project_id = p.id
      WHERE pt.id = conversation_turns.test_id
      AND ppt.is_org_admin(p.organization_id)
    )
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get the full conversation transcript for a test
CREATE OR REPLACE FUNCTION ppt.get_conversation_transcript(p_test_id UUID)
RETURNS TABLE (
  turn_number INTEGER,
  speaker_type ppt.speaker_type,
  speaker_name TEXT,
  archetype_slug TEXT,
  content TEXT,
  turn_type ppt.turn_type,
  is_revised BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ct.turn_number,
    ct.speaker_type,
    ct.speaker_name,
    ct.archetype_slug,
    ct.content,
    ct.turn_type,
    ct.is_revised,
    ct.created_at
  FROM ppt.conversation_turns ct
  WHERE ct.test_id = p_test_id
  ORDER BY ct.turn_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Count turns by type for a test
CREATE OR REPLACE FUNCTION ppt.get_turn_counts(p_test_id UUID)
RETURNS TABLE (
  turn_type ppt.turn_type,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ct.turn_type, COUNT(*)::BIGINT
  FROM ppt.conversation_turns ct
  WHERE ct.test_id = p_test_id
  GROUP BY ct.turn_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE ppt.conversation_turns IS 'Multi-turn conversation between AI moderator and personas';
COMMENT ON COLUMN ppt.conversation_turns.turn_number IS 'Sequential order of turns in the conversation';
COMMENT ON COLUMN ppt.conversation_turns.in_response_to IS 'Links follow-up responses to their triggering turn';
COMMENT ON COLUMN ppt.conversation_turns.is_revised IS 'True if persona revised their view after moderator clarification';
COMMENT ON COLUMN ppt.test_results.brief_analysis IS 'AI analysis of brief tone, creative devices, and moderation needs';
COMMENT ON COLUMN ppt.test_results.moderation_impact IS 'Metrics on how moderation affected persona views';
