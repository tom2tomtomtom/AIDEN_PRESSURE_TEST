/**
 * Moderator System Prompts
 * Defines the AI moderator's persona and conversation management prompts
 */

import type { BriefAnalysis } from '@/lib/moderator/brief-analyzer'

/**
 * The moderator's core identity and behavior guidelines
 */
export const MODERATOR_SYSTEM_PROMPT = `You are an experienced qualitative research moderator facilitating a synthetic focus group discussion. Your role is to:

1. INTRODUCE stimuli clearly and neutrally
2. LISTEN to participant responses without judgment
3. PROBE for deeper insights when needed
4. CLARIFY creative intent when participants misinterpret
5. MANAGE group dynamics by drawing out different viewpoints

CRITICAL MODERATOR RULES:

**Never Lead**
- Don't suggest what participants should think
- Don't indicate "correct" answers
- Ask open-ended questions: "Tell me more" not "Don't you think X?"

**Clarify Without Bias**
- When providing creative context, frame it as information, not persuasion
- "The creative team intended this as tongue-in-cheek" NOT "You should see this as funny"
- Let participants form their own revised opinion

**Probe Constructively**
- Ask "What would make this work better for you?" not "Don't you like it?"
- Seek understanding: "Help me understand your concern"
- Encourage specificity: "Can you give me an example?"

**Manage the Room**
- Acknowledge all viewpoints
- Draw out quieter participants
- Don't let one voice dominate
- Keep discussion focused on the stimulus

Your tone should be:
- Professional but warm
- Curious and engaged
- Neutral on the stimulus itself
- Encouraging of honest responses`

/**
 * Prompt for introducing the stimulus
 */
export function buildIntroductionPrompt(
  stimulusType: string,
  stimulus: string,
  _briefAnalysis?: BriefAnalysis
): string {
  return `Generate a brief, neutral moderator introduction for a ${stimulusType} that will be shown to focus group participants.

The stimulus is:
"""
${stimulus}
"""

Write a 2-3 sentence introduction that:
1. Thanks participants for joining
2. Explains what they'll be seeing (a ${stimulusType})
3. Asks for their honest first impressions

Do NOT:
- Reveal the creative intent or strategy
- Prime them to respond a certain way
- Make any evaluative statements

Return just the moderator's spoken words, no stage directions.`
}

/**
 * Prompt for generating a clarification when literal interpretation detected
 */
export function buildClarificationPrompt(
  briefAnalysis: BriefAnalysis,
  triggeredFlag: { pattern: string; explanation: string },
  personaName: string,
  personaResponse: string
): string {
  return `A focus group participant has responded in a way that suggests they're taking the creative content too literally.

PARTICIPANT: ${personaName}
THEIR RESPONSE: "${personaResponse}"

DETECTED ISSUE: ${triggeredFlag.explanation}

THE INTENDED CREATIVE APPROACH:
${briefAnalysis.intendedInterpretation}

CONTEXT YOU CAN SHARE:
${briefAnalysis.contextStatement}

Generate a moderator response that:
1. Acknowledges what the participant said (don't dismiss them)
2. Provides context about the creative intent WITHOUT leading
3. Asks if knowing this changes their view

Example structure:
"I hear what you're saying about [their concern]. Here's some context - [neutral explanation of intent]. Knowing that, does it change how you see it?"

Keep it conversational, 2-3 sentences. Return just the moderator's words.`
}

/**
 * Prompt for probing deeper after initial response
 */
export function buildProbingPrompt(
  personaName: string,
  personaResponse: string,
  probeType: 'deeper_insight' | 'what_would_help' | 'specific_example' | 'emotional_exploration'
): string {
  const probeTemplates = {
    deeper_insight: `Generate a follow-up question to understand WHY ${personaName} feels this way.

Their response: "${personaResponse}"

Ask an open-ended question that explores the underlying reason for their reaction. Don't challenge their view, seek to understand it.`,

    what_would_help: `Generate a constructive follow-up question for ${personaName}.

Their response: "${personaResponse}"

Ask what would make this concept/content work better for them. Focus on improvement, not criticism of their feedback.`,

    specific_example: `Generate a follow-up question to get more specifics from ${personaName}.

Their response: "${personaResponse}"

Ask them for a concrete example or to elaborate on a specific point. Help them articulate their reaction more precisely.`,

    emotional_exploration: `Generate a follow-up question to explore ${personaName}'s emotional reaction.

Their response: "${personaResponse}"

Ask about how this content made them FEEL, not just what they think. Explore the emotional dimension.`
  }

  return `${probeTemplates[probeType]}

Return just the moderator's question, 1-2 sentences. Keep it conversational and non-leading.`
}

/**
 * Prompt for drawing out a quiet participant
 */
export function buildDrawOutPrompt(
  quietPersonaName: string,
  recentSpeakers: string[],
  topic: string
): string {
  return `In this focus group, ${recentSpeakers.join(' and ')} have been sharing views on ${topic}.

${quietPersonaName} hasn't spoken yet. Generate a moderator prompt that:
1. Gently invites them to share
2. Doesn't put them on the spot
3. Gives them an easy entry point

Example approaches:
- "[Name], I'd love to hear your take on this"
- "[Name], does this resonate differently for you?"
- "[Name], any thoughts you'd like to add?"

Return just the moderator's words, one sentence.`
}

/**
 * Prompt for transitioning between topics
 */
export function buildTransitionPrompt(
  previousTopic: string,
  nextTopic: string
): string {
  return `Generate a brief moderator transition from discussing "${previousTopic}" to "${nextTopic}".

The transition should:
1. Acknowledge what was discussed
2. Smoothly introduce the new topic
3. Maintain energy and engagement

Return just the moderator's words, 1-2 sentences.`
}

/**
 * Prompt for closing/summary
 */
export function buildClosingPrompt(
  keyThemes: string[],
  stimulusType: string
): string {
  return `Generate a brief moderator closing statement for a focus group that discussed a ${stimulusType}.

Key themes that emerged: ${keyThemes.join(', ')}

The closing should:
1. Thank participants for their honesty
2. Briefly acknowledge the range of views (without judging them)
3. Not reveal any "answer" or preference

Return just the moderator's words, 2-3 sentences.`
}

/**
 * Generate response for a follow-up turn based on persona's revised view
 */
export function buildFollowUpResponsePrompt(
  personaName: string,
  initialResponse: string,
  moderatorClarification: string,
  briefAnalysis: BriefAnalysis
): string {
  return `A participant was given context about the creative intent and now needs to share their revised view.

PARTICIPANT: ${personaName}
THEIR INITIAL RESPONSE: "${initialResponse}"
MODERATOR'S CLARIFICATION: "${moderatorClarification}"

CREATIVE INTENT: ${briefAnalysis.intendedInterpretation}

Now generate a probing question that asks them:
1. How knowing the context changes their view (if at all)
2. What would make this concept land better for them

Keep it to 1-2 sentences. Return just the moderator's words.`
}

/**
 * Detect if a response needs moderator intervention
 */
export function shouldIntervene(
  response: string,
  briefAnalysis: BriefAnalysis
): {
  shouldIntervene: boolean
  reason: 'literal_interpretation' | 'needs_probing' | 'emotional_exploration' | null
  suggestedApproach: string | null
} {
  // Check for literal interpretation red flags
  const responseLower = response.toLowerCase()

  for (const flag of briefAnalysis.redFlags) {
    const patternWords = flag.pattern.toLowerCase().split(/\s+/)
    const matches = patternWords.filter(word =>
      word.length > 3 && responseLower.includes(word)
    )

    if (matches.length >= 2) {
      return {
        shouldIntervene: true,
        reason: 'literal_interpretation',
        suggestedApproach: flag.clarificationProbe
      }
    }
  }

  // Check for vague responses that need probing
  const vagueIndicators = [
    'i don\'t know',
    'not sure',
    'maybe',
    'i guess',
    'kind of',
    'sort of',
    'it\'s okay',
    'it\'s fine'
  ]

  for (const indicator of vagueIndicators) {
    if (responseLower.includes(indicator)) {
      return {
        shouldIntervene: true,
        reason: 'needs_probing',
        suggestedApproach: 'Ask them to elaborate on what specifically makes them uncertain'
      }
    }
  }

  // Check for strong emotional language that could be explored
  const emotionalIndicators = [
    'hate',
    'love',
    'annoying',
    'frustrating',
    'exciting',
    'scary',
    'worried',
    'angry',
    'offensive'
  ]

  for (const indicator of emotionalIndicators) {
    if (responseLower.includes(indicator)) {
      return {
        shouldIntervene: true,
        reason: 'emotional_exploration',
        suggestedApproach: `Explore why they feel "${indicator}" about this`
      }
    }
  }

  return {
    shouldIntervene: false,
    reason: null,
    suggestedApproach: null
  }
}

/**
 * Moderator response types for conversation flow
 */
export type ModeratorResponseType =
  | 'introduction'
  | 'clarification'
  | 'probe'
  | 'draw_out'
  | 'transition'
  | 'closing'
  | 'acknowledgment'

/**
 * Simple acknowledgment phrases for natural conversation flow
 */
export const ACKNOWLEDGMENT_PHRASES = [
  'Thank you for sharing that.',
  'I appreciate your honesty.',
  'That\'s a helpful perspective.',
  'Interesting point.',
  'Thanks for that insight.',
  'Got it, that helps me understand.',
  'Thank you, that\'s clear.'
]

/**
 * Get a random acknowledgment phrase
 */
export function getAcknowledgment(): string {
  const index = Math.floor(Math.random() * ACKNOWLEDGMENT_PHRASES.length)
  return ACKNOWLEDGMENT_PHRASES[index] || ACKNOWLEDGMENT_PHRASES[0]!
}
