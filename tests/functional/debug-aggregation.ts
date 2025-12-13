/**
 * Debug test for aggregation
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugAggregation() {
  console.log('=== Debug Aggregation ===\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Get an archetype
  const { data: archetypes } = await supabase
    .schema('ppt')
    .from('persona_archetypes')
    .select('*')
    .limit(2)

  if (!archetypes?.length) {
    console.error('No archetypes found')
    return
  }

  console.log('1. Generating persona responses...')

  // Generate responses
  const { generatePersonaResponse } = await import('../../lib/test-execution/response-generator')

  const stimulus = 'Premium yogurt made with organic ingredients. Price: $6.99'
  const responses = []

  for (const arch of archetypes) {
    console.log(`   Generating for ${arch.name}...`)
    const response = await generatePersonaResponse(
      arch.id,
      stimulus,
      'concept',
      'fmcg',
      'medium'
    )
    responses.push(response)
    console.log(`   Done - purchase_intent: ${response.response.purchase_intent}`)
  }

  console.log('\n2. Testing aggregation...')
  const {
    buildResponseSummaries,
    buildAggregatedAnalysisPrompt,
    buildAnalysisSystemPrompt,
    calculateBasicMetrics
  } = await import('../../lib/prompts/aggregated-analysis')

  const responseSummaries = buildResponseSummaries(
    responses.map(r => ({
      personaName: r.personaContext.name.fullName,
      archetypeName: r.personaContext.archetype.name,
      response: r.response
    }))
  )

  console.log('   Response summaries built:', responseSummaries.length)
  console.log('   Basic metrics:', calculateBasicMetrics(responseSummaries))

  console.log('\n3. Calling Claude for aggregation...')
  const { completeJSON, TEMPERATURES } = await import('../../lib/anthropic/client')

  const prompt = buildAggregatedAnalysisPrompt(stimulus, responseSummaries)
  const systemPrompt = buildAnalysisSystemPrompt()

  try {
    const result = await completeJSON(prompt, {
      system: systemPrompt,
      temperature: TEMPERATURES.aggregatedAnalysis,
      maxTokens: 3000
    })

    console.log('   Raw parsed result keys:', Object.keys(result.parsed))
    console.log('   Raw parsed result:', JSON.stringify(result.parsed, null, 2).slice(0, 1000))

    // Check individual fields
    const r = result.parsed as Record<string, unknown>
    console.log('\n   Validation checks:')
    console.log('   - pressure_score:', typeof r.pressure_score, r.pressure_score)
    console.log('   - gut_attraction_index:', typeof r.gut_attraction_index, r.gut_attraction_index)
    console.log('   - credibility_score:', typeof r.credibility_score, r.credibility_score)
    console.log('   - purchase_intent_avg:', typeof r.purchase_intent_avg, r.purchase_intent_avg)
    console.log('   - key_strengths:', Array.isArray(r.key_strengths), r.key_strengths?.length)
    console.log('   - key_weaknesses:', Array.isArray(r.key_weaknesses), r.key_weaknesses?.length)
    console.log('   - recommendations:', Array.isArray(r.recommendations), r.recommendations?.length)
    console.log('   - one_line_verdict:', typeof r.one_line_verdict)
    console.log('   - would_proceed:', typeof r.would_proceed)

  } catch (error: any) {
    console.error('   Error:', error.message)
    console.error('   Stack:', error.stack?.split('\n').slice(0, 5).join('\n'))
  }

  console.log('\n=== Debug Complete ===')
}

debugAggregation()
