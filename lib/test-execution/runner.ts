/**
 * Test Execution Runner
 * Orchestrates the full test execution pipeline
 * Supports both standard and moderated conversation modes
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  generatePanelResponses,
  retryFailedGenerations,
  calculateTotalUsage,
  type GeneratedResponse,
  type GenerationError
} from './response-generator'
import {
  aggregateResults,
  formatAnalysisForStorage,
  formatResponseForStorage,
  type AggregationResult
} from './result-aggregator'
import {
  orchestrateConversation,
  storeConversationTurns,
  type ConversationResult,
  type ConversationTurn
} from '@/lib/moderator'
import type { BriefAnalysis } from '@/lib/moderator/brief-analyzer'
import type { CalibrationLevel } from '@/lib/persona/skepticism-calculator'

export interface TestConfig {
  testId: string
  projectId: string
  stimulus: string
  stimulusType: string
  brief?: string
  archetypeIds: string[]
  calibration: CalibrationLevel
  category: string
  enableModeration?: boolean  // New: enable moderated conversation
}

export interface ExecutionResult {
  testId: string
  status: 'completed' | 'partial' | 'failed'
  responses: GeneratedResponse[]
  failedResponses: GenerationError[]
  aggregation: AggregationResult | null
  totalUsage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    estimatedCost: number
  }
  executionTimeMs: number
  error?: string
  // New: moderation-specific results
  conversationResult?: ConversationResult
  briefAnalysis?: BriefAnalysis
  moderationUsed?: boolean
}

/**
 * Execute a pressure test with optional moderation
 */
export async function executeTest(config: TestConfig): Promise<ExecutionResult> {
  // Determine if we should use moderated conversation
  // Default to moderated for non-straightforward stimulus types
  const shouldModerate = config.enableModeration ??
    ['ad_copy', 'concept', 'tagline'].includes(config.stimulusType)

  if (shouldModerate) {
    return executeModeratedTest(config)
  }

  return executeStandardTest(config)
}

/**
 * Execute a standard (non-moderated) pressure test
 * This is the original execution path
 */
async function executeStandardTest(config: TestConfig): Promise<ExecutionResult> {
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

    // Generate panel responses
    console.log(`[Test ${config.testId}] Generating ${config.archetypeIds.length} persona responses (standard mode)...`)

    const { successful, failed } = await generatePanelResponses(
      config.archetypeIds,
      config.stimulus,
      config.stimulusType,
      config.category,
      config.calibration,
      config.brief,
      3 // Concurrency limit to avoid rate limits
    )

    // Retry failed generations
    let allSuccessful = [...successful]
    let allFailed = [...failed]

    if (failed.length > 0) {
      console.log(`[Test ${config.testId}] Retrying ${failed.length} failed generations...`)

      const retryResults = await retryFailedGenerations(
        failed,
        config.stimulus,
        config.stimulusType,
        config.category,
        config.calibration,
        config.brief
      )

      allSuccessful = [...allSuccessful, ...retryResults.successful]
      allFailed = retryResults.failed
    }

    // Check if we have minimum viable responses
    if (allSuccessful.length < 3) {
      throw new Error(`Not enough successful responses: ${allSuccessful.length}`)
    }

    // Aggregate results
    console.log(`[Test ${config.testId}] Aggregating ${allSuccessful.length} responses...`)

    const aggregation = await aggregateResults(allSuccessful, config.stimulus)

    // Calculate total usage
    const responseUsage = calculateTotalUsage(allSuccessful)
    const totalUsage = {
      inputTokens: responseUsage.inputTokens + aggregation.usage.inputTokens,
      outputTokens: responseUsage.outputTokens + aggregation.usage.outputTokens,
      totalTokens: responseUsage.totalTokens + aggregation.usage.totalTokens,
      estimatedCost: responseUsage.estimatedCost +
        ((aggregation.usage.inputTokens / 1_000_000) * 3) +
        ((aggregation.usage.outputTokens / 1_000_000) * 15)
    }

    // Store results
    console.log(`[Test ${config.testId}] Storing results...`)

    await storeTestResults(config.testId, allSuccessful, aggregation, {
      moderationUsed: false
    })

    // Update test status to completed
    await supabase
      .from('pressure_tests')
      .update({
        status: allFailed.length > 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', config.testId)

    const executionTimeMs = Date.now() - startTime
    console.log(`[Test ${config.testId}] Completed in ${executionTimeMs}ms`)

    return {
      testId: config.testId,
      status: allFailed.length > 0 ? 'partial' : 'completed',
      responses: allSuccessful,
      failedResponses: allFailed,
      aggregation,
      totalUsage,
      executionTimeMs,
      moderationUsed: false
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update test status to failed with error message
    await supabase
      .from('pressure_tests')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', config.testId)

    console.error(`[Test ${config.testId}] Failed:`, errorMessage)

    return {
      testId: config.testId,
      status: 'failed',
      responses: [],
      failedResponses: [],
      aggregation: null,
      totalUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 },
      executionTimeMs: Date.now() - startTime,
      error: errorMessage
    }
  }
}

/**
 * Execute a moderated pressure test with AI moderator
 * Uses the conversation orchestrator for multi-turn dialogue
 */
async function executeModeratedTest(config: TestConfig): Promise<ExecutionResult> {
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

    console.log(`[Test ${config.testId}] Starting moderated conversation with ${config.archetypeIds.length} personas...`)

    // Orchestrate the moderated conversation
    const conversationResult = await orchestrateConversation({
      testId: config.testId,
      stimulus: config.stimulus,
      stimulusType: config.stimulusType,
      brief: config.brief,
      archetypeIds: config.archetypeIds,
      calibration: config.calibration,
      category: config.category,
      maxFollowUps: 3,
      enableModeration: true
    })

    // Store conversation turns
    console.log(`[Test ${config.testId}] Storing ${conversationResult.turns.length} conversation turns...`)
    await storeConversationTurns(config.testId, conversationResult.turns)

    // Convert conversation turns to GeneratedResponse format for aggregation
    const responsesForAggregation = convertTurnsToResponses(conversationResult.turns)

    // Check if we have minimum viable responses
    if (responsesForAggregation.length < 3) {
      throw new Error(`Not enough successful responses: ${responsesForAggregation.length}`)
    }

    // Aggregate results
    console.log(`[Test ${config.testId}] Aggregating ${responsesForAggregation.length} responses...`)
    const aggregation = await aggregateResults(responsesForAggregation, config.stimulus)

    // Add conversation usage to aggregation usage
    const totalUsage = {
      inputTokens: conversationResult.usage.inputTokens + aggregation.usage.inputTokens,
      outputTokens: conversationResult.usage.outputTokens + aggregation.usage.outputTokens,
      totalTokens: conversationResult.usage.totalTokens + aggregation.usage.totalTokens,
      estimatedCost: conversationResult.usage.estimatedCost +
        ((aggregation.usage.inputTokens / 1_000_000) * 3) +
        ((aggregation.usage.outputTokens / 1_000_000) * 15)
    }

    // Store results with moderation metadata
    console.log(`[Test ${config.testId}] Storing results...`)
    await storeTestResults(config.testId, responsesForAggregation, aggregation, {
      moderationUsed: conversationResult.moderationUsed,
      briefAnalysis: conversationResult.briefAnalysis,
      moderationImpact: conversationResult.moderationImpact
    })

    // Update test status to completed
    await supabase
      .from('pressure_tests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', config.testId)

    const executionTimeMs = Date.now() - startTime
    console.log(`[Test ${config.testId}] Moderated conversation completed in ${executionTimeMs}ms`)

    return {
      testId: config.testId,
      status: 'completed',
      responses: responsesForAggregation,
      failedResponses: [],
      aggregation,
      totalUsage,
      executionTimeMs,
      conversationResult,
      briefAnalysis: conversationResult.briefAnalysis,
      moderationUsed: conversationResult.moderationUsed
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update test status to failed with error message
    await supabase
      .from('pressure_tests')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', config.testId)

    console.error(`[Test ${config.testId}] Moderated test failed:`, errorMessage)

    return {
      testId: config.testId,
      status: 'failed',
      responses: [],
      failedResponses: [],
      aggregation: null,
      totalUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 },
      executionTimeMs: Date.now() - startTime,
      error: errorMessage
    }
  }
}

/**
 * Convert conversation turns to GeneratedResponse format
 * Uses the final response (revised if available, otherwise initial)
 */
function convertTurnsToResponses(turns: ConversationTurn[]): GeneratedResponse[] {
  const responses: GeneratedResponse[] = []
  const personaMap = new Map<string, {
    initial?: ConversationTurn
    revised?: ConversationTurn
    archetypeId?: string
  }>()

  // Group turns by persona
  for (const turn of turns) {
    if (turn.speakerType !== 'persona') continue

    const key = turn.speakerName
    if (!personaMap.has(key)) {
      personaMap.set(key, {})
    }

    const entry = personaMap.get(key)!

    if (turn.turnType === 'initial_response') {
      entry.initial = turn
      entry.archetypeId = turn.archetypeId
    } else if (turn.turnType === 'revised_response') {
      entry.revised = turn
    }
  }

  // Convert to GeneratedResponse format
  for (const [, { initial, revised, archetypeId }] of personaMap.entries()) {
    if (!initial?.responseData) continue

    // Use revised response data if available, otherwise initial
    const responseData = revised?.responseData || initial.responseData

    responses.push({
      personaContext: {
        name: {
          firstName: initial.speakerName.split(' ')[0] || initial.speakerName,
          lastName: initial.speakerName.split(' ').slice(1).join(' ') || '',
          fullName: initial.speakerName
        },
        archetype: {
          id: archetypeId || '',
          slug: initial.archetypeSlug || '',
          name: initial.archetypeSlug || ''
        }
      } as any, // Type coercion - full PersonaContext not needed for aggregation
      response: responseData,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      generationTimeMs: 0
    })
  }

  return responses
}

/**
 * Store test results in database
 */
async function storeTestResults(
  testId: string,
  responses: GeneratedResponse[],
  aggregation: AggregationResult,
  moderationData: {
    moderationUsed: boolean
    briefAnalysis?: BriefAnalysis
    moderationImpact?: {
      personasClarified: number
      viewShifts: Array<{
        persona: string
        archetypeSlug: string
        metricName: string
        before: number
        after: number
      }>
      salvageRate: number
    }
  }
): Promise<void> {
  const supabase = createAdminClient()

  // Store aggregated results
  const analysisData = formatAnalysisForStorage(aggregation)

  const resultRow: Record<string, unknown> = {
    test_id: testId,
    pressure_score: analysisData.pressure_score,
    gut_attraction_index: analysisData.gut_attraction_index,
    credibility_score: analysisData.credibility_score,
    purchase_intent_avg: analysisData.purchase_intent_avg,
    key_strengths: analysisData.key_strengths,
    key_weaknesses: analysisData.key_weaknesses,
    recommendations: analysisData.recommendations,
    verbatim_highlights: (analysisData as any).verbatim_highlights,
    total_responses: responses.length,
    execution_time_ms: responses.reduce((sum, r) => sum + r.generationTimeMs, 0) + aggregation.generationTimeMs,
    model_used: 'claude-sonnet-4-20250514',
    moderation_used: moderationData.moderationUsed
  }

  // Add moderation-specific data if available
  if (moderationData.briefAnalysis) {
    resultRow.brief_analysis = moderationData.briefAnalysis
  }

  if (moderationData.moderationImpact) {
    resultRow.moderation_impact = moderationData.moderationImpact
  }

  const { error: resultError } = await supabase
    .from('test_results')
    .insert(resultRow)

  if (resultError) {
    console.error('Error storing test results:', resultError)
    throw new Error('Failed to store test results')
  }

  // Store individual persona responses
  const personaResponses = responses.map(r => ({
    test_id: testId,
    ...formatResponseForStorage(r)
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
 * Load test configuration from database
 */
export async function loadTestConfig(testId: string): Promise<TestConfig | null> {
  const supabase = createAdminClient()

  const { data: test, error } = await supabase
    .from('pressure_tests')
    .select(`
      id,
      project_id,
      stimulus_content,
      stimulus_context,
      stimulus_type,
      panel_config
    `)
    .eq('id', testId)
    .single()

  if (error || !test) {
    return null
  }

  const panelConfig = test.panel_config as {
    archetypes?: string[]
    skepticism_override?: CalibrationLevel
    panel_size?: number
    enable_moderation?: boolean
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
    stimulus: test.stimulus_content,
    stimulusType: test.stimulus_type,
    brief: test.stimulus_context,
    archetypeIds: panelConfig.archetypes || [],
    calibration: panelConfig.skepticism_override || 'medium',
    category: project?.category || 'fmcg',
    enableModeration: panelConfig.enable_moderation ?? true  // Default to moderated
  }
}

/**
 * Cancel a running test
 */
export async function cancelTest(testId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('pressure_tests')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString()
    })
    .eq('id', testId)
    .eq('status', 'running')
}
