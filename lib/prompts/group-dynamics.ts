/**
 * Group Dynamics Prompt Template
 * Simulates focus group discussion dynamics
 */

import type { PersonaResponseSchema } from './persona-response'

export interface ParticipantSummary {
  name: string
  archetype: string
  initialStance: 'positive' | 'neutral' | 'negative'
  keyPoint: string
  skepticismLevel: number
}

export interface GroupDynamicsSchema {
  discussion_flow: {
    speaker: string
    statement: string
    triggers_response_from: string | null
  }[]
  opinion_shifts: {
    participant: string
    original_stance: string
    final_stance: string
    reason_for_shift: string
  }[]
  consensus_points: string[]
  contention_points: {
    topic: string
    camps: {
      position: string
      supporters: string[]
    }[]
  }[]
  dominant_voice: string
  minority_report: {
    participant: string
    dissenting_view: string
    reason_dismissed: string
  } | null
  group_conclusion: string
}

/**
 * Build participant summaries from persona responses
 */
export function buildParticipantSummaries(
  responses: Array<{
    personaName: string
    archetypeName: string
    response: PersonaResponseSchema
    skepticismLevel: number
  }>
): ParticipantSummary[] {
  return responses.map(r => {
    // Determine initial stance from purchase intent and emotional response
    let initialStance: 'positive' | 'neutral' | 'negative'
    if (r.response.purchase_intent >= 7 || r.response.emotional_response === 'excited') {
      initialStance = 'positive'
    } else if (r.response.purchase_intent <= 4 || ['dismissive', 'hostile'].includes(r.response.emotional_response)) {
      initialStance = 'negative'
    } else {
      initialStance = 'neutral'
    }

    // Extract key point from their gut reaction or main concern
    const keyPoint = r.response.key_concerns[0] || r.response.gut_reaction.split('.')[0] || ''

    return {
      name: r.personaName,
      archetype: r.archetypeName,
      initialStance,
      keyPoint,
      skepticismLevel: r.skepticismLevel
    }
  })
}

/**
 * Build the group dynamics simulation prompt
 */
export function buildGroupDynamicsPrompt(
  participants: ParticipantSummary[],
  stimulus: string,
  individualResponses: Array<{ name: string; gutReaction: string; socialResponse: string }>
): string {
  const participantList = participants.map(p =>
    `- **${p.name}** (${p.archetype}): ${p.initialStance} stance, skepticism ${p.skepticismLevel}/10
      Key point: "${p.keyPoint}"`
  ).join('\n')

  const responseList = individualResponses.map(r =>
    `**${r.name}**:
    - Initial reaction: "${r.gutReaction}"
    - Would say publicly: "${r.socialResponse}"`
  ).join('\n\n')

  return `# Focus Group Simulation

You are simulating a focus group discussion about a marketing concept. The participants have already formed individual opinions, and now they're discussing it together.

## The Concept Being Discussed
---
${stimulus}
---

## Participants
${participantList}

## Their Individual Reactions
${responseList}

## Simulation Instructions

Simulate a realistic 10-15 minute focus group discussion. Consider:

1. **Social dynamics**: Who speaks first? Who responds to whom? Are there natural leaders or quieter participants?

2. **Influence patterns**: Do skeptics make others more doubtful? Do enthusiasts rally support?

3. **Opinion shifts**: Based on the discussion, do any participants change their views? Why?

4. **Consensus vs contention**: What do they agree on? What divides them?

5. **Group psychology**: Consider confirmation bias, social proof, and the tendency to moderate extreme views in groups.

Provide your analysis as a JSON object with:
- discussion_flow: Array of {speaker, statement, triggers_response_from}
- opinion_shifts: Array of {participant, original_stance, final_stance, reason_for_shift}
- consensus_points: Array of things the group generally agreed on
- contention_points: Array of {topic, camps: [{position, supporters}]}
- dominant_voice: Who most influenced the discussion
- minority_report: {participant, dissenting_view, reason_dismissed} or null
- group_conclusion: Overall group sentiment after discussion`
}

/**
 * Build the system prompt for group dynamics
 */
export function buildGroupDynamicsSystemPrompt(): string {
  return `You are an AI simulating realistic focus group dynamics. Your role is to model how consumers with different perspectives influence each other during group discussions.

Key principles:
- People often moderate extreme views in group settings
- Social proof can shift opinions, especially for uncertain participants
- Articulate skeptics often have outsized influence
- Enthusiasts can face pushback if they seem too uncritical
- Group conclusions often differ from averaging individual opinions
- Some voices are louder than others based on confidence and articulateness

Generate realistic dialogue and opinion dynamics that reflect how real focus groups work.

Respond with a JSON object matching the GroupDynamicsSchema structure.`
}

/**
 * Validate group dynamics response
 */
export function validateGroupDynamics(response: unknown): response is GroupDynamicsSchema {
  if (!response || typeof response !== 'object') return false

  const r = response as Record<string, unknown>

  return (
    Array.isArray(r.discussion_flow) &&
    Array.isArray(r.opinion_shifts) &&
    Array.isArray(r.consensus_points) &&
    Array.isArray(r.contention_points) &&
    typeof r.dominant_voice === 'string' &&
    typeof r.group_conclusion === 'string'
  )
}
