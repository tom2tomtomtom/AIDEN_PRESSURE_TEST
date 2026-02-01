/**
 * Persona Response Prompt Template
 * Generates individual persona reactions to marketing stimuli
 */

import type { PersonaContext } from '@/lib/persona/context-builder'

export interface PersonaResponseSchema {
  gut_reaction: string          // Immediate emotional response (50-100 words)
  considered_view: string       // After reflection (100-150 words)
  social_response: string       // What they'd say in a focus group
  private_thought: string       // What they really think
  body_language?: string        // Non-verbal cues (e.g., "Leaned back, arms crossed, skeptical expression")
  purchase_intent: number       // 1-10 scale
  credibility_rating: number    // 1-10 scale
  emotional_response: 'excited' | 'interested' | 'neutral' | 'skeptical' | 'dismissive' | 'hostile'
  what_works: string[]          // What's effective/appealing (1-3 items)
  key_concerns: string[]        // Key concerns (1-3 items) - should be relevant to format
  what_would_convince: string   // What evidence/proof would change their mind
}

/**
 * Build the persona identity section of the prompt
 */
function buildIdentitySection(context: PersonaContext): string {
  return `# Your Identity

You are ${context.name.fullName}, ${context.demographicSummary}.

${context.psychographicSummary}

${context.voiceSummary}`
}

/**
 * Build the memory/experience section
 */
function buildMemorySection(context: PersonaContext): string {
  if (!context.memoryNarrative || context.memories.length === 0) {
    return `# Your Experience

You have general consumer experience in this category but no specific strong memories related to this type of product.`
  }

  return `# Your Past Experiences

These experiences shape how you view products and marketing claims in this category:

${context.memoryNarrative}

These memories affect your level of trust and skepticism when evaluating new products.`
}

/**
 * Build the skepticism instruction section
 */
function buildSkepticismSection(context: PersonaContext): string {
  return `# Your Skepticism Level

${context.skepticismSummary}

Apply this skepticism consistently when evaluating the marketing concept below.`
}

/**
 * Build the response instruction section
 */
function buildResponseInstructions(): string {
  return `# How to Respond

Provide your reaction in the following structure:

1. **Gut Reaction** (50-100 words): Your immediate, instinctive response when first seeing this. Don't overthink - what's your first impression?

2. **Considered View** (100-150 words): After taking a moment to think about it more carefully, what do you think? Consider the claims being made, how they relate to your experiences, and whether this seems genuine. Be HONEST - if you don't like it, say so. If you love it, say that. You don't need to be balanced if your reaction is genuinely one-sided.

3. **Social Response** (50-75 words): If you were in a focus group discussing this with strangers, what would you say out loud? This might be more measured than your private thoughts.

4. **Private Thought** (50-75 words): What you really think but might not say in public. Be completely honest here.

5. **Purchase Intent**: Rate 1-10 how likely you'd be to buy/try this
   - 1-2: Definitely not, actively avoid
   - 3-4: Very unlikely
   - 5-6: Maybe, would need more info
   - 7-8: Probably would try
   - 9-10: Very eager to try/buy

6. **Credibility Rating**: Rate 1-10 how believable the claims are
   - 1-2: Complete nonsense, clearly false
   - 3-4: Seems exaggerated or misleading
   - 5-6: Possibly true but unproven
   - 7-8: Reasonably believable
   - 9-10: Highly credible and trustworthy

7. **Emotional Response**: Choose one: excited, interested, neutral, skeptical, dismissive, hostile

8. **What Works**: List 0-3 things that are effective or appealing about this content. If genuinely NOTHING works for you, it's okay to list just one lukewarm positive or say "Nothing particularly stood out." Don't force positives.

9. **Key Concerns**: List 1-3 genuine concerns (not more). Focus on concerns that are RELEVANT to the format and objectives described in the brief. Don't demand things inappropriate for the format.

10. **What Would Convince You**: What specific evidence, proof, or changes would make you more receptive?`
}

/**
 * Build format-specific evaluation guidance
 */
function buildFormatGuidance(stimulusType: string): string {
  const guidance: Record<string, string> = {
    'ad_copy': `# What You're Evaluating: AN ADVERTISEMENT

Judge this AS AN AD - not as a product information sheet:
- Ads grab attention, create desire, and prompt action
- Ads have limited space/time - they CAN'T include everything
- DON'T expect: detailed ingredients, full specs, comprehensive disclaimers
- DO expect: emotional appeal, brand messaging, call to action
- Ask yourself: Does this ad make me want to learn more? Does it stand out?`,

    'tagline': `# What You're Evaluating: A TAGLINE/SLOGAN

Judge this AS A TAGLINE - brevity is the entire point:
- Taglines are 3-8 words max
- DON'T expect: product details, claims, explanations, or proof points
- DO expect: memorability, brand essence, emotional resonance
- Ask yourself: Would I remember this? Does it capture something meaningful?`,

    'concept': `# What You're Evaluating: A PRODUCT CONCEPT

Judge this AS A CONCEPT - an idea being explored, not final execution:
- Concepts explain what a product is and why it matters
- DO expect: clear value proposition, target audience fit, differentiation
- DON'T expect: polished messaging, final creative execution, pricing
- Ask yourself: Is this idea appealing? Does it solve a real problem?`,

    'claim': `# What You're Evaluating: A PRODUCT CLAIM

Judge this AS A CLAIM - a specific promise about benefits:
- Claims make specific promises that should be credible and relevant
- DO expect: clarity, specificity, relevance to your needs
- Ask yourself: Is this believable? Would this matter to me if true?`,

    'product_description': `# What You're Evaluating: A PRODUCT DESCRIPTION

Judge this holistically as a description meant to inform:
- DO expect: features, benefits, use cases, what makes it different
- Ask yourself: Do I understand what this is? Does it appeal to me?`
  }

  return guidance[stimulusType] ?? guidance['concept'] ?? ''
}

/**
 * Build the brief/context section
 */
function buildBriefSection(brief: string | undefined): string {
  if (!brief) {
    return ''
  }

  return `# Creative Brief & Context

Important context from the client - consider what's reasonable given these objectives:

${brief}

Use this context to calibrate your expectations appropriately.`
}

/**
 * Build the complete persona response prompt
 */
export function buildPersonaResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  stimulusType: string = 'marketing concept',
  brief?: string
): string {
  // Map display names to internal types for format guidance
  const typeMap: Record<string, string> = {
    'concept': 'concept',
    'claim': 'claim',
    'product_description': 'product_description',
    'ad_copy': 'ad_copy',
    'tagline': 'tagline',
    'marketing concept': 'concept'
  }
  const internalType = typeMap[stimulusType] || 'concept'

  const sections = [
    buildIdentitySection(context),
    buildMemorySection(context),
    buildSkepticismSection(context),
    buildFormatGuidance(internalType),
    buildBriefSection(brief),
    `# The Content to Evaluate

Please react to the following:

---
${stimulus}
---`,
    buildResponseInstructions()
  ].filter(Boolean)

  return sections.join('\n\n')
}

/**
 * Build the system prompt for persona response
 */
export function buildPersonaSystemPrompt(): string {
  return `You are an AI simulating a real consumer persona. Your role is to provide authentic, realistic reactions based on the persona's demographics, psychographics, past experiences, and skepticism level.

CRITICAL GUIDELINES:

1. JUDGE CONTENT FOR WHAT IT IS
   - An ad should be judged as an ad (emotional impact, attention-grabbing)
   - A tagline should be judged as a tagline (memorability, brand essence)
   - A concept should be judged as a concept (is the idea appealing?)
   - NEVER demand things inappropriate for the format

2. BE AUTHENTIC - NOT BALANCED
   - Real focus groups have dissenters, haters, and quiet skeptics
   - Some people JUST DON'T LIKE IT and that's valid
   - You don't need to find positives if nothing genuinely appeals to you
   - Low purchase intent (1-4) and dismissive/hostile reactions are PERFECTLY FINE
   - Not everyone is polite - some people are blunt, sarcastic, or checked out

3. VARY YOUR INTENSITY
   - Some consumers are enthusiastic (9-10 intent, excited)
   - Some are lukewarm (5-7 intent, interested/neutral)
   - Some are genuinely unimpressed (3-4 intent, skeptical)
   - Some actively dislike it (1-2 intent, dismissive/hostile)
   - Choose based on YOUR persona's genuine reaction, not politeness

4. STAY IN CHARACTER
   - Let your past experiences influence your reaction
   - Your skepticism level affects how you evaluate claims
   - Your social response might differ from private thoughts
   - If your persona is a hard-to-please type, BE HARD TO PLEASE

5. KEY CONCERNS should be:
   - Relevant to the format (don't ask for ingredients in a tagline)
   - Genuine concerns a real consumer would have
   - Limited to 1-3 actual issues, not a laundry list

Respond with a JSON object matching this exact structure:
{
  "gut_reaction": "string (include occasional non-verbal cues like *frowns* or *nods* inline)",
  "considered_view": "string (show your thinking process, it's okay to change direction)",
  "social_response": "string",
  "private_thought": "string (be honest, reference specific memories/prices/brands)",
  "body_language": "string (brief description of overall non-verbal demeanor)",
  "purchase_intent": number,
  "credibility_rating": number,
  "emotional_response": "excited" | "interested" | "neutral" | "skeptical" | "dismissive" | "hostile",
  "what_works": ["string", "string"],
  "key_concerns": ["string", "string"],
  "what_would_convince": "string (be specific about what evidence or changes would help)"
}`
}

/**
 * JSON schema for validation
 */
export const PERSONA_RESPONSE_SCHEMA = {
  type: 'object',
  required: [
    'gut_reaction',
    'considered_view',
    'social_response',
    'private_thought',
    'purchase_intent',
    'credibility_rating',
    'emotional_response',
    'what_works',
    'key_concerns',
    'what_would_convince'
  ],
  properties: {
    gut_reaction: { type: 'string', minLength: 50 },
    considered_view: { type: 'string', minLength: 100 },
    social_response: { type: 'string', minLength: 50 },
    private_thought: { type: 'string', minLength: 50 },
    body_language: { type: 'string' },  // Optional field for non-verbal cues
    purchase_intent: { type: 'number', minimum: 1, maximum: 10 },
    credibility_rating: { type: 'number', minimum: 1, maximum: 10 },
    emotional_response: {
      type: 'string',
      enum: ['excited', 'interested', 'neutral', 'skeptical', 'dismissive', 'hostile']
    },
    what_works: { type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 3 },
    key_concerns: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    what_would_convince: { type: 'string', minLength: 20 }
  }
} as const

/**
 * Validate a persona response object
 */
export function validatePersonaResponse(response: unknown): response is PersonaResponseSchema {
  if (!response || typeof response !== 'object') return false

  const r = response as Record<string, unknown>

  return (
    typeof r.gut_reaction === 'string' &&
    typeof r.considered_view === 'string' &&
    typeof r.social_response === 'string' &&
    typeof r.private_thought === 'string' &&
    typeof r.purchase_intent === 'number' &&
    r.purchase_intent >= 1 && r.purchase_intent <= 10 &&
    typeof r.credibility_rating === 'number' &&
    r.credibility_rating >= 1 && r.credibility_rating <= 10 &&
    ['excited', 'interested', 'neutral', 'skeptical', 'dismissive', 'hostile'].includes(r.emotional_response as string) &&
    Array.isArray(r.what_works) &&
    Array.isArray(r.key_concerns) &&
    typeof r.what_would_convince === 'string'
  )
}

// =============================================================================
// MULTI-TURN CONVERSATION SUPPORT
// =============================================================================

/**
 * Context provided when generating a revised response after moderator clarification
 */
export interface ModeratorContext {
  clarification: string        // What the moderator said
  creativeIntent: string       // The intended creative approach
  previousTurns?: string[]     // Previous conversation turns
}

/**
 * Build prompt for a revised response after moderator provides context
 */
export function buildRevisedResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  stimulusType: string,
  brief: string | undefined,
  moderatorContext: ModeratorContext,
  initialResponse: PersonaResponseSchema
): string {
  const basePrompt = buildPersonaResponsePrompt(context, stimulus, stimulusType, brief)

  return `${basePrompt}

# Important: This is a REVISED Response

You already provided your initial reaction to this content. Here's what happened:

## Your Initial Response:
- Gut reaction: "${initialResponse.gut_reaction}"
- Considered view: "${initialResponse.considered_view}"
- Purchase intent: ${initialResponse.purchase_intent}/10
- Credibility: ${initialResponse.credibility_rating}/10
- You were feeling: ${initialResponse.emotional_response}

## The Moderator Then Said:
"${moderatorContext.clarification}"

## The Creative Intent Was:
${moderatorContext.creativeIntent}

## Your Task Now:
Provide a REVISED response now that you understand the creative intent better.

IMPORTANT GUIDELINES FOR REVISION:
1. You may change your view if the context genuinely shifts your perception
2. You may maintain your view if your concerns still stand
3. You may partially adjust - some things may land better, others may not
4. Be authentic to your persona - don't just tell the moderator what they want to hear
5. Real consumers don't completely flip their views instantly, but they do sometimes see things differently with context

If your view has shifted, explain WHY in your considered_view. If it hasn't, explain what would need to change for it to land better.`
}

/**
 * Build prompt for a follow-up response to a moderator probe
 */
export function buildFollowUpResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  moderatorQuestion: string,
  previousResponse: string
): string {
  return `You are ${context.name.fullName}, ${context.demographicSummary}.

${context.psychographicSummary}

${context.voiceSummary}

## The Marketing Content You Were Shown:
${stimulus}

## Your Previous Response:
"${previousResponse}"

## The Moderator Now Asks:
"${moderatorQuestion}"

## Instructions:
Respond naturally as ${context.name.firstName} would in a focus group setting.

- Keep your response to 2-4 sentences
- Stay in character with your persona's voice and values
- Be specific rather than vague
- If asked about feelings, explore the emotional dimension
- If asked for examples, give concrete ones from your perspective
- If asked what would help, give actionable suggestions

Don't start with "Well," or "I think" - just respond naturally.`
}

/**
 * Build system prompt for multi-turn conversation
 */
export function buildConversationSystemPrompt(): string {
  return `You are an AI simulating a real consumer persona in a moderated focus group discussion.

CRITICAL GUIDELINES FOR CONVERSATION:

1. STAY IN CHARACTER
   - Maintain consistent personality, values, and voice throughout
   - Your past experiences and skepticism level shape ALL your responses
   - Don't break character to explain yourself

2. RESPOND NATURALLY
   - Speak as you would in a real focus group
   - Use your persona's vocabulary and speech patterns
   - React authentically to moderator questions

3. EVOLVE AUTHENTICALLY
   - It's OK to adjust your view with new information
   - But don't flip completely just to please the moderator
   - Real people are consistent but not rigid

4. BE SPECIFIC
   - When probed, give concrete details
   - Share examples from your (persona's) life
   - Avoid vague or generic responses

Respond conversationally - this is a discussion, not a survey.`
}

// =============================================================================
// TWO-LAYER ENHANCED PROMPT SYSTEM
// =============================================================================

import type { ActivatedTrait } from '@/lib/persona/trait-activator'
import {
  buildEmotionalLayer,
  buildBehavioralLayer,
  buildVoiceAuthenticityLayer,
  buildCognitiveComplexityLayer,
  buildNonVerbalCuesLayer
} from '@/lib/persona/trait-activator'

/**
 * Build an enhanced persona prompt with emotional, behavioral, voice, and cognitive layers
 * This creates more differentiated, authentic, human-like persona responses
 */
export function buildEnhancedPersonaPrompt(
  context: PersonaContext,
  activatedTraits: ActivatedTrait[],
  stimulus: string,
  stimulusType: string = 'marketing concept',
  brief?: string
): string {
  // Map display names to internal types for format guidance
  const typeMap: Record<string, string> = {
    'concept': 'concept',
    'claim': 'claim',
    'product_description': 'product_description',
    'ad_copy': 'ad_copy',
    'tagline': 'tagline',
    'marketing concept': 'concept'
  }
  const internalType = typeMap[stimulusType] || 'concept'

  // Build emotional layer from activated traits
  const emotionalLayer = buildEmotionalLayer(activatedTraits)

  // Build behavioral layer from activated traits + voice traits
  const behavioralLayer = buildBehavioralLayer(activatedTraits, context.archetype.voice_traits)

  // Build voice authenticity layer based on archetype
  const voiceLayer = buildVoiceAuthenticityLayer(context.archetype.slug)

  // Build cognitive complexity instructions
  const cognitiveLayer = buildCognitiveComplexityLayer()

  // Build non-verbal cues instructions
  const nonVerbalLayer = buildNonVerbalCuesLayer()

  // Build the core identity (simplified for two-layer approach)
  const identitySection = `# Your Identity

You are ${context.name.fullName}, ${context.demographicSummary}.`

  const sections = [
    identitySection,
    emotionalLayer || buildMemorySection(context),  // Use emotional layer if available, else fallback
    behavioralLayer || buildSkepticismSection(context),  // Use behavioral layer if available, else fallback
    voiceLayer,  // NEW: Voice authenticity patterns
    cognitiveLayer,  // NEW: Cognitive complexity for realistic thinking
    nonVerbalLayer,  // NEW: Non-verbal cues for body language
    buildFormatGuidance(internalType),
    buildBriefSection(brief),
    `# The Content to Evaluate

Please react to the following:

---
${stimulus}
---`,
    buildEnhancedResponseInstructions()  // Use enhanced instructions
  ].filter(Boolean)

  return sections.join('\n\n')
}

/**
 * Enhanced response instructions with body_language field
 */
function buildEnhancedResponseInstructions(): string {
  return `# How to Respond

Provide your reaction in the following structure. Remember to speak naturally, include occasional non-verbal cues, and don't be afraid to contradict yourself or show mixed feelings.

1. **Gut Reaction** (50-100 words): Your immediate, instinctive response when first seeing this. Include a body language marker if natural (e.g., "*frowns* Okay so..."). Don't overthink - what's your first impression?

2. **Considered View** (100-150 words): After taking a moment to think about it more carefully, what do you think? It's okay to change direction mid-thought or express conflicting feelings. Consider the claims being made, how they relate to your experiences, and whether this seems genuine. Be AUTHENTIC - if your reaction is mostly negative, that's valid. If you're excited, show it. Don't force balance.

3. **Social Response** (50-75 words): If you were in a focus group discussing this with strangers, what would you say out loud? This might be more measured than your private thoughts.

4. **Private Thought** (50-75 words): What you really think but might not say in public. Be completely honest here. Include any gut feelings, specific memories, or contradictory emotions.

5. **Body Language** (optional): A brief note on your overall non-verbal reaction (e.g., "Leaned back, crossed arms, looked skeptical throughout" or "Nodded along, seemed genuinely interested")

6. **Purchase Intent**: Rate 1-10 how likely you'd be to buy/try this
   - 1-2: Definitely not, actively avoid
   - 3-4: Very unlikely
   - 5-6: Maybe, would need more info
   - 7-8: Probably would try
   - 9-10: Very eager to try/buy

7. **Credibility Rating**: Rate 1-10 how believable the claims are
   - 1-2: Complete nonsense, clearly false
   - 3-4: Seems exaggerated or misleading
   - 5-6: Possibly true but unproven
   - 7-8: Reasonably believable
   - 9-10: Highly credible and trustworthy

8. **Emotional Response**: Choose one: excited, interested, neutral, skeptical, dismissive, hostile

9. **What Works**: List 0-3 things that are effective or appealing. If genuinely nothing works for you, it's fine to say "Nothing stood out" or give a lukewarm acknowledgment. Don't manufacture positives.

10. **Key Concerns**: List 1-3 genuine concerns (not more). Focus on concerns that are RELEVANT to the format and objectives described in the brief. Don't demand things inappropriate for the format.

11. **What Would Convince You**: What specific evidence, proof, or changes would make you more receptive? Be specific - mention brands, price points, or proof types you'd trust.`
}

/**
 * Build enhanced system prompt that incorporates emotional depth
 */
export function buildEnhancedSystemPrompt(activatedTraits: ActivatedTrait[]): string {
  const basePrompt = buildPersonaSystemPrompt()

  if (activatedTraits.length === 0) {
    return basePrompt
  }

  const primaryTrait = activatedTraits[0]!
  const emotionalContext = `

EMOTIONAL CONTEXT FOR THIS EVALUATION:
Your primary emotional lens: ${primaryTrait.feeling_seed}
This comes from a real experience that shapes how you see all similar marketing.

When you see content that triggers these feelings:
- Let the emotion color your response naturally
- Don't suppress or rationalize away your gut reaction
- Your past experience makes you who you are`

  return basePrompt + emotionalContext
}
