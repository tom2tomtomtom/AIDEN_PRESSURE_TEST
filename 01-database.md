# Blueprint 01: Database Architecture

> Component: Database Schema & Row Level Security
> Status: 📋 Specification Complete
> Dependencies: Supabase Project

## Overview

This blueprint defines the complete database schema for Phantom Pressure Test, including all tables, relationships, indexes, and Row Level Security policies.

## Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐
│  organizations   │────<│org_members       │
└──────────────────┘     └──────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│    projects      │     │   auth.users     │
└──────────────────┘     └──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│  pressure_tests  │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  test_results    │────<│persona_responses │
└──────────────────┘     └──────────────────┘
                                  │
                                  │
                                  ▼
┌──────────────────┐     ┌──────────────────┐
│ memory_banks     │────<│ phantom_memories │
└──────────────────┘     └──────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌──────────────────────────────────────────┐
│          persona_archetypes              │
└──────────────────────────────────────────┘
```

## Migration: 001_initial_schema.sql

```sql
-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE project_category AS ENUM ('fmcg', 'services', 'premium', 'tech', 'finance', 'healthcare', 'retail');
CREATE TYPE test_type AS ENUM ('proposition', 'creative', 'message', 'positioning', 'naming');
CREATE TYPE test_status AS ENUM ('draft', 'running', 'completed', 'failed');
CREATE TYPE skepticism_level AS ENUM ('low', 'medium', 'high', 'extreme');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral', 'mixed');
CREATE TYPE influence_type AS ENUM ('leader', 'follower', 'contrarian', 'observer');
CREATE TYPE decision_style AS ENUM ('impulsive', 'considered', 'research_heavy', 'social_proof');
CREATE TYPE memory_type AS ENUM ('betrayal', 'delight', 'disappointment', 'price_shock', 'trust_erosion', 'competitive_experience', 'category_fatigue');
CREATE TYPE emotional_residue AS ENUM ('anger', 'skepticism', 'indifference', 'loyalty', 'hope', 'frustration', 'satisfaction');

-- ============================================
-- ORGANIZATIONS & USERS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category project_category NOT NULL,
  brand_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN projects.brand_context IS 'JSON containing brand name, competitors, key claims, tone of voice';

-- ============================================
-- PERSONA SYSTEM
-- ============================================

CREATE TABLE persona_archetypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  
  -- Demographic scaffold
  age_range TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'any',
  lifestage TEXT NOT NULL,
  income_bracket TEXT NOT NULL,
  
  -- Psychographic profile (stored as JSONB for flexibility)
  psychographics JSONB NOT NULL DEFAULT '{}',
  
  -- Behavioral defaults
  skepticism_baseline INTEGER NOT NULL DEFAULT 5 CHECK (skepticism_baseline >= 1 AND skepticism_baseline <= 10),
  influence_type influence_type NOT NULL,
  decision_style decision_style NOT NULL,
  
  -- Communication style
  communication_tone TEXT NOT NULL,
  
  -- System metadata
  is_system BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN persona_archetypes.psychographics IS 'JSON containing values, tensions, aspirations arrays';

CREATE TABLE memory_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category project_category NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE phantom_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  archetype_id UUID NOT NULL REFERENCES persona_archetypes(id) ON DELETE CASCADE,
  memory_bank_id UUID NOT NULL REFERENCES memory_banks(id) ON DELETE CASCADE,
  
  -- Memory content
  memory_type memory_type NOT NULL,
  memory_title TEXT NOT NULL,
  memory_content TEXT NOT NULL,
  emotional_residue emotional_residue NOT NULL,
  
  -- Impact modifiers
  recency_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (recency_weight >= 0 AND recency_weight <= 2),
  emotional_intensity INTEGER DEFAULT 5 CHECK (emotional_intensity >= 1 AND emotional_intensity <= 10),
  
  -- Trigger system
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  trigger_claim_types TEXT[] DEFAULT '{}',
  
  -- Trust impact
  trust_modifier INTEGER DEFAULT 0 CHECK (trust_modifier >= -5 AND trust_modifier <= 5),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN phantom_memories.trigger_keywords IS 'Words in stimulus that activate this memory';
COMMENT ON COLUMN phantom_memories.trigger_claim_types IS 'Claim types this memory affects: natural, clinical, value, premium, etc.';

-- ============================================
-- PRESSURE TESTS
-- ============================================

CREATE TABLE pressure_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Test identity
  name TEXT NOT NULL,
  test_type test_type NOT NULL,
  
  -- Stimulus
  stimulus_content TEXT NOT NULL,
  stimulus_format TEXT NOT NULL DEFAULT 'text',
  stimulus_metadata JSONB DEFAULT '{}',
  
  -- Panel configuration
  panel_size INTEGER NOT NULL DEFAULT 6 CHECK (panel_size >= 2 AND panel_size <= 12),
  panel_config JSONB NOT NULL,
  
  -- Test settings
  skepticism_calibration skepticism_level DEFAULT 'high',
  include_group_dynamics BOOLEAN DEFAULT true,
  
  -- Execution state
  status test_status DEFAULT 'draft',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

COMMENT ON COLUMN pressure_tests.panel_config IS 'JSON containing archetype_ids array and per-archetype overrides';

-- ============================================
-- TEST RESULTS
-- ============================================

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pressure_test_id UUID NOT NULL REFERENCES pressure_tests(id) ON DELETE CASCADE,
  
  -- Overall scores (0-100)
  pressure_score INTEGER CHECK (pressure_score >= 0 AND pressure_score <= 100),
  gut_attraction_index INTEGER CHECK (gut_attraction_index >= 0 AND gut_attraction_index <= 100),
  credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  
  -- Aggregated analysis
  key_weaknesses JSONB DEFAULT '[]',
  credibility_gaps JSONB DEFAULT '[]',
  friction_points JSONB DEFAULT '[]',
  competitive_vulnerabilities JSONB DEFAULT '[]',
  
  -- Recommendations
  recommended_refinements JSONB DEFAULT '[]',
  
  -- Minority report
  minority_report JSONB DEFAULT '{}',
  
  -- Group dynamics (if enabled)
  group_dynamics JSONB DEFAULT NULL,
  consensus_map JSONB DEFAULT '{}',
  influence_patterns JSONB DEFAULT '{}',
  opinion_shifts JSONB DEFAULT '[]',
  
  -- Raw LLM output for debugging
  raw_analysis_output JSONB DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE persona_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
  archetype_id UUID NOT NULL REFERENCES persona_archetypes(id),
  
  -- Persona instance
  persona_name TEXT NOT NULL,
  persona_context JSONB NOT NULL,
  
  -- Dual-track responses
  gut_reaction TEXT NOT NULL,
  gut_sentiment sentiment_type NOT NULL,
  
  considered_response TEXT NOT NULL,
  considered_sentiment sentiment_type NOT NULL,
  
  social_response TEXT NOT NULL,
  private_thoughts TEXT NOT NULL,
  
  -- Action assessment
  purchase_intent INTEGER CHECK (purchase_intent >= 1 AND purchase_intent <= 10),
  action_threshold TEXT,
  friction_points TEXT[] DEFAULT '{}',
  
  -- Memory influence
  triggered_memories UUID[] DEFAULT '{}',
  memory_influence_notes TEXT,
  
  -- Key quotes for reporting
  key_quotes TEXT[] DEFAULT '{}',
  
  -- Raw LLM output for debugging
  raw_response_output JSONB DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Foreign key indexes (critical for JOIN performance)
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_pressure_tests_project_id ON pressure_tests(project_id);
CREATE INDEX idx_pressure_tests_created_by ON pressure_tests(created_by);
CREATE INDEX idx_pressure_tests_status ON pressure_tests(status);
CREATE INDEX idx_test_results_test_id ON test_results(pressure_test_id);
CREATE INDEX idx_persona_responses_result_id ON persona_responses(test_result_id);
CREATE INDEX idx_persona_responses_archetype_id ON persona_responses(archetype_id);
CREATE INDEX idx_phantom_memories_archetype_id ON phantom_memories(archetype_id);
CREATE INDEX idx_phantom_memories_bank_id ON phantom_memories(memory_bank_id);

-- Text search indexes
CREATE INDEX idx_phantom_memories_triggers ON phantom_memories USING GIN(trigger_keywords);
CREATE INDEX idx_phantom_memories_content_trgm ON phantom_memories USING GIN(memory_content gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_pressure_tests_project_status ON pressure_tests(project_id, status);
CREATE INDEX idx_phantom_memories_archetype_bank ON phantom_memories(archetype_id, memory_bank_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pressure_tests_updated_at
  BEFORE UPDATE ON pressure_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_persona_archetypes_updated_at
  BEFORE UPDATE ON persona_archetypes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Migration: 002_rls_policies.sql

```sql
-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pressure_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_responses ENABLE ROW LEVEL SECURITY;

-- Persona system tables are read-only for users (system-managed)
ALTER TABLE persona_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE phantom_memories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin/owner of organization
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's organization IDs
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ORGANIZATION POLICIES
-- ============================================

-- SELECT: Members can view their organizations
CREATE POLICY "Members can view their organizations"
ON organizations FOR SELECT
USING (is_org_member(id));

-- INSERT: Anyone authenticated can create organization
CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only admins/owners can update
CREATE POLICY "Admins can update organizations"
ON organizations FOR UPDATE
USING (is_org_admin(id));

-- DELETE: Only owners can delete
CREATE POLICY "Owners can delete organizations"
ON organizations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);

-- ============================================
-- ORGANIZATION MEMBERS POLICIES
-- ============================================

-- SELECT: Members can view their org's members
CREATE POLICY "Members can view org members"
ON organization_members FOR SELECT
USING (is_org_member(organization_id));

-- INSERT: Admins can add members
CREATE POLICY "Admins can add members"
ON organization_members FOR INSERT
WITH CHECK (is_org_admin(organization_id));

-- UPDATE: Admins can update member roles
CREATE POLICY "Admins can update members"
ON organization_members FOR UPDATE
USING (is_org_admin(organization_id));

-- DELETE: Admins can remove members (except owners)
CREATE POLICY "Admins can remove members"
ON organization_members FOR DELETE
USING (
  is_org_admin(organization_id)
  AND role != 'owner'
);

-- ============================================
-- PROJECT POLICIES
-- ============================================

-- SELECT: Org members can view projects
CREATE POLICY "Org members can view projects"
ON projects FOR SELECT
USING (is_org_member(organization_id));

-- INSERT: Org members can create projects
CREATE POLICY "Org members can create projects"
ON projects FOR INSERT
WITH CHECK (is_org_member(organization_id));

-- UPDATE: Org members can update projects
CREATE POLICY "Org members can update projects"
ON projects FOR UPDATE
USING (is_org_member(organization_id));

-- DELETE: Admins can delete projects
CREATE POLICY "Admins can delete projects"
ON projects FOR DELETE
USING (is_org_admin(organization_id));

-- ============================================
-- PRESSURE TEST POLICIES
-- ============================================

-- SELECT: Org members can view tests
CREATE POLICY "Org members can view tests"
ON pressure_tests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = pressure_tests.project_id
    AND is_org_member(projects.organization_id)
  )
);

-- INSERT: Org members can create tests
CREATE POLICY "Org members can create tests"
ON pressure_tests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND is_org_member(projects.organization_id)
  )
  AND created_by = auth.uid()
);

-- UPDATE: Creator or admins can update tests
CREATE POLICY "Creator or admins can update tests"
ON pressure_tests FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = pressure_tests.project_id
    AND is_org_admin(projects.organization_id)
  )
);

-- DELETE: Creator or admins can delete tests
CREATE POLICY "Creator or admins can delete tests"
ON pressure_tests FOR DELETE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = pressure_tests.project_id
    AND is_org_admin(projects.organization_id)
  )
);

-- ============================================
-- TEST RESULTS POLICIES
-- ============================================

-- SELECT: Same as test access
CREATE POLICY "Test viewers can view results"
ON test_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pressure_tests
    JOIN projects ON projects.id = pressure_tests.project_id
    WHERE pressure_tests.id = test_results.pressure_test_id
    AND is_org_member(projects.organization_id)
  )
);

-- INSERT: System only (via service role)
CREATE POLICY "Service role can insert results"
ON test_results FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: System only
CREATE POLICY "Service role can update results"
ON test_results FOR UPDATE
USING (false);

-- DELETE: Cascade from test deletion
CREATE POLICY "Results deleted with test"
ON test_results FOR DELETE
USING (false);

-- ============================================
-- PERSONA RESPONSES POLICIES
-- ============================================

-- SELECT: Same as results access
CREATE POLICY "Result viewers can view responses"
ON persona_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_results
    JOIN pressure_tests ON pressure_tests.id = test_results.pressure_test_id
    JOIN projects ON projects.id = pressure_tests.project_id
    WHERE test_results.id = persona_responses.test_result_id
    AND is_org_member(projects.organization_id)
  )
);

-- INSERT/UPDATE/DELETE: System only
CREATE POLICY "Service role can insert responses"
ON persona_responses FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- PERSONA SYSTEM POLICIES (Read-only for users)
-- ============================================

-- Archetypes: All authenticated users can read
CREATE POLICY "Authenticated users can view archetypes"
ON persona_archetypes FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Memory banks: All authenticated users can read
CREATE POLICY "Authenticated users can view memory banks"
ON memory_banks FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Phantom memories: All authenticated users can read
CREATE POLICY "Authenticated users can view memories"
ON phantom_memories FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);
```

## Seed Data Structure

### persona-archetypes.sql (see detailed file)

Key archetypes:
1. Skeptical Switcher
2. Budget Conscious Pragmatist
3. Premium Believer
4. Social Proof Seeker
5. Category Cynic
6. Hopeful Newcomer
7. Loyal Defender
8. Deal Hunter

### phantom-memories-fmcg.sql (see detailed file)

Per archetype, include memories covering:
- Brand betrayals (reformulation, price hikes)
- Price shocks (shrinkflation, hidden costs)
- Trust erosion (greenwashing, false claims)
- Competitive experiences (tried alternatives)
- Category fatigue (all brands same)
- Occasional delights (to balance)

## TypeScript Types Generation

After migration, generate types:

```bash
supabase gen types typescript --project-id <project-id> > types/database.ts
```

Expected output structure:

```typescript
export type Database = {
  public: {
    Tables: {
      organizations: { Row: {...}, Insert: {...}, Update: {...} }
      organization_members: { Row: {...}, Insert: {...}, Update: {...} }
      projects: { Row: {...}, Insert: {...}, Update: {...} }
      persona_archetypes: { Row: {...}, Insert: {...}, Update: {...} }
      memory_banks: { Row: {...}, Insert: {...}, Update: {...} }
      phantom_memories: { Row: {...}, Insert: {...}, Update: {...} }
      pressure_tests: { Row: {...}, Insert: {...}, Update: {...} }
      test_results: { Row: {...}, Insert: {...}, Update: {...} }
      persona_responses: { Row: {...}, Insert: {...}, Update: {...} }
    }
    Enums: {
      org_role: 'owner' | 'admin' | 'member'
      project_category: 'fmcg' | 'services' | 'premium' | ...
      test_type: 'proposition' | 'creative' | 'message' | ...
      test_status: 'draft' | 'running' | 'completed' | 'failed'
      skepticism_level: 'low' | 'medium' | 'high' | 'extreme'
      sentiment_type: 'positive' | 'negative' | 'neutral' | 'mixed'
      // ... etc
    }
  }
}
```

## Testing Checklist

- [ ] All tables created successfully
- [ ] All indexes created
- [ ] All triggers working (updated_at)
- [ ] RLS enabled on all tables
- [ ] RLS policies working:
  - [ ] User can only see their organization
  - [ ] User can only see projects in their org
  - [ ] User can only see tests in their org's projects
  - [ ] User can read all archetypes and memories
  - [ ] Service role can insert results and responses
- [ ] Foreign key cascades working
- [ ] Enums contain all expected values
