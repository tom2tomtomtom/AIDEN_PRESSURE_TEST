/**
 * Follow-Up Generator
 * Creates contextual probing questions and moderator interventions
 */

import { complete, TEMPERATURES } from '@/lib/anthropic/client'
import type { BriefAnalysis, LiteralInterpretationRedFlag } from './brief-analyzer'
import {
  MODERATOR_SYSTEM_PROMPT,
  buildClarificationPrompt,
  buildProbingPrompt,
  buildDrawOutPrompt,
  getAcknowledgment
} from '@/lib/prompts/moderator-system'

/**
 * Types of follow-up interventions
 */
export type FollowUpType =
  | 'clarification'      // Providing creative context
  | 'probe_deeper'       // Understanding the "why"
  | 'probe_improvement'  // What would make it better
  | 'probe_specific'     // Getting concrete examples
  | 'probe_emotional'    // Exploring feelings
  | 'draw_out'           // Inviting quiet participant
  | 'acknowledge'        // Simple acknowledgment, no probe

/**
 * Generated follow-up result
 */
export interface FollowUpResult {
  type: FollowUpType
  content: string
  targetPersona: string
  reason: string
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number }
}

/**
 * Determine if and how to follow up on a response
 */
export function determineFollowUpNeeded(
  _personaName: string,
  response: string,
  briefAnalysis: BriefAnalysis,
  conversationContext: {
    turnNumber: number
    hasAlreadyClarified: boolean
    personasSpokeRecently: string[]
  }
): {
  needed: boolean
  type: FollowUpType
  reason: string
  triggeredFlag?: LiteralInterpretationRedFlag
} {
  const responseLower = response.toLowerCase()

  // Check for literal interpretation (highest priority)
  if (!conversationContext.hasAlreadyClarified && briefAnalysis.moderationNeeded) {
    for (const flag of briefAnalysis.redFlags) {
      const patternLower = flag.pattern.toLowerCase()
      const patternWords = patternLower.split(/\s+/).filter(w => w.length > 3)

      const matchCount = patternWords.filter(word => responseLower.includes(word)).length

      if (matchCount >= Math.ceil(patternWords.length * 0.4)) {
        return {
          needed: true,
          type: 'clarification',
          reason: flag.explanation,
          triggeredFlag: flag
        }
      }
    }

    // Check for common literal interpretation phrases
    const literalPhrases = [
      'contradiction',
      'contradicts itself',
      'doesn\'t make sense',
      'confusing',
      'mixed message',
      'can\'t be both',
      'hypocritical',
      'why would they',
      'but it\'s still',
      'saying one thing but'
    ]

    for (const phrase of literalPhrases) {
      if (responseLower.includes(phrase)) {
        return {
          needed: true,
          type: 'clarification',
          reason: `Response indicates possible literal interpretation: "${phrase}"`,
          triggeredFlag: {
            pattern: phrase,
            explanation: 'Participant may be missing the intended creative approach',
            clarificationProbe: briefAnalysis.clarificationProbes[0] || 'Does knowing the creative intent changes your view?'
          }
        }
      }
    }
  }

  // Check for vague/uncertain responses (probe deeper)
  const vagueIndicators = [
    { phrase: 'i don\'t know', type: 'probe_deeper' as FollowUpType },
    { phrase: 'not sure', type: 'probe_deeper' as FollowUpType },
    { phrase: 'maybe', type: 'probe_deeper' as FollowUpType },
    { phrase: 'i guess', type: 'probe_deeper' as FollowUpType },
    { phrase: 'it\'s okay', type: 'probe_deeper' as FollowUpType },
    { phrase: 'it\'s fine', type: 'probe_deeper' as FollowUpType }
  ]

  for (const { phrase, type } of vagueIndicators) {
    if (responseLower.includes(phrase)) {
      return {
        needed: true,
        type,
        reason: `Vague response detected: "${phrase}" - needs elaboration`
      }
    }
  }

  // Check for strong emotional language (explore emotions)
  const emotionalIndicators = [
    'hate', 'love', 'annoying', 'frustrating', 'exciting',
    'scary', 'worried', 'angry', 'offensive', 'insulting',
    'patronizing', 'cringe', 'amazing', 'brilliant'
  ]

  for (const emotion of emotionalIndicators) {
    if (responseLower.includes(emotion)) {
      return {
        needed: true,
        type: 'probe_emotional',
        reason: `Strong emotional language: "${emotion}" - worth exploring`
      }
    }
  }

  // Check for responses that could benefit from specific examples
  const needsSpecificIndicators = [
    'it just doesn\'t work',
    'something about it',
    'feels wrong',
    'feels off',
    'not quite right',
    'missing something'
  ]

  for (const indicator of needsSpecificIndicators) {
    if (responseLower.includes(indicator)) {
      return {
        needed: true,
        type: 'probe_specific',
        reason: `Vague criticism: "${indicator}" - needs specifics`
      }
    }
  }

  // On later turns, less intervention needed
  if (conversationContext.turnNumber > 4) {
    return {
      needed: false,
      type: 'acknowledge',
      reason: 'Later in conversation, allowing natural flow'
    }
  }

  // Default: acknowledge without probing (let conversation flow)
  return {
    needed: false,
    type: 'acknowledge',
    reason: 'Response is clear and specific, no intervention needed'
  }
}

/**
 * Generate a clarification message when literal interpretation detected
 */
export async function generateClarification(
  briefAnalysis: BriefAnalysis,
  triggeredFlag: LiteralInterpretationRedFlag,
  personaName: string,
  personaResponse: string
): Promise<FollowUpResult> {
  const prompt = buildClarificationPrompt(briefAnalysis, triggeredFlag, personaName, personaResponse)

  const result = await complete(prompt, {
    system: MODERATOR_SYSTEM_PROMPT,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 300
  })

  return {
    type: 'clarification',
    content: result.content.trim(),
    targetPersona: personaName,
    reason: triggeredFlag.explanation,
    usage: result.usage
  }
}

/**
 * Generate a probing question
 */
export async function generateProbe(
  personaName: string,
  personaResponse: string,
  probeType: 'deeper_insight' | 'what_would_help' | 'specific_example' | 'emotional_exploration'
): Promise<FollowUpResult> {
  const prompt = buildProbingPrompt(personaName, personaResponse, probeType)

  const result = await complete(prompt, {
    system: MODERATOR_SYSTEM_PROMPT,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 200
  })

  const typeMap: Record<string, FollowUpType> = {
    deeper_insight: 'probe_deeper',
    what_would_help: 'probe_improvement',
    specific_example: 'probe_specific',
    emotional_exploration: 'probe_emotional'
  }

  return {
    type: typeMap[probeType] || 'probe_deeper',
    content: result.content.trim(),
    targetPersona: personaName,
    reason: `Probing for ${probeType.replace('_', ' ')}`,
    usage: result.usage
  }
}

/**
 * Generate a draw-out prompt for quiet participants
 */
export async function generateDrawOut(
  quietPersonaName: string,
  recentSpeakers: string[],
  topic: string
): Promise<FollowUpResult> {
  const prompt = buildDrawOutPrompt(quietPersonaName, recentSpeakers, topic)

  const result = await complete(prompt, {
    system: MODERATOR_SYSTEM_PROMPT,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 100
  })

  return {
    type: 'draw_out',
    content: result.content.trim(),
    targetPersona: quietPersonaName,
    reason: 'Drawing out quiet participant',
    usage: result.usage
  }
}

/**
 * Generate a simple acknowledgment (no API call needed)
 */
export function generateAcknowledgment(personaName: string): FollowUpResult {
  return {
    type: 'acknowledge',
    content: getAcknowledgment(),
    targetPersona: personaName,
    reason: 'Simple acknowledgment'
  }
}

/**
 * Generate the appropriate follow-up based on determination
 */
export async function generateFollowUp(
  personaName: string,
  personaResponse: string,
  briefAnalysis: BriefAnalysis,
  determination: ReturnType<typeof determineFollowUpNeeded>
): Promise<FollowUpResult> {
  switch (determination.type) {
    case 'clarification':
      return generateClarification(
        briefAnalysis,
        determination.triggeredFlag || {
          pattern: '',
          explanation: determination.reason,
          clarificationProbe: briefAnalysis.clarificationProbes[0] || ''
        },
        personaName,
        personaResponse
      )

    case 'probe_deeper':
      return generateProbe(personaName, personaResponse, 'deeper_insight')

    case 'probe_improvement':
      return generateProbe(personaName, personaResponse, 'what_would_help')

    case 'probe_specific':
      return generateProbe(personaName, personaResponse, 'specific_example')

    case 'probe_emotional':
      return generateProbe(personaName, personaResponse, 'emotional_exploration')

    case 'draw_out':
      // This shouldn't happen through this path, but handle it
      return generateAcknowledgment(personaName)

    case 'acknowledge':
    default:
      return generateAcknowledgment(personaName)
  }
}

/**
 * Select which personas should get follow-up questions
 * Limits the number to keep conversation manageable
 */
export function selectForFollowUp(
  responses: Array<{
    personaName: string
    response: string
    archetypeSlug: string
  }>,
  briefAnalysis: BriefAnalysis,
  maxFollowUps: number = 3
): Array<{
  personaName: string
  response: string
  determination: ReturnType<typeof determineFollowUpNeeded>
}> {
  const evaluated = responses.map((r, index) => ({
    ...r,
    determination: determineFollowUpNeeded(r.personaName, r.response, briefAnalysis, {
      turnNumber: 1,
      hasAlreadyClarified: false,
      personasSpokeRecently: responses.slice(0, index).map(p => p.personaName)
    })
  }))

  // Prioritize: clarifications first, then probes, then nothing
  const priorityOrder: FollowUpType[] = [
    'clarification',
    'probe_emotional',
    'probe_specific',
    'probe_deeper',
    'probe_improvement'
  ]

  const sorted = evaluated
    .filter(e => e.determination.needed)
    .sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.determination.type)
      const bIndex = priorityOrder.indexOf(b.determination.type)
      return aIndex - bIndex
    })

  return sorted.slice(0, maxFollowUps)
}
