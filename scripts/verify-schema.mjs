import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env vars
const envFile = readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Create client with ppt schema
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'ppt' }
  }
);

console.log('Verifying PPT schema tables...\n');

// Test organizations table
const { data: orgs, error: orgsErr } = await supabase
  .schema('ppt')
  .from('organizations')
  .select('*')
  .limit(1);

if (orgsErr) {
  console.log('ERROR ppt.organizations:', orgsErr.message);
} else {
  console.log('SUCCESS: ppt.organizations table exists');
}

// Test projects table
const { data: projects, error: projErr } = await supabase
  .schema('ppt')
  .from('projects')
  .select('*')
  .limit(1);

if (projErr) {
  console.log('ERROR ppt.projects:', projErr.message);
} else {
  console.log('SUCCESS: ppt.projects table exists');
}

// Test archetypes table
const { data: archetypes, error: archErr } = await supabase
  .schema('ppt')
  .from('persona_archetypes')
  .select('*')
  .limit(1);

if (archErr) {
  console.log('ERROR ppt.persona_archetypes:', archErr.message);
} else {
  console.log('SUCCESS: ppt.persona_archetypes table exists');
}

// Test phantom_memories table
const { data: memories, error: memErr } = await supabase
  .schema('ppt')
  .from('phantom_memories')
  .select('*')
  .limit(1);

if (memErr) {
  console.log('ERROR ppt.phantom_memories:', memErr.message);
} else {
  console.log('SUCCESS: ppt.phantom_memories table exists');
}

// Test pressure_tests table
const { data: tests, error: testsErr } = await supabase
  .schema('ppt')
  .from('pressure_tests')
  .select('*')
  .limit(1);

if (testsErr) {
  console.log('ERROR ppt.pressure_tests:', testsErr.message);
} else {
  console.log('SUCCESS: ppt.pressure_tests table exists');
}

console.log('\nSchema verification complete!');
