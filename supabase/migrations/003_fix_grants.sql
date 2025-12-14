-- Migration 003: Fix schema grants for PPT
-- This ensures authenticated users can access the ppt schema

-- Grant schema usage
GRANT USAGE ON SCHEMA ppt TO authenticated;
GRANT USAGE ON SCHEMA ppt TO anon;
GRANT USAGE ON SCHEMA ppt TO service_role;

-- Grant table permissions to authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated;

-- Organizations - full CRUD
GRANT INSERT, UPDATE, DELETE ON ppt.organizations TO authenticated;

-- Organization members - full CRUD
GRANT INSERT, UPDATE, DELETE ON ppt.organization_members TO authenticated;

-- Projects - full CRUD
GRANT INSERT, UPDATE, DELETE ON ppt.projects TO authenticated;

-- Pressure tests - full CRUD
GRANT INSERT, UPDATE, DELETE ON ppt.pressure_tests TO authenticated;

-- Test results and persona responses are read-only for authenticated (written by service role)
-- Already have SELECT from above

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated;

-- Grant all to service_role
GRANT ALL ON ALL TABLES IN SCHEMA ppt TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ppt TO service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT SELECT, USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT ALL ON SEQUENCES TO service_role;
