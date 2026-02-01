/**
 * Push migration to Supabase using the Management API
 * Run with: npx tsx scripts/push-migration.ts
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

async function runSQL(sql: string): Promise<any> {
  // Use the Supabase SQL API endpoint (via PostgREST RPC)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`SQL execution failed: ${response.status} - ${text}`)
  }

  return response.json()
}

async function main() {
  console.log('Pushing migration to Supabase...')
  console.log(`Project: ${projectRef}`)

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/009_seed_archetypes.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('\nMigration SQL loaded.')
  console.log('Attempting to run via PostgREST...\n')

  try {
    const result = await runSQL(sql)
    console.log('Result:', result)
  } catch (error: any) {
    console.log('PostgREST method not available (expected).')
    console.log('\nAlternative: Copy the SQL below and run it in Supabase Dashboard SQL Editor:')
    console.log('URL: https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
    console.log('\n' + '='.repeat(60) + '\n')
    console.log(sql)
    console.log('\n' + '='.repeat(60) + '\n')

    console.log('After running the migration, you can seed archetypes by calling the function:')
    console.log(`
curl -X POST '${SUPABASE_URL}/rest/v1/rpc/seed_persona_archetypes' \\
  -H "apikey: ${SERVICE_ROLE_KEY}" \\
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \\
  -H "Content-Type: application/json"
    `)
  }
}

main()
