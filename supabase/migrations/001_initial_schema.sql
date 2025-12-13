-- Migration 001: Initial Schema for Phantom Pressure Test
-- Uses 'ppt' schema to isolate from other AIDEN projects sharing this database

-- Create dedicated schema
CREATE SCHEMA IF NOT EXISTS ppt;

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension needed

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE ppt.org_role AS ENUM ('owner', 'admin', 'member');

CREATE TYPE ppt.project_category AS ENUM (
  'fmcg',
  'services',
  'premium',
  'tech',
  'finance',
  'healthcare',
  'retail',
  'other'
);

CREATE TYPE ppt.test_status AS ENUM (
  'draft',
  'running',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE ppt.skepticism_level AS ENUM (
  'low',
  'medium',
  'high',
  'extreme'
);

CREATE TYPE ppt.archetype_category AS ENUM (
  'mainstream',
  'premium',
  'value',
  'health',
  'convenience',
  'sustainability',
  'innovation',
  'traditional'
);

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

CREATE TABLE ppt.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ppt.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES ppt.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role ppt.org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id)
);

-- =============================================================================
-- PROJECTS
-- =============================================================================

CREATE TABLE ppt.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES ppt.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ppt.project_category NOT NULL DEFAULT 'other',
  brand_context JSONB DEFAULT '{}',
  -- brand_context structure: { tone: string, competitors: string[], history: string }
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PERSONA SYSTEM (Phantom Consumer Memory)
-- =============================================================================

CREATE TABLE ppt.persona_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  category ppt.archetype_category NOT NULL,
  demographics JSONB NOT NULL DEFAULT '{}',
  -- demographics: { age_range: string, income: string, location: string, family: string }
  psychographics JSONB NOT NULL DEFAULT '{}',
  -- psychographics: { values: string[], motivations: string[], pain_points: string[], media_habits: string[] }
  baseline_skepticism ppt.skepticism_level NOT NULL DEFAULT 'medium',
  voice_traits JSONB NOT NULL DEFAULT '[]',
  -- voice_traits: string[] describing how they speak
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ppt.phantom_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES ppt.persona_archetypes(id) ON DELETE CASCADE,
  category ppt.project_category NOT NULL,
  memory_text TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  emotional_residue VARCHAR(50) NOT NULL,
  -- emotional_residue: 'positive', 'negative', 'mixed', 'neutral'
  trust_modifier INTEGER NOT NULL DEFAULT 0 CHECK (trust_modifier BETWEEN -5 AND 5),
  -- trust_modifier: -5 to +5 impact on brand trust
  brand_mentioned VARCHAR(255),
  experience_type VARCHAR(50) NOT NULL,
  -- experience_type: 'purchase', 'advertising', 'word_of_mouth', 'news', 'social_media'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PRESSURE TESTS
-- =============================================================================

CREATE TABLE ppt.pressure_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ppt.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  stimulus_type VARCHAR(50) NOT NULL DEFAULT 'concept',
  -- stimulus_type: 'concept', 'claim', 'ad_copy', 'product_description', 'tagline'
  stimulus_content TEXT NOT NULL,
  stimulus_claims TEXT[] DEFAULT '{}',
  -- extracted claims from the stimulus
  panel_config JSONB NOT NULL DEFAULT '{}',
  -- panel_config: { archetypes: uuid[], skepticism_override: string, panel_size: number }
  status ppt.test_status NOT NULL DEFAULT 'draft',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ppt.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ppt.pressure_tests(id) ON DELETE CASCADE,

  -- Aggregated scores
  pressure_score INTEGER CHECK (pressure_score BETWEEN 0 AND 100),
  gut_attraction_index INTEGER CHECK (gut_attraction_index BETWEEN 0 AND 100),
  credibility_score INTEGER CHECK (credibility_score BETWEEN 0 AND 100),
  purchase_intent_avg DECIMAL(3,1) CHECK (purchase_intent_avg BETWEEN 1 AND 10),

  -- Analysis
  key_strengths JSONB DEFAULT '[]',
  key_weaknesses JSONB DEFAULT '[]',
  -- structure: [{ point: string, evidence: string[], severity: string }]
  recommendations JSONB DEFAULT '[]',
  -- structure: [{ recommendation: string, rationale: string, priority: string }]

  -- Metadata
  total_responses INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER,
  model_used VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PERSONA RESPONSES
-- =============================================================================

CREATE TABLE ppt.persona_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ppt.pressure_tests(id) ON DELETE CASCADE,
  archetype_id UUID NOT NULL REFERENCES ppt.persona_archetypes(id),

  -- Generated persona identity for this response
  persona_name VARCHAR(100) NOT NULL,
  persona_context JSONB NOT NULL DEFAULT '{}',
  -- persona_context: { age: number, specific_traits: string[], active_memories: uuid[] }

  -- Dual-track responses (ADR-005)
  gut_reaction TEXT NOT NULL,
  considered_view TEXT NOT NULL,
  social_response TEXT NOT NULL,
  private_thought TEXT NOT NULL,

  -- Metrics
  purchase_intent INTEGER NOT NULL CHECK (purchase_intent BETWEEN 1 AND 10),
  credibility_rating INTEGER NOT NULL CHECK (credibility_rating BETWEEN 1 AND 10),
  emotional_response VARCHAR(50) NOT NULL,
  -- emotional_response: 'excited', 'interested', 'neutral', 'skeptical', 'dismissive', 'hostile'

  -- Memory triggers
  triggered_memories UUID[] DEFAULT '{}',
  memory_influence_summary TEXT,

  -- Metadata
  generation_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Organizations
CREATE INDEX idx_ppt_org_slug ON ppt.organizations(slug);

-- Organization Members
CREATE INDEX idx_ppt_org_members_org ON ppt.organization_members(organization_id);
CREATE INDEX idx_ppt_org_members_user ON ppt.organization_members(user_id);

-- Projects
CREATE INDEX idx_ppt_projects_org ON ppt.projects(organization_id);
CREATE INDEX idx_ppt_projects_category ON ppt.projects(category);
CREATE INDEX idx_ppt_projects_not_archived ON ppt.projects(organization_id) WHERE archived_at IS NULL;

-- Persona Archetypes
CREATE INDEX idx_ppt_archetypes_category ON ppt.persona_archetypes(category);
CREATE INDEX idx_ppt_archetypes_slug ON ppt.persona_archetypes(slug);

-- Phantom Memories
CREATE INDEX idx_ppt_memories_archetype ON ppt.phantom_memories(archetype_id);
CREATE INDEX idx_ppt_memories_category ON ppt.phantom_memories(category);
CREATE INDEX idx_ppt_memories_keywords ON ppt.phantom_memories USING GIN(trigger_keywords);

-- Pressure Tests
CREATE INDEX idx_ppt_tests_project ON ppt.pressure_tests(project_id);
CREATE INDEX idx_ppt_tests_status ON ppt.pressure_tests(status);

-- Test Results
CREATE INDEX idx_ppt_results_test ON ppt.test_results(test_id);

-- Persona Responses
CREATE INDEX idx_ppt_responses_test ON ppt.persona_responses(test_id);
CREATE INDEX idx_ppt_responses_archetype ON ppt.persona_responses(archetype_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION ppt.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ppt_organizations_updated_at
  BEFORE UPDATE ON ppt.organizations
  FOR EACH ROW EXECUTE FUNCTION ppt.update_updated_at_column();

CREATE TRIGGER update_ppt_projects_updated_at
  BEFORE UPDATE ON ppt.projects
  FOR EACH ROW EXECUTE FUNCTION ppt.update_updated_at_column();

CREATE TRIGGER update_ppt_pressure_tests_updated_at
  BEFORE UPDATE ON ppt.pressure_tests
  FOR EACH ROW EXECUTE FUNCTION ppt.update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON SCHEMA ppt IS 'Phantom Pressure Test - Synthetic Qualitative Research Platform';
COMMENT ON TABLE ppt.organizations IS 'Multi-tenant organizations for PPT';
COMMENT ON TABLE ppt.persona_archetypes IS 'Base consumer archetypes with psychographics';
COMMENT ON TABLE ppt.phantom_memories IS 'Accumulated category experiences that shape persona responses';
COMMENT ON TABLE ppt.pressure_tests IS 'Marketing concept tests against persona panels';
COMMENT ON TABLE ppt.persona_responses IS 'Individual persona responses with dual-track insights';
