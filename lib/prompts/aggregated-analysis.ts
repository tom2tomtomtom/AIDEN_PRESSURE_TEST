/**
 * Aggregated Analysis Prompt Template
 * Synthesizes individual responses into actionable insights
 */

import type { PersonaResponseSchema } from './persona-response'
import type { GroupDynamicsSchema } from './group-dynamics'

export interface ResponseSummary {
  personaName: string
  archetype: string
  purchaseIntent: number
  credibilityRating: number
  emotionalResponse: string
  keyConcerns: string[]
  whatWouldConvince: string
}

export interface AggregatedAnalysisSchema {
  // Core Scores (0-100)
  pressure_score: number              // Overall concept resilience
  gut_attraction_index: number        // Initial appeal strength
  credibility_score: number           // How believable the claims are

  // Detailed Metrics
  purchase_intent_avg: number         // 1-10 average
  purchase_intent_distribution: {
    high: number      // 7-10
    medium: number    // 4-6
    low: number       // 1-3
  }

  // Qualitative Analysis
  key_strengths: {
    point: string
    evidence: string[]
    confidence: 'high' | 'medium' | 'low'
  }[]

  key_weaknesses: {
    point: string
    evidence: string[]
    severity: 'critical' | 'major' | 'minor'
  }[]

  credibility_gaps: {
    claim: string
    issue: string
    suggested_fix: string
  }[]

  friction_points: {
    friction: string
    affected_segments: string[]
    impact: 'high' | 'medium' | 'low'
  }[]

  // Recommendations
  recommendations: {
    recommendation: string
    rationale: string
    priority: 'must_fix' | 'should_improve' | 'nice_to_have'
    effort: 'low' | 'medium' | 'high'
  }[]

  // Summary
  one_line_verdict: string
  would_proceed: boolean
  proceed_conditions: string[]
}

/**
 * Build response summaries for analysis
 */
export function buildResponseSummaries(
  responses: Array<{
    personaName: string
    archetypeName: string
    response: PersonaResponseSchema
  }>
): ResponseSummary[] {
  return responses.map(r => ({
    personaName: r.personaName,
    archetype: r.archetypeName,
    purchaseIntent: r.response.purchase_intent,
    credibilityRating: r.response.credibility_rating,
    emotionalResponse: r.response.emotional_response,
    keyConcerns: r.response.key_concerns,
    whatWouldConvince: r.response.what_would_convince
  }))
}

/**
 * Build the aggregated analysis prompt
 */
export function buildAggregatedAnalysisPrompt(
  stimulus: string,
  responseSummaries: ResponseSummary[],
  groupDynamics?: GroupDynamicsSchema
): string {
  const responseSection = responseSummaries.map(r => `
**${r.personaName}** (${r.archetype})
- Purchase Intent: ${r.purchaseIntent}/10
- Credibility Rating: ${r.credibilityRating}/10
- Emotional Response: ${r.emotionalResponse}
- Key Concerns: ${r.keyConcerns.join('; ')}
- Would be convinced by: ${r.whatWouldConvince}
`).join('\n')

  let groupSection = ''
  if (groupDynamics) {
    groupSection = `
## Group Discussion Insights

**Consensus Points:**
${groupDynamics.consensus_points.map(p => `- ${p}`).join('\n')}

**Contention Points:**
${groupDynamics.contention_points.map(c =>
      `- ${c.topic}: ${c.camps.map(camp => `${camp.position} (${camp.supporters.join(', ')})`).join(' vs ')}`
    ).join('\n')}

**Group Conclusion:** ${groupDynamics.group_conclusion}
`
  }

  return `# Marketing Concept Analysis

## The Concept
---
${stimulus}
---

## Individual Persona Responses
${responseSection}
${groupSection}

## Analysis Required

Synthesize these responses into actionable insights. Calculate:

### 1. Core Scores (0-100)

**Pressure Score** (concept resilience):
- 90-100: Bulletproof - ready for prime time
- 70-89: Strong - minor refinements needed
- 50-69: Moderate - significant concerns to address
- 30-49: Weak - fundamental issues
- 0-29: Critical - back to drawing board

**Gut Attraction Index** (initial appeal):
- Based on gut reactions and initial emotional responses
- Averages the "first impression" strength

**Credibility Score** (claim believability):
- Based on credibility ratings and expressed skepticism
- Accounts for evidence gaps identified

### 2. Identify Patterns

Look for:
- Consistent concerns across multiple personas
- Claims that trigger skepticism
- Segments that respond positively vs negatively
- Evidence requests that appear multiple times

### 3. Prioritize Recommendations

Categorize fixes by:
- **must_fix**: Critical issues that will tank the concept
- **should_improve**: Significant weaknesses
- **nice_to_have**: Polish items

Consider effort level for each recommendation.

Provide your analysis as a comprehensive JSON object.`
}

/**
 * Build the system prompt for aggregated analysis
 */
export function buildAnalysisSystemPrompt(): string {
  return `You are an expert marketing research analyst synthesizing qualitative consumer feedback into actionable insights.

Your analysis should be:
- Data-driven: Base scores on the actual response data
- Specific: Reference exact quotes and patterns
- Actionable: Every weakness should have a potential solution
- Balanced: Acknowledge both strengths and weaknesses
- Honest: Don't sugarcoat critical issues

Scoring guidelines:
- Pressure Score: Weight toward the most skeptical responses - they reveal real vulnerabilities
- Consider persona archetypes - a skeptical switcher's concerns matter more than an enthusiastic trend follower
- Group dynamics (if present) often reveal hidden issues

Respond with a JSON object matching the AggregatedAnalysisSchema structure.`
}

/**
 * Calculate basic metrics from raw responses
 */
export function calculateBasicMetrics(responses: ResponseSummary[]): {
  avgPurchaseIntent: number
  avgCredibility: number
  emotionalDistribution: Record<string, number>
  purchaseIntentDistribution: { high: number; medium: number; low: number }
} {
  const count = responses.length
  if (count === 0) {
    return {
      avgPurchaseIntent: 0,
      avgCredibility: 0,
      emotionalDistribution: {},
      purchaseIntentDistribution: { high: 0, medium: 0, low: 0 }
    }
  }

  const avgPurchaseIntent = responses.reduce((sum, r) => sum + r.purchaseIntent, 0) / count
  const avgCredibility = responses.reduce((sum, r) => sum + r.credibilityRating, 0) / count

  const emotionalDistribution: Record<string, number> = {}
  for (const r of responses) {
    emotionalDistribution[r.emotionalResponse] = (emotionalDistribution[r.emotionalResponse] || 0) + 1
  }

  const purchaseIntentDistribution = {
    high: responses.filter(r => r.purchaseIntent >= 7).length,
    medium: responses.filter(r => r.purchaseIntent >= 4 && r.purchaseIntent < 7).length,
    low: responses.filter(r => r.purchaseIntent < 4).length
  }

  return {
    avgPurchaseIntent: Math.round(avgPurchaseIntent * 10) / 10,
    avgCredibility: Math.round(avgCredibility * 10) / 10,
    emotionalDistribution,
    purchaseIntentDistribution
  }
}

/**
 * Validate aggregated analysis response
 */
export function validateAggregatedAnalysis(response: unknown): response is AggregatedAnalysisSchema {
  if (!response || typeof response !== 'object') return false

  const r = response as Record<string, unknown>

  return (
    typeof r.pressure_score === 'number' &&
    r.pressure_score >= 0 && r.pressure_score <= 100 &&
    typeof r.gut_attraction_index === 'number' &&
    typeof r.credibility_score === 'number' &&
    typeof r.purchase_intent_avg === 'number' &&
    Array.isArray(r.key_strengths) &&
    Array.isArray(r.key_weaknesses) &&
    Array.isArray(r.recommendations) &&
    typeof r.one_line_verdict === 'string' &&
    typeof r.would_proceed === 'boolean'
  )
}
