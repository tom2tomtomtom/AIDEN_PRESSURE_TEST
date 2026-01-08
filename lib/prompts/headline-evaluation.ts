/**
 * Headline Evaluation Prompt Template
 * For testing multiple headlines/taglines at once
 */

import type { PersonaContext } from '@/lib/persona/context-builder'

export interface HeadlineRating {
  headline_index: number
  score: number  // 1-10
}

export interface HeadlineEvaluationSchema {
  top_3: {
    headline_index: number
    why_it_works: string  // 30-50 words
  }[]
  bottom_3: {
    headline_index: number
    why_it_fails: string  // 30-50 words
  }[]
  all_ratings: HeadlineRating[]
  overall_winner: number  // headline_index
  gut_reaction: string  // Overall impression of the set (50-75 words)
}

/**
 * Build the headline evaluation prompt
 */
export function buildHeadlineEvaluationPrompt(
  context: PersonaContext,
  headlines: string[],
  brief?: string
): string {
  const headlineList = headlines
    .map((h, i) => `${i + 1}. "${h}"`)
    .join('\n')

  const briefSection = brief ? `
# Context
${brief}

Consider this context when evaluating which headlines would resonate with consumers like you.
` : ''

  return `# Your Identity

You are ${context.name.fullName}, ${context.demographicSummary}.

${context.psychographicSummary}

${context.voiceSummary}

# Your Skepticism Level

${context.skepticismSummary}
${briefSection}
# Headlines to Evaluate

Review these ${headlines.length} headlines and evaluate them from your perspective:

${headlineList}

# Your Task

1. **Pick your Top 3** - The headlines that resonate most with you
2. **Pick your Bottom 3** - The headlines that fall flat or turn you off
3. **Rate ALL headlines** 1-10 (10 = love it, 1 = hate it)
4. **Choose your overall winner**

Be authentic to your persona. What grabs YOUR attention? What feels genuine vs gimmicky to YOU?`
}

/**
 * Build the system prompt for headline evaluation
 */
export function buildHeadlineSystemPrompt(): string {
  return `You are simulating a real consumer evaluating marketing headlines. Stay in character throughout.

Guidelines:
- React authentically based on your persona's demographics, values, and skepticism
- Headlines are judged as HEADLINES - brevity and punch matter
- Consider: memorability, emotional pull, clarity, authenticity
- Your Top 3 should genuinely appeal to you as this persona
- Your Bottom 3 should genuinely fail to connect or actively turn you off
- Be decisive - don't hedge or try to please everyone

Respond with JSON matching this EXACT structure:
{
  "top_3": [
    {"headline_index": <1-based index>, "why_it_works": "<30-50 words>"},
    {"headline_index": <1-based index>, "why_it_works": "<30-50 words>"},
    {"headline_index": <1-based index>, "why_it_works": "<30-50 words>"}
  ],
  "bottom_3": [
    {"headline_index": <1-based index>, "why_it_fails": "<30-50 words>"},
    {"headline_index": <1-based index>, "why_it_fails": "<30-50 words>"},
    {"headline_index": <1-based index>, "why_it_fails": "<30-50 words>"}
  ],
  "all_ratings": [
    {"headline_index": 1, "score": <1-10>},
    {"headline_index": 2, "score": <1-10>},
    ... for ALL headlines
  ],
  "overall_winner": <1-based index of your #1 pick>,
  "gut_reaction": "<50-75 words about your overall impression of these headlines as a set>"
}`
}

/**
 * Validate headline evaluation response
 */
export function validateHeadlineEvaluation(
  response: unknown,
  headlineCount: number
): response is HeadlineEvaluationSchema {
  if (!response || typeof response !== 'object') return false

  const r = response as Record<string, unknown>

  // Check top_3
  if (!Array.isArray(r.top_3) || r.top_3.length !== 3) return false
  for (const item of r.top_3) {
    if (typeof item !== 'object' || !item) return false
    const t = item as Record<string, unknown>
    if (typeof t.headline_index !== 'number' || typeof t.why_it_works !== 'string') return false
  }

  // Check bottom_3
  if (!Array.isArray(r.bottom_3) || r.bottom_3.length !== 3) return false
  for (const item of r.bottom_3) {
    if (typeof item !== 'object' || !item) return false
    const b = item as Record<string, unknown>
    if (typeof b.headline_index !== 'number' || typeof b.why_it_fails !== 'string') return false
  }

  // Check all_ratings has correct count
  if (!Array.isArray(r.all_ratings) || r.all_ratings.length !== headlineCount) return false
  for (const item of r.all_ratings) {
    if (typeof item !== 'object' || !item) return false
    const rating = item as Record<string, unknown>
    if (typeof rating.headline_index !== 'number' || typeof rating.score !== 'number') return false
    if (rating.score < 1 || rating.score > 10) return false
  }

  // Check overall_winner
  if (typeof r.overall_winner !== 'number' || r.overall_winner < 1 || r.overall_winner > headlineCount) return false

  // Check gut_reaction
  if (typeof r.gut_reaction !== 'string') return false

  return true
}

/**
 * Aggregate headline results across multiple personas
 */
export function aggregateHeadlineResults(
  responses: Array<{
    personaName: string
    archetype: string
    evaluation: HeadlineEvaluationSchema
  }>,
  headlines: string[]
): {
  rankings: Array<{
    index: number
    headline: string
    avgScore: number
    topPicks: number      // How many personas put it in top 3
    bottomPicks: number   // How many personas put it in bottom 3
    winnerPicks: number   // How many personas chose it as #1
  }>
  winner: {
    index: number
    headline: string
    avgScore: number
    margin: number  // Score difference from #2
  }
  consensus: 'strong' | 'moderate' | 'weak'
  segmentInsights: Array<{
    archetype: string
    topPick: number
    reasoning: string
  }>
  verbatimHighlights: Array<{
    personaName: string
    archetype: string
    quote: string
    topic: 'winner' | 'concern' | 'general'
  }>
} {
  const headlineStats = headlines.map((headline, i) => ({
    index: i + 1,
    headline,
    scores: [] as number[],
    topPicks: 0,
    bottomPicks: 0,
    winnerPicks: 0
  }))

  // Collect stats from each response
  for (const response of responses) {
    const eval_ = response.evaluation

    // Count top/bottom picks
    for (const top of eval_.top_3) {
      const stat = headlineStats[top.headline_index - 1]
      if (stat) stat.topPicks++
    }
    for (const bottom of eval_.bottom_3) {
      const stat = headlineStats[bottom.headline_index - 1]
      if (stat) stat.bottomPicks++
    }

    // Collect scores
    for (const rating of eval_.all_ratings) {
      const stat = headlineStats[rating.headline_index - 1]
      if (stat) stat.scores.push(rating.score)
    }

    // Count winner picks
    const winnerStat = headlineStats[eval_.overall_winner - 1]
    if (winnerStat) winnerStat.winnerPicks++
  }

  // Calculate averages and sort
  const rankings = headlineStats
    .map(stat => ({
      index: stat.index,
      headline: stat.headline,
      avgScore: stat.scores.length > 0
        ? Math.round((stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length) * 10) / 10
        : 0,
      topPicks: stat.topPicks,
      bottomPicks: stat.bottomPicks,
      winnerPicks: stat.winnerPicks
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const winner = rankings[0]!
  const runnerUp = rankings[1]
  const margin = runnerUp ? Math.round((winner.avgScore - runnerUp.avgScore) * 10) / 10 : winner.avgScore

  // Determine consensus strength
  const topWinnerPicks = winner.winnerPicks
  const totalResponses = responses.length
  const winnerPercentage = topWinnerPicks / totalResponses

  let consensus: 'strong' | 'moderate' | 'weak'
  if (winnerPercentage >= 0.5 && margin >= 1) {
    consensus = 'strong'
  } else if (winnerPercentage >= 0.25 || margin >= 0.5) {
    consensus = 'moderate'
  } else {
    consensus = 'weak'
  }

  // Extract segment insights (one per archetype)
  const archetypeMap = new Map<string, { topPick: number; reasoning: string }>()
  for (const response of responses) {
    if (!archetypeMap.has(response.archetype)) {
      const topPick = response.evaluation.top_3[0]
      if (topPick) {
        archetypeMap.set(response.archetype, {
          topPick: topPick.headline_index,
          reasoning: topPick.why_it_works
        })
      }
    }
  }

  const segmentInsights = Array.from(archetypeMap.entries()).map(([archetype, data]) => ({
    archetype,
    topPick: data.topPick,
    reasoning: data.reasoning
  }))

  // Extract verbatim highlights (one from each persona, up to 6)
  const verbatimHighlights = responses.slice(0, 6).map(r => {
    const topPick = r.evaluation.top_3[0]
    const bottomPick = r.evaluation.bottom_3[0]
    
    // Mix of positive and negative quotes
    const isPositive = Math.random() > 0.4
    
    let quote = r.evaluation.gut_reaction
    if (isPositive && topPick) {
      quote = topPick.why_it_works
    } else if (!isPositive && bottomPick) {
      quote = bottomPick.why_it_fails
    }
    
    return {
      personaName: r.personaName,
      archetype: r.archetype,
      quote,
      topic: (isPositive ? 'winner' : 'concern') as 'winner' | 'concern' | 'general'
    }
  })

  return {
    rankings,
    winner: {
      index: winner.index,
      headline: winner.headline,
      avgScore: winner.avgScore,
      margin
    },
    consensus,
    segmentInsights,
    verbatimHighlights
  }
}
