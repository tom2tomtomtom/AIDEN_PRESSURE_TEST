/**
 * Functional E2E Test - User Workflow
 * Tests the complete user journey:
 * 1. Create a project
 * 2. Create a pressure test
 * 3. Run the test
 * 4. View results
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Test data
const TEST_PROJECT = {
  name: 'E2E Test Project - ' + Date.now(),
  description: 'Automated test project for functional testing',
  category: 'fmcg'
}

const TEST_STIMULUS = {
  name: 'Premium Yogurt Concept Test',
  description: 'Testing consumer response to new yogurt positioning',
  stimulus_type: 'concept',
  stimulus_content: `
Introducing "Pure Balance" - A revolutionary probiotic yogurt made with
organic grass-fed milk and 12 active cultures. Each serving contains
15g of protein and only 5g of natural sugars.

Key claims:
- "Clinically proven to support digestive health"
- "Made with milk from farms within 50 miles"
- "No artificial anything - ever"

Price: $6.99 for a 4-pack (vs $4.99 for leading competitor)
  `.trim(),
  stimulus_context: 'Premium segment, targeting health-conscious millennials'
}

interface TestResult {
  step: string
  success: boolean
  data?: any
  error?: string
  duration?: number
}

const results: TestResult[] = []

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function recordResult(step: string, success: boolean, data?: any, error?: string, duration?: number) {
  results.push({ step, success, data, error, duration })
  if (success) {
    log(`✅ ${step} - ${duration ? duration + 'ms' : 'OK'}`)
  } else {
    log(`❌ ${step} - ${error}`)
  }
}

async function getAuthenticatedClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Get or create test user
  const testEmail = 'e2e-test@phantomtest.local'

  // Try to find existing user
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  let testUser = existingUsers?.users?.find(u => u.email === testEmail)

  if (!testUser) {
    log('Creating test user...')
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      user_metadata: { full_name: 'E2E Test User' }
    })
    if (error) throw new Error(`Failed to create user: ${error.message}`)
    testUser = newUser.user
  }

  // Create organization if needed (organizations table doesn't have owner_id)
  // Look for existing membership first
  const { data: existingMembership } = await supabase
    .schema('ppt')
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', testUser.id)
    .single()

  let orgId = existingMembership?.organization_id

  if (!orgId) {
    log('Creating organization...')
    const slug = `e2e-test-org-${Date.now()}`
    const { data: newOrg, error: orgError } = await supabase
      .schema('ppt')
      .from('organizations')
      .insert({ name: 'E2E Test Org', slug })
      .select('id')
      .single()

    if (orgError) throw new Error(`Failed to create org: ${orgError.message}`)
    orgId = newOrg.id

    // Add user to org as owner
    const { error: memberError } = await supabase
      .schema('ppt')
      .from('organization_members')
      .insert({ organization_id: orgId, user_id: testUser.id, role: 'owner' })

    if (memberError) throw new Error(`Failed to add member: ${memberError.message}`)
  }

  return { supabase, userId: testUser.id, orgId }
}

async function testProjectCreation(supabase: any, orgId: string) {
  const start = Date.now()

  const { data: project, error } = await supabase
    .schema('ppt')
    .from('projects')
    .insert({
      organization_id: orgId,
      name: TEST_PROJECT.name,
      description: TEST_PROJECT.description,
      category: TEST_PROJECT.category
    })
    .select()
    .single()

  if (error) {
    recordResult('Create Project', false, null, error.message)
    return null
  }

  recordResult('Create Project', true, { id: project.id, name: project.name }, undefined, Date.now() - start)
  return project
}

async function testArchetypesAvailable(supabase: any) {
  const start = Date.now()

  // Note: table is persona_archetypes not archetypes
  const { data: archetypes, error } = await supabase
    .schema('ppt')
    .from('persona_archetypes')
    .select('id, name, slug, category, baseline_skepticism')

  if (error) {
    recordResult('Load Archetypes', false, null, error.message)
    return []
  }

  if (!archetypes || archetypes.length === 0) {
    recordResult('Load Archetypes', false, null, 'No archetypes found in database')
    return []
  }

  recordResult('Load Archetypes', true, { count: archetypes.length, names: archetypes.map((a: any) => a.name) }, undefined, Date.now() - start)
  return archetypes
}

async function testCreatePressureTest(supabase: any, projectId: string, archetypeIds: string[]) {
  const start = Date.now()

  const { data: test, error } = await supabase
    .schema('ppt')
    .from('pressure_tests')
    .insert({
      project_id: projectId,
      name: TEST_STIMULUS.name,
      stimulus_type: TEST_STIMULUS.stimulus_type,
      stimulus_content: TEST_STIMULUS.stimulus_content,
      panel_config: {
        archetypes: archetypeIds,
        skepticism_override: 'medium',
        panel_size: archetypeIds.length
      },
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    recordResult('Create Pressure Test', false, null, error.message)
    return null
  }

  recordResult('Create Pressure Test', true, { id: test.id, name: test.name, status: test.status }, undefined, Date.now() - start)
  return test
}

async function testRunPressureTest(testId: string) {
  const start = Date.now()

  log('Executing pressure test (this may take 30-60 seconds)...')

  try {
    // Import the test runner directly
    const { executeTest, loadTestConfig } = await import('../../lib/test-execution/runner')

    // Load test configuration first
    const config = await loadTestConfig(testId)
    if (!config) {
      recordResult('Run Pressure Test', false, null, 'Failed to load test configuration')
      return null
    }

    log(`Config loaded: ${config.archetypeIds.length} archetypes, category: ${config.category}`)

    const result = await executeTest(config)

    if (result.status === 'failed') {
      recordResult('Run Pressure Test', false, null, result.error || 'Unknown error')
      return null
    }

    recordResult('Run Pressure Test', true, {
      pressure_score: result.aggregation?.analysis?.pressure_score,
      response_count: result.responses?.length
    }, undefined, Date.now() - start)

    // Return formatted results
    return {
      pressure_score: result.aggregation?.analysis?.pressure_score,
      gut_attraction_index: result.aggregation?.analysis?.gut_attraction_index,
      credibility_score: result.aggregation?.analysis?.credibility_score,
      key_strengths: result.aggregation?.analysis?.key_strengths,
      key_weaknesses: result.aggregation?.analysis?.key_weaknesses,
      recommendations: result.aggregation?.analysis?.recommendations,
      individual_responses: result.responses?.map((r: any) => ({
        persona_name: r.personaName,
        gut_reaction: r.response?.gut_reaction,
        purchase_intent: r.response?.purchase_intent,
        credibility_rating: r.response?.credibility_rating
      }))
    }
  } catch (error: any) {
    recordResult('Run Pressure Test', false, null, error.message)
    return null
  }
}

async function testVerifyResults(supabase: any, testId: string) {
  const start = Date.now()

  // Check test status
  const { data: test, error: testError } = await supabase
    .schema('ppt')
    .from('pressure_tests')
    .select('status')
    .eq('id', testId)
    .single()

  if (testError || test.status !== 'completed') {
    recordResult('Verify Test Status', false, null, testError?.message || `Status is ${test?.status}, expected completed`)
    return false
  }

  recordResult('Verify Test Status', true, { status: test.status }, undefined, Date.now() - start)

  // Check test results exist
  const { data: testResults, error: resultsError } = await supabase
    .schema('ppt')
    .from('test_results')
    .select('*')
    .eq('test_id', testId)
    .single()

  if (resultsError || !testResults) {
    recordResult('Verify Results Exist', false, null, resultsError?.message || 'No results found')
    return false
  }

  recordResult('Verify Results Exist', true, {
    pressure_score: testResults.pressure_score,
    gut_attraction_index: testResults.gut_attraction_index,
    credibility_score: testResults.credibility_score,
    has_recommendations: testResults.recommendations?.length > 0
  })

  // Check persona responses exist (column is persona_name not generated_name)
  const { data: responses, error: responsesError } = await supabase
    .schema('ppt')
    .from('persona_responses')
    .select('id, archetype_id, persona_name')
    .eq('test_id', testId)

  if (responsesError || !responses || responses.length === 0) {
    recordResult('Verify Persona Responses', false, null, responsesError?.message || 'No responses found')
    return false
  }

  recordResult('Verify Persona Responses', true, {
    count: responses.length,
    personas: responses.map((r: any) => r.persona_name)
  })

  return true
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('PHANTOM PRESSURE TEST - FUNCTIONAL E2E TEST')
  console.log('='.repeat(60) + '\n')

  const startTime = Date.now()

  try {
    // Step 1: Set up authenticated client
    log('Setting up authenticated client...')
    const { supabase, userId, orgId } = await getAuthenticatedClient()
    recordResult('Setup Auth', true, { userId, orgId })

    // Step 2: Create project
    log('\n--- STEP 1: Create Project ---')
    const project = await testProjectCreation(supabase, orgId)
    if (!project) throw new Error('Project creation failed')

    // Step 3: Load archetypes
    log('\n--- STEP 2: Load Archetypes ---')
    const archetypes = await testArchetypesAvailable(supabase)
    if (archetypes.length === 0) throw new Error('No archetypes available')

    // Select 4 archetypes for testing
    const selectedArchetypes = archetypes.slice(0, 4).map((a: any) => a.id)
    log(`Selected ${selectedArchetypes.length} archetypes for panel`)

    // Step 4: Create pressure test
    log('\n--- STEP 3: Create Pressure Test ---')
    const pressureTest = await testCreatePressureTest(supabase, project.id, selectedArchetypes)
    if (!pressureTest) throw new Error('Pressure test creation failed')

    // Step 5: Run the test
    log('\n--- STEP 4: Execute Pressure Test ---')
    const testResults = await testRunPressureTest(pressureTest.id)

    // Step 6: Verify results
    log('\n--- STEP 5: Verify Results ---')
    await testVerifyResults(supabase, pressureTest.id)

    // Print final results
    const totalTime = Date.now() - startTime
    console.log('\n' + '='.repeat(60))
    console.log('TEST SUMMARY')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`\nTotal: ${results.length} tests`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Duration: ${(totalTime / 1000).toFixed(1)}s`)

    if (failed > 0) {
      console.log('\nFailed tests:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.step}: ${r.error}`)
      })
    }

    // Show key metrics if test ran successfully
    if (testResults) {
      console.log('\n' + '='.repeat(60))
      console.log('PRESSURE TEST RESULTS')
      console.log('='.repeat(60))

      console.log(`\n📊 SCORES:`)
      console.log(`   Pressure Score:    ${testResults.pressure_score}/100`)
      console.log(`   Gut Attraction:    ${testResults.gut_attraction_index}/100`)
      console.log(`   Credibility:       ${testResults.credibility_score}/100`)

      if (testResults.key_strengths?.length > 0) {
        console.log(`\n💪 STRENGTHS:`)
        testResults.key_strengths.slice(0, 3).forEach((s: string) => console.log(`   + ${s}`))
      }

      if (testResults.key_weaknesses?.length > 0) {
        console.log(`\n⚠️  WEAKNESSES:`)
        testResults.key_weaknesses.slice(0, 3).forEach((w: string) => console.log(`   - ${w}`))
      }

      if (testResults.recommendations?.length > 0) {
        console.log(`\n💡 RECOMMENDATIONS:`)
        testResults.recommendations.slice(0, 3).forEach((r: any) => {
          console.log(`   [${r.priority}] ${r.recommendation}`)
        })
      }

      if (testResults.individual_responses?.length > 0) {
        console.log(`\n👥 INDIVIDUAL RESPONSES (${testResults.individual_responses.length} personas):`)
        testResults.individual_responses.slice(0, 3).forEach((r: any) => {
          console.log(`   ${r.persona_name || 'Persona'}:`)
          console.log(`      Gut: "${r.gut_reaction?.slice(0, 80)}..."`)
          console.log(`      Intent: ${r.purchase_intent}/10 | Credibility: ${r.credibility_rating}/10`)
        })
        if (testResults.individual_responses.length > 3) {
          console.log(`   ... and ${testResults.individual_responses.length - 3} more`)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    log('Test data preserved for manual inspection')
    log(`Project ID: ${project.id}`)
    log(`Test ID: ${pressureTest.id}`)
    console.log('='.repeat(60) + '\n')

    process.exit(failed > 0 ? 1 : 0)

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
