/**
 * Brief Analyzer
 * Analyzes creative briefs to understand tone, intent, and potential misinterpretation risks
 * This enables the AI moderator to provide context when personas respond too literally
 */

import { completeJSON, TEMPERATURES } from '@/lib/anthropic/client'

/**
 * Types of creative tone that might be misinterpreted
 */
export type ToneIntent =
  | 'serious'
  | 'humorous'
  | 'ironic'
  | 'provocative'
  | 'self-deprecating'
  | 'playful'
  | 'aspirational'
  | 'nostalgic'
  | 'urgent'
  | 'conversational'

/**
 * Creative devices used in the stimulus that need context
 */
export type CreativeDevice =
  | 'anti-marketing'
  | 'self-aware-humor'
  | 'exaggeration'
  | 'understatement'
  | 'irony'
  | 'parody'
  | 'satire'
  | 'absurdist'
  | 'breaking-fourth-wall'
  | 'reverse-psychology'
  | 'meta-commentary'
  | 'tongue-in-cheek'

/**
 * Red flags that indicate a response might be too literal
 */
export interface LiteralInterpretationRedFlag {
  pattern: string           // What to look for in responses
  explanation: string       // Why this is a red flag
  clarificationProbe: string // What the moderator should say
}

/**
 * Complete brief analysis output
 */
export interface BriefAnalysis {
  // Core intent
  primaryTone: ToneIntent
  secondaryTones: ToneIntent[]

  // Creative approach
  creativeDevices: CreativeDevice[]
  deviceExplanations: Record<CreativeDevice, string>

  // Interpretation guidance
  intendedInterpretation: string     // How the brief SHOULD be read
  literalMisreading: string          // How it might be read too literally

  // Red flags to watch for in responses
  redFlags: LiteralInterpretationRedFlag[]

  // Moderator guidance
  contextStatement: string           // What moderator can say to provide context
  clarificationProbes: string[]      // Follow-up questions if literal interpretation detected

  // Should moderation happen?
  moderationNeeded: boolean          // True if creative devices require explanation
  moderationPriority: 'high' | 'medium' | 'low'

  // Analysis metadata
  confidence: number                 // 0-1 confidence in analysis
}

/**
 * Schema for JSON validation
 */
export const BRIEF_ANALYSIS_SCHEMA = {
  type: 'object',
  required: [
    'primaryTone',
    'secondaryTones',
    'creativeDevices',
    'deviceExplanations',
    'intendedInterpretation',
    'literalMisreading',
    'redFlags',
    'contextStatement',
    'clarificationProbes',
    'moderationNeeded',
    'moderationPriority',
    'confidence'
  ],
  properties: {
    primaryTone: { type: 'string' },
    secondaryTones: { type: 'array', items: { type: 'string' } },
    creativeDevices: { type: 'array', items: { type: 'string' } },
    deviceExplanations: { type: 'object' },
    intendedInterpretation: { type: 'string' },
    literalMisreading: { type: 'string' },
    redFlags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern: { type: 'string' },
          explanation: { type: 'string' },
          clarificationProbe: { type: 'string' }
        }
      }
    },
    contextStatement: { type: 'string' },
    clarificationProbes: { type: 'array', items: { type: 'string' } },
    moderationNeeded: { type: 'boolean' },
    moderationPriority: { type: 'string', enum: ['high', 'medium', 'low'] },
    confidence: { type: 'number' }
  }
} as const

/**
 * Build the system prompt for brief analysis
 */
function buildBriefAnalysisSystemPrompt(): string {
  return `You are an expert qualitative research moderator and creative strategist. Your role is to analyze creative briefs and marketing stimuli to understand:

1. The INTENDED tone and creative approach
2. Creative devices being used (irony, humor, self-awareness, etc.)
3. How the content might be misinterpreted if taken too literally
4. What context a focus group moderator should provide

CRITICAL: Many creative approaches are intentionally unconventional:
- "Anti-marketing" humor acknowledges advertising itself
- Self-deprecating brands poke fun at their own category
- Ironic tones say one thing meaning another
- Meta-commentary breaks the fourth wall

When consumers see these WITHOUT context, they often:
- Take the content literally ("this says anti-marketing but it's marketing - contradiction!")
- Miss the self-aware humor
- Judge the execution rather than engaging with the concept

Your job is to identify when this might happen and prepare moderator interventions.

Respond with valid JSON only.`
}

/**
 * Build the analysis prompt
 */
function buildBriefAnalysisPrompt(stimulus: string, brief?: string, stimulusType?: string): string {
  const sections = []

  if (brief) {
    sections.push(`# Creative Brief / Context
${brief}`)
  }

  sections.push(`# The Stimulus (${stimulusType || 'marketing content'})
${stimulus}`)

  sections.push(`# Analysis Required

Analyze this creative content and provide:

1. **Tone Analysis**
   - What is the PRIMARY tone intent? (serious/humorous/ironic/provocative/self-deprecating/playful/aspirational/nostalgic/urgent/conversational)
   - Are there secondary tones layered in?

2. **Creative Devices**
   - Identify any creative devices used: anti-marketing, self-aware-humor, exaggeration, understatement, irony, parody, satire, absurdist, breaking-fourth-wall, reverse-psychology, meta-commentary, tongue-in-cheek
   - For each device found, explain how it's being used

3. **Interpretation Gap**
   - How is this INTENDED to be read by the target audience?
   - How might someone read it TOO LITERALLY and miss the point?

4. **Red Flags to Monitor**
   - What specific things might consumers say that indicate literal misinterpretation?
   - For each red flag, provide a non-leading clarification probe

5. **Moderator Guidance**
   - Craft a context statement the moderator can use ("I hear you, but the creative team intended this as...")
   - List 2-3 probing questions to deepen understanding after providing context

6. **Moderation Priority**
   - Is moderation needed? (Some content is straightforward and doesn't need intervention)
   - If needed, is it high/medium/low priority?

Return your analysis as JSON matching this structure:
{
  "primaryTone": "string",
  "secondaryTones": ["string"],
  "creativeDevices": ["string"],
  "deviceExplanations": { "device": "explanation" },
  "intendedInterpretation": "string",
  "literalMisreading": "string",
  "redFlags": [
    {
      "pattern": "what to look for in responses",
      "explanation": "why this indicates literal reading",
      "clarificationProbe": "what moderator asks"
    }
  ],
  "contextStatement": "what moderator says to provide context",
  "clarificationProbes": ["follow-up question 1", "follow-up question 2"],
  "moderationNeeded": true/false,
  "moderationPriority": "high/medium/low",
  "confidence": 0.0-1.0
}`)

  return sections.join('\n\n')
}

/**
 * Validate brief analysis response
 */
export function validateBriefAnalysis(response: unknown): response is BriefAnalysis {
  if (!response || typeof response !== 'object') return false

  const r = response as Record<string, unknown>

  return (
    typeof r.primaryTone === 'string' &&
    Array.isArray(r.secondaryTones) &&
    Array.isArray(r.creativeDevices) &&
    typeof r.deviceExplanations === 'object' &&
    typeof r.intendedInterpretation === 'string' &&
    typeof r.literalMisreading === 'string' &&
    Array.isArray(r.redFlags) &&
    typeof r.contextStatement === 'string' &&
    Array.isArray(r.clarificationProbes) &&
    typeof r.moderationNeeded === 'boolean' &&
    ['high', 'medium', 'low'].includes(r.moderationPriority as string) &&
    typeof r.confidence === 'number'
  )
}

/**
 * Analyze a brief/stimulus to understand creative intent
 */
export async function analyzeBrief(
  stimulus: string,
  brief?: string,
  stimulusType?: string
): Promise<{
  analysis: BriefAnalysis
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
}> {
  const prompt = buildBriefAnalysisPrompt(stimulus, brief, stimulusType)
  const systemPrompt = buildBriefAnalysisSystemPrompt()

  const result = await completeJSON<BriefAnalysis>(prompt, {
    system: systemPrompt,
    temperature: TEMPERATURES.aggregatedAnalysis, // Lower temperature for analytical task
    maxTokens: 2000
  })

  if (!validateBriefAnalysis(result.parsed)) {
    throw new Error('Invalid brief analysis format')
  }

  return {
    analysis: result.parsed,
    usage: result.usage
  }
}

/**
 * Check if a persona response shows signs of literal misinterpretation
 */
export function detectLiteralInterpretation(
  response: string,
  analysis: BriefAnalysis
): {
  isLiteral: boolean
  triggeredFlags: LiteralInterpretationRedFlag[]
  suggestedProbe: string | null
} {
  const triggeredFlags: LiteralInterpretationRedFlag[] = []
  const responseLower = response.toLowerCase()

  for (const flag of analysis.redFlags) {
    // Check if the response contains patterns suggesting literal interpretation
    const patternLower = flag.pattern.toLowerCase()

    // Simple pattern matching - could be enhanced with semantic similarity
    if (
      responseLower.includes(patternLower) ||
      containsSimilarConcept(responseLower, patternLower)
    ) {
      triggeredFlags.push(flag)
    }
  }

  const isLiteral = triggeredFlags.length > 0

  // Select the most relevant probe
  const suggestedProbe = isLiteral
    ? triggeredFlags[0]?.clarificationProbe || analysis.clarificationProbes[0] || null
    : null

  return {
    isLiteral,
    triggeredFlags,
    suggestedProbe
  }
}

/**
 * Simple concept similarity check
 * Could be enhanced with embeddings for semantic matching
 */
function containsSimilarConcept(text: string, pattern: string): boolean {
  // Common literal interpretation keywords
  const literalIndicators = [
    'contradiction',
    'contradicts',
    'doesn\'t make sense',
    'confusing',
    'confused',
    'why would',
    'but it\'s still',
    'ironic that',
    'hypocritical',
    'mixed message',
    'can\'t be both',
    'either... or',
    'which is it'
  ]

  // Check for common indicators
  for (const indicator of literalIndicators) {
    if (text.includes(indicator) && pattern.includes('literal')) {
      return true
    }
  }

  // Check for specific pattern words
  const patternWords = pattern.split(/\s+/).filter(w => w.length > 4)
  const matchedWords = patternWords.filter(word => text.includes(word))

  return matchedWords.length >= Math.ceil(patternWords.length * 0.5)
}

/**
 * Generate a moderation-needed summary for display
 */
export function summarizeModerationNeeds(analysis: BriefAnalysis): string {
  if (!analysis.moderationNeeded) {
    return 'This content is straightforward and unlikely to need moderator intervention.'
  }

  const devices = analysis.creativeDevices.join(', ')
  const flagCount = analysis.redFlags.length

  return `This content uses ${devices}. Watch for ${flagCount} potential misinterpretation pattern${flagCount !== 1 ? 's' : ''}. Priority: ${analysis.moderationPriority}.`
}
