-- Migration 002: Row Level Security Policies for Phantom Pressure Test
-- Implements organization-based multi-tenancy (ADR-006)

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Check if user is a member of an organization
CREATE OR REPLACE FUNCTION ppt.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ppt.organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is an admin or owner of an organization
CREATE OR REPLACE FUNCTION ppt.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ppt.organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all organization IDs for current user
CREATE OR REPLACE FUNCTION ppt.user_org_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT organization_id FROM ppt.organization_members
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE ppt.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.persona_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.phantom_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.pressure_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt.persona_responses ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ORGANIZATIONS POLICIES
-- =============================================================================

CREATE POLICY "Users can view their organizations"
  ON ppt.organizations FOR SELECT
  USING (id = ANY(ppt.user_org_ids()));

CREATE POLICY "Users can create organizations"
  ON ppt.organizations FOR INSERT
  WITH CHECK (true);
  -- Note: After insert, we need to add the user as owner via application logic

CREATE POLICY "Admins can update their organizations"
  ON ppt.organizations FOR UPDATE
  USING (ppt.is_org_admin(id));

CREATE POLICY "Owners can delete their organizations"
  ON ppt.organizations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM ppt.organization_members
    WHERE organization_id = id
    AND user_id = auth.uid()
    AND role = 'owner'
  ));

-- =============================================================================
-- ORGANIZATION MEMBERS POLICIES
-- =============================================================================

CREATE POLICY "Members can view their organization's members"
  ON ppt.organization_members FOR SELECT
  USING (ppt.is_org_member(organization_id));

CREATE POLICY "Admins can add members"
  ON ppt.organization_members FOR INSERT
  WITH CHECK (ppt.is_org_admin(organization_id) OR auth.uid() = user_id);
  -- Users can also add themselves (for org creation flow)

CREATE POLICY "Admins can update member roles"
  ON ppt.organization_members FOR UPDATE
  USING (ppt.is_org_admin(organization_id));

CREATE POLICY "Admins can remove members"
  ON ppt.organization_members FOR DELETE
  USING (ppt.is_org_admin(organization_id) OR user_id = auth.uid());
  -- Members can also remove themselves

-- =============================================================================
-- PROJECTS POLICIES
-- =============================================================================

CREATE POLICY "Members can view organization projects"
  ON ppt.projects FOR SELECT
  USING (ppt.is_org_member(organization_id));

CREATE POLICY "Members can create projects"
  ON ppt.projects FOR INSERT
  WITH CHECK (ppt.is_org_member(organization_id));

CREATE POLICY "Members can update projects"
  ON ppt.projects FOR UPDATE
  USING (ppt.is_org_member(organization_id));

CREATE POLICY "Admins can delete projects"
  ON ppt.projects FOR DELETE
  USING (ppt.is_org_admin(organization_id));

-- =============================================================================
-- PERSONA ARCHETYPES POLICIES (Read-only for all authenticated users)
-- =============================================================================

CREATE POLICY "Authenticated users can view archetypes"
  ON ppt.persona_archetypes FOR SELECT
  USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE for regular users
-- Archetypes are seeded by admin/service role only

-- =============================================================================
-- PHANTOM MEMORIES POLICIES (Read-only for all authenticated users)
-- =============================================================================

CREATE POLICY "Authenticated users can view memories"
  ON ppt.phantom_memories FOR SELECT
  USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE for regular users
-- Memories are seeded by admin/service role only

-- =============================================================================
-- PRESSURE TESTS POLICIES
-- =============================================================================

CREATE POLICY "Members can view organization tests"
  ON ppt.pressure_tests FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM ppt.projects WHERE organization_id = ANY(ppt.user_org_ids())
    )
  );

CREATE POLICY "Members can create tests"
  ON ppt.pressure_tests FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM ppt.projects WHERE organization_id = ANY(ppt.user_org_ids())
    )
  );

CREATE POLICY "Members can update tests"
  ON ppt.pressure_tests FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM ppt.projects WHERE organization_id = ANY(ppt.user_org_ids())
    )
  );

CREATE POLICY "Members can delete draft tests"
  ON ppt.pressure_tests FOR DELETE
  USING (
    status = 'draft' AND
    project_id IN (
      SELECT id FROM ppt.projects WHERE organization_id = ANY(ppt.user_org_ids())
    )
  );

-- =============================================================================
-- TEST RESULTS POLICIES (Read-only, written by service role)
-- =============================================================================

CREATE POLICY "Members can view test results"
  ON ppt.test_results FOR SELECT
  USING (
    test_id IN (
      SELECT pt.id FROM ppt.pressure_tests pt
      JOIN ppt.projects p ON pt.project_id = p.id
      WHERE p.organization_id = ANY(ppt.user_org_ids())
    )
  );

-- INSERT/UPDATE/DELETE handled by service role only (test execution engine)

-- =============================================================================
-- PERSONA RESPONSES POLICIES (Read-only, written by service role)
-- =============================================================================

CREATE POLICY "Members can view persona responses"
  ON ppt.persona_responses FOR SELECT
  USING (
    test_id IN (
      SELECT pt.id FROM ppt.pressure_tests pt
      JOIN ppt.projects p ON pt.project_id = p.id
      WHERE p.organization_id = ANY(ppt.user_org_ids())
    )
  );

-- INSERT/UPDATE/DELETE handled by service role only (test execution engine)

-- =============================================================================
-- GRANT USAGE ON SCHEMA
-- =============================================================================

GRANT USAGE ON SCHEMA ppt TO authenticated;
GRANT USAGE ON SCHEMA ppt TO service_role;

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ppt TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ppt TO service_role;
