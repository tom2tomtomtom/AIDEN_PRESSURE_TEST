/**
 * Result Aggregator
 * Aggregates individual responses into comprehensive analysis
 */

import { completeJSON, TEMPERATURES } from '@/lib/anthropic/client'
import {
  buildAggregatedAnalysisPrompt,
  buildAnalysisSystemPrompt,
  buildResponseSummaries,
  calculateBasicMetrics,
  validateAggregatedAnalysis,
  type AggregatedAnalysisSchema,
  type ResponseSummary
} from '@/lib/prompts/aggregated-analysis'
import type { GeneratedResponse } from './response-generator'
import type { GroupDynamicsSchema } from '@/lib/prompts/group-dynamics'

export interface AggregationResult {
  analysis: AggregatedAnalysisSchema
  basicMetrics: {
    avgPurchaseIntent: number
    avgCredibility: number
    emotionalDistribution: Record<string, number>
    purchaseIntentDistribution: { high: number; medium: number; low: number }
  }
  responseSummaries: ResponseSummary[]
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  generationTimeMs: number
}

/**
 * Aggregate responses into analysis
 */
export async function aggregateResults(
  responses: GeneratedResponse[],
  stimulus: string,
  groupDynamics?: GroupDynamicsSchema
): Promise<AggregationResult> {
  const startTime = Date.now()

  // Build response summaries
  const responseSummaries = buildResponseSummaries(
    responses.map(r => ({
      personaName: r.personaContext.name.fullName,
      archetypeName: r.personaContext.archetype.name,
      response: r.response
    }))
  )

  // Calculate basic metrics first
  const basicMetrics = calculateBasicMetrics(responseSummaries)

  // Build analysis prompt
  const prompt = buildAggregatedAnalysisPrompt(stimulus, responseSummaries, groupDynamics)
  const systemPrompt = buildAnalysisSystemPrompt()

  // Generate analysis
  const result = await completeJSON<AggregatedAnalysisSchema>(prompt, {
    system: systemPrompt,
    temperature: TEMPERATURES.aggregatedAnalysis,
    maxTokens: 3000
  })

  // Validate response
  if (!validateAggregatedAnalysis(result.parsed)) {
    throw new Error('Invalid aggregated analysis format')
  }

  // Ensure purchase_intent_avg matches our calculation
  result.parsed.purchase_intent_avg = basicMetrics.avgPurchaseIntent
  result.parsed.purchase_intent_distribution = basicMetrics.purchaseIntentDistribution

  const generationTimeMs = Date.now() - startTime

  return {
    analysis: result.parsed,
    basicMetrics,
    responseSummaries,
    usage: result.usage,
    generationTimeMs
  }
}

/**
 * Format analysis for storage
 */
export function formatAnalysisForStorage(aggregation: AggregationResult): {
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  purchase_intent_avg: number
  key_strengths: object[]
  key_weaknesses: object[]
  recommendations: object[]
  verbatim_highlights: object[]
  raw_analysis: object
} {
  return {
    pressure_score: aggregation.analysis.pressure_score,
    gut_attraction_index: aggregation.analysis.gut_attraction_index,
    credibility_score: aggregation.analysis.credibility_score,
    purchase_intent_avg: aggregation.analysis.purchase_intent_avg,
    key_strengths: aggregation.analysis.key_strengths,
    key_weaknesses: aggregation.analysis.key_weaknesses,
    recommendations: aggregation.analysis.recommendations,
    verbatim_highlights: aggregation.analysis.verbatim_highlights,
    raw_analysis: aggregation.analysis
  }
}

/**
 * Format individual response for storage
 */
export function formatResponseForStorage(response: GeneratedResponse): {
  archetype_id: string
  persona_name: string
  persona_context: object
  gut_reaction: string
  considered_view: string
  social_response: string
  private_thought: string
  purchase_intent: number
  credibility_rating: number
  emotional_response: string
  what_works: string[]
  key_concerns: string[]
  what_would_convince: string
  triggered_memories: string[]
  memory_influence_summary: string
  generation_time_ms: number
  tokens_used: number
} {
  return {
    archetype_id: response.personaContext.archetype.id,
    persona_name: response.personaContext.name.fullName,
    persona_context: {
      age: response.personaContext.age,
      location: response.personaContext.location,
      skepticism: response.personaContext.skepticism,
      archetype: response.personaContext.archetype.name
    },
    gut_reaction: response.response.gut_reaction,
    considered_view: response.response.considered_view,
    social_response: response.response.social_response,
    private_thought: response.response.private_thought,
    purchase_intent: response.response.purchase_intent,
    credibility_rating: response.response.credibility_rating,
    emotional_response: response.response.emotional_response,
    what_works: response.response.what_works || [],
    key_concerns: response.response.key_concerns || [],
    what_would_convince: response.response.what_would_convince,
    // Filter out seed memory IDs (non-UUID format) - only store real database memory UUIDs
    triggered_memories: response.personaContext.memories
      .map(m => m.id)
      .filter(id => !id.startsWith('seed-')),
    memory_influence_summary: response.personaContext.memoryNarrative || '',
    generation_time_ms: response.generationTimeMs,
    tokens_used: response.usage.totalTokens
  }
}

/**
 * Generate executive summary from analysis
 */
export function generateExecutiveSummary(analysis: AggregatedAnalysisSchema): string {
  const scoreEmoji = analysis.pressure_score >= 70 ? '✅' :
    analysis.pressure_score >= 50 ? '⚠️' : '❌'

  const criticalIssues = analysis.key_weaknesses.filter(w => w.severity === 'critical')
  const mustFixes = analysis.recommendations.filter(r => r.priority === 'must_fix')

  let summary = `${scoreEmoji} **Pressure Score: ${analysis.pressure_score}/100**\n\n`
  summary += `${analysis.one_line_verdict}\n\n`

  if (criticalIssues.length > 0) {
    summary += `**Critical Issues (${criticalIssues.length}):**\n`
    criticalIssues.forEach(issue => {
      summary += `- ${issue.point}\n`
    })
    summary += '\n'
  }

  if (mustFixes.length > 0) {
    summary += `**Must Fix Before Launch:**\n`
    mustFixes.forEach(rec => {
      summary += `- ${rec.recommendation}\n`
    })
    summary += '\n'
  }

  summary += `**Would Proceed:** ${analysis.would_proceed ? 'Yes' : 'No'}`

  if (analysis.proceed_conditions.length > 0) {
    summary += ` (if: ${analysis.proceed_conditions.join(', ')})`
  }

  return summary
}
