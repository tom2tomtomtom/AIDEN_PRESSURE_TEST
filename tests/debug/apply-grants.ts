/**
 * Apply grants via Supabase REST API
 * This needs to be run via Supabase SQL Editor or CLI
 */

console.log(`
=============================================================
GRANTS NEED TO BE APPLIED IN SUPABASE SQL EDITOR
=============================================================

The ppt schema exists but the 'authenticated' role doesn't have
USAGE permission on it.

Run this SQL in Supabase Dashboard > SQL Editor:

-----------------------------------------------------------
-- Grant schema usage to authenticated users
GRANT USAGE ON SCHEMA ppt TO authenticated;
GRANT USAGE ON SCHEMA ppt TO anon;
GRANT USAGE ON SCHEMA ppt TO service_role;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.organizations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.organization_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.pressure_tests TO authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated;

-- Grant all to service_role
GRANT ALL ON ALL TABLES IN SCHEMA ppt TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ppt TO service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT ALL ON TABLES TO service_role;
-----------------------------------------------------------

After running, verify with:
SELECT grantee, table_schema, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'ppt'
AND grantee IN ('authenticated', 'anon')
LIMIT 20;
`)

// Try to apply via supabase CLI if available
import { execSync } from 'child_process'

const sql = `
GRANT USAGE ON SCHEMA ppt TO authenticated;
GRANT USAGE ON SCHEMA ppt TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.organizations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.organization_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ppt.pressure_tests TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ppt TO service_role;
`

console.log('\nTrying to apply via supabase CLI...')
try {
  const result = execSync(`echo "${sql}" | npx supabase db execute --project-ref ahenbjcauqpzsdcxeyfa`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  })
  console.log('Result:', result)
} catch (e: any) {
  console.log('Supabase CLI not available or failed:', e.message?.slice(0, 100))
  console.log('\nPlease run the SQL manually in Supabase Dashboard.')
}
