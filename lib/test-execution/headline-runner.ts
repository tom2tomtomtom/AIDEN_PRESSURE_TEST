/**
 * Headline Test Runner
 * Executes headline tournament tests
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { completeJSON, TEMPERATURES } from '@/lib/anthropic/client'
import { buildPersonaContext } from '@/lib/persona/context-builder'
import {
  buildHeadlineEvaluationPrompt,
  buildHeadlineSystemPrompt,
  validateHeadlineEvaluation,
  aggregateHeadlineResults,
  type HeadlineEvaluationSchema
} from '@/lib/prompts/headline-evaluation'
import type { CalibrationLevel } from '@/lib/persona/skepticism-calculator'

export interface HeadlineTestConfig {
  testId: string
  projectId: string
  headlines: string[]
  brief?: string
  archetypeIds: string[]
  calibration: CalibrationLevel
  category: string
}

export interface HeadlineResponse {
  personaName: string
  archetype: string
  archetypeId: string
  evaluation: HeadlineEvaluationSchema
  generationTimeMs: number
  tokensUsed: number
}

export interface HeadlineTestResult {
  testId: string
  status: 'completed' | 'partial' | 'failed'
  responses: HeadlineResponse[]
  aggregation: ReturnType<typeof aggregateHeadlineResults> | null
  executionTimeMs: number
  error?: string
}

/**
 * Execute a headline test
 */
export async function executeHeadlineTest(config: HeadlineTestConfig): Promise<HeadlineTestResult> {
  const startTime = Date.now()
  const supabase = createAdminClient()

  try {
    // Update test status to running
    await supabase
      .from('pressure_tests')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', config.testId)

    console.log(`[Headline Test ${config.testId}] Starting with ${config.headlines.length} headlines and ${config.archetypeIds.length} personas`)

    const responses: HeadlineResponse[] = []
    const errors: string[] = []

    // Generate responses from each persona (sequentially to avoid rate limits)
    for (const archetypeId of config.archetypeIds) {
      try {
        const responseStart = Date.now()

        // Build persona context
        const personaContext = await buildPersonaContext({
          archetypeId,
          stimulusText: config.headlines.join(' | '),
          category: config.category,
          calibration: config.calibration
        })

        // Build prompts
        const prompt = buildHeadlineEvaluationPrompt(personaContext, config.headlines, config.brief)
        const systemPrompt = buildHeadlineSystemPrompt()

        // Generate evaluation
        const result = await completeJSON<HeadlineEvaluationSchema>(prompt, {
          system: systemPrompt,
          temperature: TEMPERATURES.personaResponse,
          maxTokens: 2500
        })

        // Validate response
        if (!validateHeadlineEvaluation(result.parsed, config.headlines.length)) {
          console.warn(`[Headline Test ${config.testId}] Invalid response from ${personaContext.name.fullName}, retrying...`)

          // Retry once
          const retryResult = await completeJSON<HeadlineEvaluationSchema>(prompt, {
            system: systemPrompt,
            temperature: TEMPERATURES.personaResponse + 0.1,
            maxTokens: 2500
          })

          if (!validateHeadlineEvaluation(retryResult.parsed, config.headlines.length)) {
            throw new Error('Invalid response format after retry')
          }

          responses.push({
            personaName: personaContext.name.fullName,
            archetype: personaContext.archetype.name,
            archetypeId: personaContext.archetype.id,
            evaluation: retryResult.parsed,
            generationTimeMs: Date.now() - responseStart,
            tokensUsed: retryResult.usage.totalTokens
          })
        } else {
          responses.push({
            personaName: personaContext.name.fullName,
            archetype: personaContext.archetype.name,
            archetypeId: personaContext.archetype.id,
            evaluation: result.parsed,
            generationTimeMs: Date.now() - responseStart,
            tokensUsed: result.usage.totalTokens
          })
        }

        console.log(`[Headline Test ${config.testId}] Got response from ${personaContext.name.fullName}`)

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Headline Test ${config.testId}] Error for archetype ${archetypeId}:`, errorMsg)
        errors.push(`${archetypeId}: ${errorMsg}`)
      }
    }

    // Check if we have enough responses
    if (responses.length < 2) {
      throw new Error(`Not enough successful responses: ${responses.length}`)
    }

    // Aggregate results
    const aggregation = aggregateHeadlineResults(responses, config.headlines)

    // Store results
    await storeHeadlineResults(config.testId, config.headlines, responses, aggregation)

    // Update test status
    await supabase
      .from('pressure_tests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', config.testId)

    const executionTimeMs = Date.now() - startTime
    console.log(`[Headline Test ${config.testId}] Completed in ${executionTimeMs}ms`)

    return {
      testId: config.testId,
      status: errors.length > 0 ? 'partial' : 'completed',
      responses,
      aggregation,
      executionTimeMs
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await supabase
      .from('pressure_tests')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', config.testId)

    console.error(`[Headline Test ${config.testId}] Failed:`, errorMessage)

    return {
      testId: config.testId,
      status: 'failed',
      responses: [],
      aggregation: null,
      executionTimeMs: Date.now() - startTime,
      error: errorMessage
    }
  }
}

/**
 * Store headline test results
 */
async function storeHeadlineResults(
  testId: string,
  headlines: string[],
  responses: HeadlineResponse[],
  aggregation: ReturnType<typeof aggregateHeadlineResults>
): Promise<void> {
  const supabase = createAdminClient()

  // Store aggregated results
  const { error: resultError } = await supabase
    .from('test_results')
    .insert({
      test_id: testId,
      pressure_score: Math.round(aggregation.winner.avgScore * 10), // Convert 1-10 to 0-100
      gut_attraction_index: Math.round(aggregation.winner.avgScore * 10),
      credibility_score: Math.round(aggregation.winner.avgScore * 10),
      purchase_intent_avg: aggregation.winner.avgScore,
      key_strengths: aggregation.rankings.slice(0, 3).map(r => ({
        point: `#${r.index}: "${r.headline}"`,
        evidence: [`Avg score: ${r.avgScore}`, `Top picks: ${r.topPicks}`, `Winner picks: ${r.winnerPicks}`],
        confidence: 'high'
      })),
      key_weaknesses: aggregation.rankings.slice(-3).reverse().map(r => ({
        point: `#${r.index}: "${r.headline}"`,
        evidence: [`Avg score: ${r.avgScore}`, `Bottom picks: ${r.bottomPicks}`],
        severity: 'minor'
      })),
      recommendations: [{
        recommendation: `Use headline #${aggregation.winner.index}: "${aggregation.winner.headline}"`,
        rationale: `Highest average score (${aggregation.winner.avgScore}) with ${aggregation.consensus} consensus`,
        priority: 'must_fix',
        effort: 'low'
      }],
      total_responses: responses.length,
      execution_time_ms: responses.reduce((sum, r) => sum + r.generationTimeMs, 0),
      model_used: 'claude-sonnet-4-20250514',
      raw_analysis: {
        type: 'headline_test',
        headlines,
        rankings: aggregation.rankings,
        winner: aggregation.winner,
        consensus: aggregation.consensus,
        segmentInsights: aggregation.segmentInsights,
        verbatimHighlights: aggregation.verbatimHighlights
      }
    })

  if (resultError) {
    console.error('Error storing headline results:', resultError)
    throw new Error('Failed to store headline results')
  }

  // Store individual persona responses (adapted for headline format)
  const personaResponses = responses.map(r => ({
    test_id: testId,
    archetype_id: r.archetypeId,
    persona_name: r.personaName,
    persona_context: { archetype: r.archetype },
    gut_reaction: r.evaluation.gut_reaction,
    considered_view: `Top picks: ${r.evaluation.top_3.map(t => `#${t.headline_index}`).join(', ')}`,
    social_response: `Winner: #${r.evaluation.overall_winner}`,
    private_thought: r.evaluation.top_3[0]?.why_it_works || '',
    purchase_intent: Math.round(r.evaluation.all_ratings.reduce((sum, rat) => sum + rat.score, 0) / r.evaluation.all_ratings.length),
    credibility_rating: r.evaluation.all_ratings.find(rat => rat.headline_index === r.evaluation.overall_winner)?.score || 5,
    emotional_response: 'interested',
    what_works: r.evaluation.top_3.map(t => `#${t.headline_index}: ${t.why_it_works}`),
    key_concerns: r.evaluation.bottom_3.map(b => `#${b.headline_index}: ${b.why_it_fails}`),
    what_would_convince: `Preferred headlines: ${r.evaluation.top_3.map(t => `#${t.headline_index}`).join(', ')}`,
    triggered_memories: [],
    memory_influence_summary: '',
    generation_time_ms: r.generationTimeMs,
    tokens_used: r.tokensUsed
  }))

  const { error: responseError } = await supabase
    .from('persona_responses')
    .insert(personaResponses)

  if (responseError) {
    console.error('Error storing persona responses:', responseError)
    throw new Error('Failed to store persona responses')
  }
}

/**
 * Load headline test configuration
 */
export async function loadHeadlineTestConfig(testId: string): Promise<HeadlineTestConfig | null> {
  const supabase = createAdminClient()

  const { data: test, error } = await supabase
    .from('pressure_tests')
    .select(`
      id,
      project_id,
      stimulus_content,
      stimulus_context,
      panel_config
    `)
    .eq('id', testId)
    .single()

  if (error || !test) {
    return null
  }

  const panelConfig = test.panel_config as {
    archetypes?: string[]
    headlines?: string[]
    skepticism_override?: CalibrationLevel
  } || {}

  // Get project category
  const { data: project } = await supabase
    .from('projects')
    .select('category')
    .eq('id', test.project_id)
    .single()

  return {
    testId: test.id,
    projectId: test.project_id,
    headlines: panelConfig.headlines || [],
    brief: test.stimulus_context,
    archetypeIds: panelConfig.archetypes || [],
    calibration: panelConfig.skepticism_override || 'medium',
    category: project?.category || 'fmcg'
  }
}
