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
  purchase_intent: number       // 1-10 scale
  credibility_rating: number    // 1-10 scale
  emotional_response: 'excited' | 'interested' | 'neutral' | 'skeptical' | 'dismissive' | 'hostile'
  key_concerns: string[]        // Top 3 concerns about the concept
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

2. **Considered View** (100-150 words): After taking a moment to think about it more carefully, what do you think? Consider the claims being made, how they relate to your experiences, and whether this seems genuine.

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

8. **Key Concerns**: List your top 3 concerns or doubts about this concept

9. **What Would Convince You**: What specific evidence, proof, or changes would make you more receptive?`
}

/**
 * Build the complete persona response prompt
 */
export function buildPersonaResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  stimulusType: string = 'marketing concept'
): string {
  const sections = [
    buildIdentitySection(context),
    buildMemorySection(context),
    buildSkepticismSection(context),
    `# The ${stimulusType.charAt(0).toUpperCase() + stimulusType.slice(1)} to Evaluate

Please react to the following ${stimulusType}:

---
${stimulus}
---`,
    buildResponseInstructions()
  ]

  return sections.join('\n\n')
}

/**
 * Build the system prompt for persona response
 */
export function buildPersonaSystemPrompt(): string {
  return `You are an AI simulating a real consumer persona. Your role is to provide authentic, realistic reactions to marketing concepts based on the persona's demographics, psychographics, past experiences, and skepticism level.

Key guidelines:
- Stay in character throughout
- Let past experiences (phantom memories) influence your reactions
- Apply your skepticism level consistently
- Be specific and detailed in your concerns
- Your social response might differ from your private thoughts
- Base purchase intent and credibility on genuine assessment, not what the brand wants to hear
- Reference specific aspects of the stimulus in your response

Respond with a JSON object matching this exact structure:
{
  "gut_reaction": "string",
  "considered_view": "string",
  "social_response": "string",
  "private_thought": "string",
  "purchase_intent": number,
  "credibility_rating": number,
  "emotional_response": "excited" | "interested" | "neutral" | "skeptical" | "dismissive" | "hostile",
  "key_concerns": ["string", "string", "string"],
  "what_would_convince": "string"
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
    'key_concerns',
    'what_would_convince'
  ],
  properties: {
    gut_reaction: { type: 'string', minLength: 50 },
    considered_view: { type: 'string', minLength: 100 },
    social_response: { type: 'string', minLength: 50 },
    private_thought: { type: 'string', minLength: 50 },
    purchase_intent: { type: 'number', minimum: 1, maximum: 10 },
    credibility_rating: { type: 'number', minimum: 1, maximum: 10 },
    emotional_response: {
      type: 'string',
      enum: ['excited', 'interested', 'neutral', 'skeptical', 'dismissive', 'hostile']
    },
    key_concerns: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
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
    Array.isArray(r.key_concerns) &&
    typeof r.what_would_convince === 'string'
  )
}
