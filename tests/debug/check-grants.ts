/**
 * Check if grants are applied to ppt schema
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkGrants() {
  console.log('='.repeat(60))
  console.log('CHECK: Schema Grants')
  console.log('='.repeat(60))

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Query information_schema to see grants
  const { data: schemaPrivs, error: schemaErr } = await adminClient
    .from('information_schema.role_table_grants')
    .select('grantee, table_schema, table_name, privilege_type')
    .eq('table_schema', 'ppt')
    .limit(50)

  if (schemaErr) {
    console.log('Cannot query information_schema:', schemaErr.message)

    // Try querying a table that should be public
    const { data: tables, error: tablesErr } = await adminClient.rpc('get_schema_info')
    console.log('RPC result:', tables, tablesErr)
  } else {
    console.log('\nGrants found:')
    const byGrantee: Record<string, string[]> = {}
    schemaPrivs?.forEach(p => {
      const key = `${p.grantee}:${p.table_name}`
      if (!byGrantee[key]) byGrantee[key] = []
      byGrantee[key].push(p.privilege_type)
    })
    Object.entries(byGrantee).forEach(([key, privs]) => {
      console.log(`   ${key}: ${privs.join(', ')}`)
    })
  }

  // Alternative: Check via pg_catalog
  console.log('\n\nTrying to test authenticated access simulation...')

  // Create a test with user impersonation via service role
  const testUserId = '57a712ff-0000-0000-0000-000000000000' // from our debug

  // Use the REST API directly with auth header to simulate authenticated user
  const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id,name&limit=1`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Accept-Profile': 'ppt',
      'Content-Profile': 'ppt',
    }
  })

  console.log('Direct REST API call (service role):')
  console.log('   Status:', testResponse.status)
  const testData = await testResponse.json()
  console.log('   Response:', JSON.stringify(testData).slice(0, 200))

  // Now try with anon key
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const anonResponse = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id,name&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept-Profile': 'ppt',
      'Content-Profile': 'ppt',
    }
  })

  console.log('\nDirect REST API call (anon key, no user):')
  console.log('   Status:', anonResponse.status)
  const anonData = await anonResponse.json()
  console.log('   Response:', JSON.stringify(anonData).slice(0, 200))
}

checkGrants().catch(console.error)
