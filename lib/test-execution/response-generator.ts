/**
 * Response Generator
 * Generates individual persona responses to stimuli
 */

import { completeJSON, TEMPERATURES } from '@/lib/anthropic/client'
import { buildPersonaContext, type PersonaContext } from '@/lib/persona/context-builder'
import {
  buildPersonaResponsePrompt,
  buildPersonaSystemPrompt,
  validatePersonaResponse,
  type PersonaResponseSchema
} from '@/lib/prompts/persona-response'
import type { CalibrationLevel } from '@/lib/persona/skepticism-calculator'

export interface GeneratedResponse {
  personaContext: PersonaContext
  response: PersonaResponseSchema
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  generationTimeMs: number
}

export interface GenerationError {
  archetypeId: string
  error: string
  retryable: boolean
}

/**
 * Generate a single persona response
 */
export async function generatePersonaResponse(
  archetypeId: string,
  stimulus: string,
  stimulusType: string,
  category: string = 'fmcg',
  calibration: CalibrationLevel = 'medium',
  brief?: string
): Promise<GeneratedResponse> {
  const startTime = Date.now()

  // Build persona context
  const personaContext = await buildPersonaContext({
    archetypeId,
    stimulusText: stimulus,
    category,
    calibration
  })

  // Build prompt
  const prompt = buildPersonaResponsePrompt(personaContext, stimulus, stimulusType, brief)
  const systemPrompt = buildPersonaSystemPrompt()

  // Generate response
  const result = await completeJSON<PersonaResponseSchema>(prompt, {
    system: systemPrompt,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 2000
  })

  // Validate response
  if (!validatePersonaResponse(result.parsed)) {
    throw new Error('Invalid persona response format')
  }

  const generationTimeMs = Date.now() - startTime

  return {
    personaContext,
    response: result.parsed,
    usage: result.usage,
    generationTimeMs
  }
}

/**
 * Generate responses for multiple personas in parallel
 */
export async function generatePanelResponses(
  archetypeIds: string[],
  stimulus: string,
  stimulusType: string,
  category: string = 'fmcg',
  calibration: CalibrationLevel = 'medium',
  brief?: string,
  concurrency: number = 4
): Promise<{
  successful: GeneratedResponse[]
  failed: GenerationError[]
}> {
  const successful: GeneratedResponse[] = []
  const failed: GenerationError[] = []

  // Process in batches for rate limiting
  for (let i = 0; i < archetypeIds.length; i += concurrency) {
    const batch = archetypeIds.slice(i, i + concurrency)

    const results = await Promise.allSettled(
      batch.map(archetypeId =>
        generatePersonaResponse(archetypeId, stimulus, stimulusType, category, calibration, brief)
      )
    )

    results.forEach((result, index) => {
      const archetypeId = batch[index]!
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push({
          archetypeId,
          error: result.reason?.message || 'Unknown error',
          retryable: result.reason?.message?.includes('rate') || false
        })
      }
    })
  }

  return { successful, failed }
}

/**
 * Retry failed generations
 */
export async function retryFailedGenerations(
  failures: GenerationError[],
  stimulus: string,
  stimulusType: string,
  category: string = 'fmcg',
  calibration: CalibrationLevel = 'medium',
  brief?: string,
  maxRetries: number = 2
): Promise<{
  successful: GeneratedResponse[]
  failed: GenerationError[]
}> {
  const retryable = failures.filter(f => f.retryable)
  const notRetryable = failures.filter(f => !f.retryable)

  if (retryable.length === 0) {
    return { successful: [], failed: notRetryable }
  }

  const successful: GeneratedResponse[] = []
  const stillFailed: GenerationError[] = [...notRetryable]

  for (const failure of retryable) {
    let lastError = failure.error

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))

        const result = await generatePersonaResponse(
          failure.archetypeId,
          stimulus,
          stimulusType,
          category,
          calibration,
          brief
        )

        successful.push(result)
        break
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'

        if (attempt === maxRetries - 1) {
          stillFailed.push({
            archetypeId: failure.archetypeId,
            error: lastError,
            retryable: false
          })
        }
      }
    }
  }

  return { successful, failed: stillFailed }
}

/**
 * Calculate total token usage from responses
 */
export function calculateTotalUsage(responses: GeneratedResponse[]): {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
} {
  const totals = responses.reduce(
    (acc, r) => ({
      inputTokens: acc.inputTokens + r.usage.inputTokens,
      outputTokens: acc.outputTokens + r.usage.outputTokens,
      totalTokens: acc.totalTokens + r.usage.totalTokens
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  )

  // Estimate cost (Claude Sonnet pricing approximate)
  // $3 per 1M input tokens, $15 per 1M output tokens
  const inputCost = (totals.inputTokens / 1_000_000) * 3
  const outputCost = (totals.outputTokens / 1_000_000) * 15
  const estimatedCost = Math.round((inputCost + outputCost) * 100) / 100

  return { ...totals, estimatedCost }
}
