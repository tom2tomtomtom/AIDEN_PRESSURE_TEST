/**
 * Conversation Orchestrator
 * Manages the multi-turn moderated focus group conversation
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { complete, completeJSON, TEMPERATURES } from '@/lib/anthropic/client'
import { buildPersonaContext, type PersonaContext } from '@/lib/persona/context-builder'
import {
  buildPersonaResponsePrompt,
  buildPersonaSystemPrompt,
  validatePersonaResponse,
  type PersonaResponseSchema
} from '@/lib/prompts/persona-response'
import { analyzeBrief, type BriefAnalysis } from './brief-analyzer'
import {
  generateFollowUp,
  selectForFollowUp
} from './follow-up-generator'
import {
  MODERATOR_SYSTEM_PROMPT,
  buildIntroductionPrompt,
  buildClosingPrompt
} from '@/lib/prompts/moderator-system'
import type { CalibrationLevel } from '@/lib/persona/skepticism-calculator'

/**
 * A single turn in the conversation
 */
export interface ConversationTurn {
  turnNumber: number
  speakerType: 'moderator' | 'persona'
  speakerName: string
  archetypeSlug?: string
  archetypeId?: string
  content: string
  turnType:
    | 'introduction'
    | 'initial_response'
    | 'probe'
    | 'follow_up'
    | 'clarification'
    | 'revised_response'
    | 'draw_out'
    | 'closing'
  inResponseTo?: number  // Turn number this is responding to
  isRevised?: boolean
  responseData?: PersonaResponseSchema  // Full structured response if persona turn
}

/**
 * Complete conversation result
 */
export interface ConversationResult {
  turns: ConversationTurn[]
  briefAnalysis: BriefAnalysis
  moderationUsed: boolean
  moderationImpact: {
    personasClarified: number
    viewShifts: Array<{
      persona: string
      archetypeSlug: string
      metricName: string
      before: number
      after: number
    }>
    salvageRate: number  // % who improved view after clarification
  }
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    estimatedCost: number
  }
}

/**
 * Configuration for orchestrating a conversation
 */
export interface OrchestratorConfig {
  testId: string
  stimulus: string
  stimulusType: string
  brief?: string
  archetypeIds: string[]
  calibration: CalibrationLevel
  category: string
  maxFollowUps?: number  // Max number of personas to follow up with
  enableModeration?: boolean  // Can be disabled for straightforward content
}

/**
 * Context needed for generating persona responses in conversation
 */
interface PersonaInConversation {
  context: PersonaContext
  initialResponse?: PersonaResponseSchema
  revisedResponse?: PersonaResponseSchema
  receivedClarification: boolean
}

/**
 * Orchestrate a complete moderated focus group conversation
 */
export async function orchestrateConversation(
  config: OrchestratorConfig
): Promise<ConversationResult> {
  const {
    testId,
    stimulus,
    stimulusType,
    brief,
    archetypeIds,
    calibration,
    category,
    maxFollowUps = 3,
    enableModeration = true
  } = config

  const turns: ConversationTurn[] = []
  let turnNumber = 0
  const usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 }

  // Track personas in conversation
  const personas: Map<string, PersonaInConversation> = new Map()

  // ==========================================================================
  // PASS 1: Brief Analysis
  // ==========================================================================

  console.log(`[Conversation ${testId}] Analyzing brief...`)

  const { analysis: briefAnalysis, usage: briefUsage } = await analyzeBrief(
    stimulus,
    brief,
    stimulusType
  )

  usage.inputTokens += briefUsage.inputTokens
  usage.outputTokens += briefUsage.outputTokens
  usage.totalTokens += briefUsage.totalTokens

  const shouldModerate = enableModeration && briefAnalysis.moderationNeeded

  console.log(`[Conversation ${testId}] Moderation needed: ${shouldModerate}`)

  // ==========================================================================
  // STEP 1: Build persona contexts
  // ==========================================================================

  console.log(`[Conversation ${testId}] Building ${archetypeIds.length} persona contexts...`)

  const contextPromises = archetypeIds.map(async (archetypeId) => {
    const context = await buildPersonaContext({
      archetypeId,
      stimulusText: stimulus,
      category,
      calibration
    })
    return { archetypeId, context }
  })

  const contexts = await Promise.all(contextPromises)

  for (const { archetypeId, context } of contexts) {
    personas.set(archetypeId, {
      context,
      receivedClarification: false
    })
  }

  // ==========================================================================
  // STEP 2: Moderator Introduction
  // ==========================================================================

  console.log(`[Conversation ${testId}] Generating moderator introduction...`)

  const introPrompt = buildIntroductionPrompt(stimulusType, stimulus, briefAnalysis)
  const introResult = await complete(introPrompt, {
    system: MODERATOR_SYSTEM_PROMPT,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 300
  })

  usage.inputTokens += introResult.usage.inputTokens
  usage.outputTokens += introResult.usage.outputTokens
  usage.totalTokens += introResult.usage.totalTokens

  turns.push({
    turnNumber: turnNumber++,
    speakerType: 'moderator',
    speakerName: 'Moderator',
    content: introResult.content.trim(),
    turnType: 'introduction'
  })

  // ==========================================================================
  // STEP 3: Collect Initial Responses
  // ==========================================================================

  console.log(`[Conversation ${testId}] Collecting initial persona responses...`)

  // Generate responses in batches to respect rate limits
  const BATCH_SIZE = 3
  const archetypeList = Array.from(personas.entries())

  for (let i = 0; i < archetypeList.length; i += BATCH_SIZE) {
    const batch = archetypeList.slice(i, i + BATCH_SIZE)

    const responsePromises = batch.map(async ([archetypeId, personaData]) => {
      const prompt = buildPersonaResponsePrompt(
        personaData.context,
        stimulus,
        stimulusType,
        brief
      )

      const result = await completeJSON<PersonaResponseSchema>(prompt, {
        system: buildPersonaSystemPrompt(),
        temperature: TEMPERATURES.personaResponse,
        maxTokens: 2000
      })

      if (!validatePersonaResponse(result.parsed)) {
        throw new Error(`Invalid response from ${personaData.context.name.fullName}`)
      }

      return {
        archetypeId,
        response: result.parsed,
        usage: result.usage
      }
    })

    const responses = await Promise.all(responsePromises)

    for (const { archetypeId, response, usage: respUsage } of responses) {
      const personaData = personas.get(archetypeId)!
      personaData.initialResponse = response

      usage.inputTokens += respUsage.inputTokens
      usage.outputTokens += respUsage.outputTokens
      usage.totalTokens += respUsage.totalTokens

      // Add to conversation
      turns.push({
        turnNumber: turnNumber++,
        speakerType: 'persona',
        speakerName: personaData.context.name.fullName,
        archetypeSlug: personaData.context.archetype.slug,
        archetypeId,
        content: response.gut_reaction,  // Initial turn shows gut reaction
        turnType: 'initial_response',
        responseData: response
      })
    }
  }

  // ==========================================================================
  // STEP 4: Moderated Follow-ups (if needed)
  // ==========================================================================

  let moderationImpact = {
    personasClarified: 0,
    viewShifts: [] as Array<{
      persona: string
      archetypeSlug: string
      metricName: string
      before: number
      after: number
    }>,
    salvageRate: 0
  }

  if (shouldModerate) {
    console.log(`[Conversation ${testId}] Determining follow-up needs...`)

    // Prepare response data for follow-up selection
    const responsesForFollowUp = Array.from(personas.entries()).map(([, personaData]) => ({
      personaName: personaData.context.name.fullName,
      response: personaData.initialResponse!.gut_reaction + ' ' + personaData.initialResponse!.considered_view,
      archetypeSlug: personaData.context.archetype.slug
    }))

    // Select which personas need follow-up
    const followUpTargets = selectForFollowUp(responsesForFollowUp, briefAnalysis, maxFollowUps)

    console.log(`[Conversation ${testId}] Following up with ${followUpTargets.length} personas...`)

    // Process follow-ups
    for (const target of followUpTargets) {
      // Find the persona data
      const personaEntry = Array.from(personas.entries()).find(
        ([, data]) => data.context.name.fullName === target.personaName
      )

      if (!personaEntry) continue

      const [archetypeId, personaData] = personaEntry

      // Generate moderator follow-up
      const followUp = await generateFollowUp(
        target.personaName,
        target.response,
        briefAnalysis,
        target.determination
      )

      if (followUp.usage) {
        usage.inputTokens += followUp.usage.inputTokens
        usage.outputTokens += followUp.usage.outputTokens
        usage.totalTokens += followUp.usage.totalTokens
      }

      // Determine turn type based on follow-up type
      const moderatorTurnType = followUp.type === 'clarification' ? 'clarification' : 'probe'

      // Add moderator turn
      const moderatorTurnNumber = turnNumber++
      turns.push({
        turnNumber: moderatorTurnNumber,
        speakerType: 'moderator',
        speakerName: 'Moderator',
        content: followUp.content,
        turnType: moderatorTurnType,
        inResponseTo: turns.find(t =>
          t.speakerName === target.personaName && t.turnType === 'initial_response'
        )?.turnNumber
      })

      // If this was a clarification, get revised response
      if (followUp.type === 'clarification') {
        personaData.receivedClarification = true
        moderationImpact.personasClarified++

        // Generate revised response with context
        const revisedPrompt = buildRevisedResponsePrompt(
          personaData.context,
          stimulus,
          stimulusType,
          brief,
          briefAnalysis,
          followUp.content,
          personaData.initialResponse!
        )

        const revisedResult = await completeJSON<PersonaResponseSchema>(revisedPrompt, {
          system: buildPersonaSystemPrompt(),
          temperature: TEMPERATURES.personaResponse,
          maxTokens: 2000
        })

        usage.inputTokens += revisedResult.usage.inputTokens
        usage.outputTokens += revisedResult.usage.outputTokens
        usage.totalTokens += revisedResult.usage.totalTokens

        if (validatePersonaResponse(revisedResult.parsed)) {
          personaData.revisedResponse = revisedResult.parsed

          // Track view shifts
          const initialIntent = personaData.initialResponse!.purchase_intent
          const revisedIntent = revisedResult.parsed.purchase_intent

          if (revisedIntent !== initialIntent) {
            moderationImpact.viewShifts.push({
              persona: personaData.context.name.fullName,
              archetypeSlug: personaData.context.archetype.slug,
              metricName: 'purchase_intent',
              before: initialIntent,
              after: revisedIntent
            })
          }

          const initialCred = personaData.initialResponse!.credibility_rating
          const revisedCred = revisedResult.parsed.credibility_rating

          if (revisedCred !== initialCred) {
            moderationImpact.viewShifts.push({
              persona: personaData.context.name.fullName,
              archetypeSlug: personaData.context.archetype.slug,
              metricName: 'credibility_rating',
              before: initialCred,
              after: revisedCred
            })
          }

          // Add revised response turn
          turns.push({
            turnNumber: turnNumber++,
            speakerType: 'persona',
            speakerName: personaData.context.name.fullName,
            archetypeSlug: personaData.context.archetype.slug,
            archetypeId,
            content: revisedResult.parsed.considered_view,
            turnType: 'revised_response',
            inResponseTo: moderatorTurnNumber,
            isRevised: true,
            responseData: revisedResult.parsed
          })
        }
      } else {
        // For probes, get a follow-up response
        const followUpPrompt = buildFollowUpPrompt(
          personaData.context,
          stimulus,
          followUp.content,
          personaData.initialResponse!
        )

        const followUpResult = await complete(followUpPrompt, {
          system: buildPersonaSystemPrompt(),
          temperature: TEMPERATURES.personaResponse,
          maxTokens: 500
        })

        usage.inputTokens += followUpResult.usage.inputTokens
        usage.outputTokens += followUpResult.usage.outputTokens
        usage.totalTokens += followUpResult.usage.totalTokens

        turns.push({
          turnNumber: turnNumber++,
          speakerType: 'persona',
          speakerName: personaData.context.name.fullName,
          archetypeSlug: personaData.context.archetype.slug,
          archetypeId,
          content: followUpResult.content.trim(),
          turnType: 'follow_up',
          inResponseTo: moderatorTurnNumber
        })
      }
    }

    // Calculate salvage rate
    if (moderationImpact.personasClarified > 0) {
      // Count unique personas with positive shifts
      const uniquePositive = new Set(
        moderationImpact.viewShifts
          .filter(s => s.after > s.before)
          .map(s => s.persona)
      ).size
      moderationImpact.salvageRate = Math.round(
        (uniquePositive / moderationImpact.personasClarified) * 100
      )
    }
  }

  // ==========================================================================
  // STEP 5: Closing
  // ==========================================================================

  console.log(`[Conversation ${testId}] Generating closing...`)

  // Extract key themes from responses
  const keyThemes = extractKeyThemes(Array.from(personas.values()))

  const closingPrompt = buildClosingPrompt(keyThemes, stimulusType)
  const closingResult = await complete(closingPrompt, {
    system: MODERATOR_SYSTEM_PROMPT,
    temperature: TEMPERATURES.personaResponse,
    maxTokens: 200
  })

  usage.inputTokens += closingResult.usage.inputTokens
  usage.outputTokens += closingResult.usage.outputTokens
  usage.totalTokens += closingResult.usage.totalTokens

  turns.push({
    turnNumber: turnNumber++,
    speakerType: 'moderator',
    speakerName: 'Moderator',
    content: closingResult.content.trim(),
    turnType: 'closing'
  })

  // Calculate estimated cost
  const inputCost = (usage.inputTokens / 1_000_000) * 3
  const outputCost = (usage.outputTokens / 1_000_000) * 15
  usage.estimatedCost = Math.round((inputCost + outputCost) * 100) / 100

  return {
    turns,
    briefAnalysis,
    moderationUsed: shouldModerate && moderationImpact.personasClarified > 0,
    moderationImpact,
    usage
  }
}

/**
 * Build prompt for revised response after clarification
 */
function buildRevisedResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  stimulusType: string,
  brief: string | undefined,
  briefAnalysis: BriefAnalysis,
  moderatorClarification: string,
  initialResponse: PersonaResponseSchema
): string {
  const basePrompt = buildPersonaResponsePrompt(context, stimulus, stimulusType, brief)

  return `${basePrompt}

# Important: Revised Response

You already gave an initial reaction. The moderator then provided this context:

"${moderatorClarification}"

Your INITIAL reaction was:
- Gut reaction: "${initialResponse.gut_reaction}"
- Purchase intent: ${initialResponse.purchase_intent}/10
- Credibility: ${initialResponse.credibility_rating}/10

Now that you understand the creative intent was: ${briefAnalysis.intendedInterpretation}

Please provide a REVISED response. You may:
- Change your view if the context genuinely shifts your perception
- Maintain your view if you still have the same concerns
- Partially adjust - some things may land better, others may not

Be authentic to your persona. Don't just say what you think the moderator wants to hear. Real consumers don't completely flip their views, but they do sometimes see things differently with context.`
}

/**
 * Build prompt for follow-up response to a probe
 */
function buildFollowUpPrompt(
  context: PersonaContext,
  stimulus: string,
  moderatorQuestion: string,
  initialResponse: PersonaResponseSchema
): string {
  return `You are ${context.name.fullName}, ${context.demographicSummary}.

You were shown this marketing content:
"""
${stimulus}
"""

Your initial reaction was: "${initialResponse.gut_reaction}"

The moderator asked: "${moderatorQuestion}"

Respond naturally as ${context.name.firstName} would in a focus group. Keep your response to 2-4 sentences. Be specific and authentic to your persona's perspective.`
}

/**
 * Extract key themes from persona responses
 */
function extractKeyThemes(personas: PersonaInConversation[]): string[] {
  const themes = new Set<string>()

  for (const persona of personas) {
    const response = persona.revisedResponse || persona.initialResponse
    if (!response) continue

    // Extract from what works
    for (const item of response.what_works || []) {
      const simplified = item.toLowerCase().slice(0, 30)
      themes.add(simplified)
    }

    // Extract from concerns
    for (const concern of response.key_concerns || []) {
      const simplified = concern.toLowerCase().slice(0, 30)
      themes.add(simplified)
    }
  }

  return Array.from(themes).slice(0, 5)
}

/**
 * Store conversation turns to database
 */
export async function storeConversationTurns(
  testId: string,
  turns: ConversationTurn[]
): Promise<void> {
  const supabase = createAdminClient()

  const turnsToInsert = turns.map(turn => ({
    test_id: testId,
    turn_number: turn.turnNumber,
    speaker_type: turn.speakerType,
    speaker_name: turn.speakerName,
    archetype_slug: turn.archetypeSlug || null,
    archetype_id: turn.archetypeId || null,
    content: turn.content,
    turn_type: turn.turnType,
    // Note: in_response_to requires UUID but we don't have IDs until after insert
    // Setting to null for now - could do a two-pass insert if needed
    in_response_to: null,
    is_revised: turn.isRevised || false
  }))

  const { error } = await supabase
    .from('conversation_turns')
    .insert(turnsToInsert)

  if (error) {
    console.error('Error storing conversation turns:', error)
    throw new Error('Failed to store conversation turns')
  }
}

/**
 * Get the final responses for aggregation
 * Uses revised responses where available, falls back to initial
 */
export function getFinalResponses(
  personas: Map<string, PersonaInConversation>
): Array<{
  context: PersonaContext
  response: PersonaResponseSchema
  wasRevised: boolean
}> {
  return Array.from(personas.values()).map(persona => ({
    context: persona.context,
    response: persona.revisedResponse || persona.initialResponse!,
    wasRevised: !!persona.revisedResponse
  }))
}
