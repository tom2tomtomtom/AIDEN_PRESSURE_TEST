/**
 * Fix schema grants for PPT schema
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function fixGrants() {
  console.log('='.repeat(60))
  console.log('FIX: Schema Grants for PPT')
  console.log('='.repeat(60))

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const grants = [
    // Grant schema usage
    'GRANT USAGE ON SCHEMA ppt TO authenticated',
    'GRANT USAGE ON SCHEMA ppt TO anon',
    'GRANT USAGE ON SCHEMA ppt TO service_role',

    // Grant table permissions to authenticated
    'GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated',
    'GRANT INSERT ON ppt.organizations TO authenticated',
    'GRANT INSERT ON ppt.organization_members TO authenticated',
    'GRANT INSERT ON ppt.projects TO authenticated',
    'GRANT UPDATE ON ppt.projects TO authenticated',
    'GRANT DELETE ON ppt.projects TO authenticated',
    'GRANT INSERT ON ppt.pressure_tests TO authenticated',
    'GRANT UPDATE ON ppt.pressure_tests TO authenticated',
    'GRANT DELETE ON ppt.pressure_tests TO authenticated',

    // Grant all to service_role
    'GRANT ALL ON ALL TABLES IN SCHEMA ppt TO service_role',
    'GRANT ALL ON ALL SEQUENCES IN SCHEMA ppt TO service_role',

    // Grant sequence usage to authenticated
    'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated',

    // Set default privileges for future tables
    'ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT SELECT ON TABLES TO authenticated',
    'ALTER DEFAULT PRIVILEGES IN SCHEMA ppt GRANT ALL ON TABLES TO service_role',
  ]

  console.log('\nApplying grants...\n')

  for (const grant of grants) {
    try {
      const { error } = await adminClient.rpc('exec_sql', { sql: grant })
      if (error) {
        // Try alternative method
        console.log(`   ⚠️  ${grant.slice(0, 50)}... - RPC failed, trying direct`)
      } else {
        console.log(`   ✅ ${grant.slice(0, 60)}...`)
      }
    } catch (e) {
      console.log(`   ⚠️  ${grant.slice(0, 50)}... - ${e}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('Testing access after grants...')
  console.log('='.repeat(60))

  // Test with a client configured for ppt schema
  const pptClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    db: { schema: 'ppt' }
  })

  const { data, error } = await pptClient
    .from('persona_archetypes')
    .select('id, name')
    .limit(1)

  if (error) {
    console.log('\n❌ Still failing:', error.message)
  } else {
    console.log('\n✅ Access working! Found:', data?.[0]?.name)
  }
}

fixGrants().catch(console.error)
