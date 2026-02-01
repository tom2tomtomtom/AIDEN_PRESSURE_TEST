/**
 * Test Execution Runner
 * Orchestrates the full test execution pipeline
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
}

/**
 * Execute a pressure test
 */
export async function executeTest(config: TestConfig): Promise<ExecutionResult> {
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
    console.log(`[Test ${config.testId}] Generating ${config.archetypeIds.length} persona responses...`)

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

    await storeTestResults(config.testId, allSuccessful, aggregation, totalUsage)

    // Update test status to completed
    await supabase
      .from('pressure_tests')
      .update({
        status: allFailed.length > 0 ? 'completed' : 'completed', // Could use 'partial' if needed
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
      executionTimeMs
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
 * Store test results in database
 */
async function storeTestResults(
  testId: string,
  responses: GeneratedResponse[],
  aggregation: AggregationResult,
  _usage: { inputTokens: number; outputTokens: number; totalTokens: number; estimatedCost: number }
): Promise<void> {
  const supabase = createAdminClient()

  // Store aggregated results
  const analysisData = formatAnalysisForStorage(aggregation)

  const { error: resultError } = await supabase
    .from('test_results')
    .insert({
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
      model_used: 'claude-sonnet-4-20250514'
    })

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
    category: project?.category || 'fmcg'
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
