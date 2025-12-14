/**
 * Execute grants via direct Supabase SQL API
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function executeGrants() {
  console.log('Executing grants via Supabase SQL API...\n')

  const grants = [
    'GRANT USAGE ON SCHEMA ppt TO authenticated',
    'GRANT USAGE ON SCHEMA ppt TO anon',
    'GRANT SELECT ON ALL TABLES IN SCHEMA ppt TO authenticated',
    'GRANT INSERT ON ppt.organizations TO authenticated',
    'GRANT UPDATE ON ppt.organizations TO authenticated',
    'GRANT DELETE ON ppt.organizations TO authenticated',
    'GRANT INSERT ON ppt.organization_members TO authenticated',
    'GRANT UPDATE ON ppt.organization_members TO authenticated',
    'GRANT DELETE ON ppt.organization_members TO authenticated',
    'GRANT INSERT ON ppt.projects TO authenticated',
    'GRANT UPDATE ON ppt.projects TO authenticated',
    'GRANT DELETE ON ppt.projects TO authenticated',
    'GRANT INSERT ON ppt.pressure_tests TO authenticated',
    'GRANT UPDATE ON ppt.pressure_tests TO authenticated',
    'GRANT DELETE ON ppt.pressure_tests TO authenticated',
    'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ppt TO authenticated',
  ]

  // Try via pg-meta API
  const projectRef = 'ahenbjcauqpzsdcxeyfa'

  for (const sql of grants) {
    console.log(`Executing: ${sql.slice(0, 60)}...`)

    // Try multiple endpoints
    const endpoints = [
      `${SUPABASE_URL}/pg/query`,
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    ]

    let success = false
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: sql, sql: sql })
        })

        if (response.ok) {
          console.log('   ✅ Success')
          success = true
          break
        }
      } catch (e) {
        // Try next endpoint
      }
    }

    if (!success) {
      console.log('   ⚠️ Could not execute via API')
    }
  }

  console.log('\n\nAlternative: Use Supabase Dashboard SQL Editor')
  console.log('URL: https://supabase.com/dashboard/project/ahenbjcauqpzsdcxeyfa/sql')
  console.log('\nRun this SQL:')
  console.log('-'.repeat(60))
  console.log(grants.join(';\n') + ';')
  console.log('-'.repeat(60))

  // Test access after
  console.log('\n\nTesting access...')
  const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/persona_archetypes?select=name&limit=1`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Accept-Profile': 'ppt',
    }
  })
  console.log('Service role access:', testResponse.status, await testResponse.text())
}

executeGrants().catch(console.error)
