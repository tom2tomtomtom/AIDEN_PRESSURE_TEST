# Blueprint 04: Test Execution Engine

> Component: LLM Integration & Response Generation
> Status: 📋 Specification Complete
> Dependencies: Database (01), Auth (02), Persona Engine (03)

## Overview

The Test Execution Engine orchestrates the entire pressure test flow: building persona contexts, generating responses via Claude API, running group dynamics simulation, and producing aggregated analysis.

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION PIPELINE                          │
└─────────────────────────────────────────────────────────────────────┘

    POST /api/tests/[testId]/run
              │
              ▼
    ┌─────────────────┐
    │ 1. VALIDATION   │  Verify test exists, user has access
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 2. STATUS       │  Update status to 'running'
    │    UPDATE       │  Set started_at timestamp
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 3. BUILD        │  For each archetype in panel:
    │    CONTEXTS     │  - Load archetype
    │                 │  - Retrieve memories
    │                 │  - Build full context
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 4. GENERATE     │  Parallel LLM calls:
    │    RESPONSES    │  - Build persona prompt
    │    (Parallel)   │  - Call Claude API
    │                 │  - Parse JSON response
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 5. GROUP        │  If enabled:
    │    DYNAMICS     │  - Build group prompt
    │    (Optional)   │  - Simulate discussion
    │                 │  - Extract patterns
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 6. AGGREGATE    │  - Synthesize all responses
    │    ANALYSIS     │  - Calculate scores
    │                 │  - Generate recommendations
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ 7. STORE        │  - Insert test_results
    │    RESULTS      │  - Insert persona_responses
    │                 │  - Update test status
    └────────┬────────┘
             │
             ▼
        COMPLETE
```

## File Structure

```
lib/
├── anthropic/
│   ├── client.ts               # Claude API client wrapper
│   ├── config.ts               # API configuration
│   └── retry.ts                # Retry logic with backoff
│
├── prompts/
│   ├── persona-response.ts     # Persona response prompt builder
│   ├── group-dynamics.ts       # Group dynamics prompt builder
│   ├── aggregated-analysis.ts  # Analysis synthesis prompt
│   └── schemas/
│       ├── persona-response.ts # JSON schema for persona response
│       ├── group-dynamics.ts   # JSON schema for group dynamics
│       └── analysis.ts         # JSON schema for analysis
│
├── execution/
│   ├── index.ts                # Main execution orchestrator
│   ├── response-generator.ts   # Individual persona response
│   ├── group-simulator.ts      # Group dynamics simulation
│   ├── analyzer.ts             # Aggregated analysis
│   └── result-storage.ts       # Store results in database
│
app/
└── api/
    └── tests/
        └── [testId]/
            └── run/
                └── route.ts    # POST handler
```

## Claude API Client

```typescript
// lib/anthropic/client.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface LLMCallOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

const DEFAULT_OPTIONS: Required<LLMCallOptions> = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
  systemPrompt: ''
}

/**
 * Make a completion request to Claude
 */
export async function complete(
  prompt: string,
  options: LLMCallOptions = {}
): Promise<string> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: prompt }
  ]
  
  const response = await anthropic.messages.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: config.systemPrompt || undefined,
    messages
  })
  
  // Extract text content
  const textContent = response.content.find(c => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }
  
  return textContent.text
}

/**
 * Make a completion request expecting JSON response
 */
export async function completeJSON<T>(
  prompt: string,
  options: LLMCallOptions = {}
): Promise<T> {
  const response = await complete(prompt, {
    ...options,
    temperature: options.temperature ?? 0.3  // Lower for structured output
  })
  
  // Clean response - sometimes LLM adds markdown code blocks
  let cleaned = response.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  
  try {
    return JSON.parse(cleaned.trim()) as T
  } catch (error) {
    console.error('Failed to parse JSON response:', response)
    throw new Error(`Invalid JSON response: ${error}`)
  }
}

// Export client for direct access if needed
export { anthropic }
```

## Retry Logic

```typescript
// lib/anthropic/retry.ts

import { complete, completeJSON, LLMCallOptions } from './client'

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

const DEFAULT_RETRY: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelayMs * Math.pow(2, attempt)
  return Math.min(delay, options.maxDelayMs)
}

/**
 * Complete with retry logic
 */
export async function completeWithRetry(
  prompt: string,
  llmOptions: LLMCallOptions = {},
  retryOptions: RetryOptions = {}
): Promise<string> {
  const config = { ...DEFAULT_RETRY, ...retryOptions }
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await complete(prompt, llmOptions)
    } catch (error) {
      lastError = error as Error
      console.warn(`LLM call attempt ${attempt + 1} failed:`, error)
      
      if (attempt < config.maxRetries) {
        const delay = calculateDelay(attempt, config)
        console.log(`Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }
  
  throw new Error(`LLM call failed after ${config.maxRetries + 1} attempts: ${lastError?.message}`)
}

/**
 * Complete JSON with retry logic
 */
export async function completeJSONWithRetry<T>(
  prompt: string,
  llmOptions: LLMCallOptions = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY, ...retryOptions }
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await completeJSON<T>(prompt, llmOptions)
    } catch (error) {
      lastError = error as Error
      console.warn(`LLM JSON call attempt ${attempt + 1} failed:`, error)
      
      if (attempt < config.maxRetries) {
        const delay = calculateDelay(attempt, config)
        console.log(`Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }
  
  throw new Error(`LLM JSON call failed after ${config.maxRetries + 1} attempts: ${lastError?.message}`)
}
```

## Persona Response Prompt

```typescript
// lib/prompts/persona-response.ts

import type { PersonaContext } from '@/lib/persona/types'
import type { SkepticismCalibration } from '@/lib/persona/context-builder'

export interface PersonaResponseSchema {
  persona_name: string
  gut_reaction: string
  gut_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  considered_response: string
  considered_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  social_response: string
  private_thoughts: string
  purchase_intent: number
  action_threshold: string
  friction_points: string[]
  memory_influence_notes: string
  key_quotes: string[]
}

const SKEPTICISM_INSTRUCTIONS: Record<SkepticismCalibration, string> = {
  low: `Your default stance is open and receptive. You give brands the benefit of the doubt and are willing to believe claims without extensive proof. You're the type who tries new things based on interest alone.`,
  medium: `Your default stance is balanced but questioning. You're open to new products but expect reasonable evidence. Marketing language makes you curious rather than skeptical. You'll believe claims if they seem plausible.`,
  high: `Your default stance is "prove it". You've been disappointed before and now require evidence before believing claims. Marketing superlatives trigger immediate skepticism. Phrases like "clinically proven" or "natural" make you want to see the proof.`,
  extreme: `Your default stance is active distrust. You assume marketing is manipulation until proven otherwise. You look for the catch, the fine print, the hidden cost. Years of disappointing products have made you a cynic. Even genuine innovation needs to work hard to earn your consideration.`
}

/**
 * Build the full persona response prompt
 */
export function buildPersonaResponsePrompt(
  context: PersonaContext,
  stimulus: string,
  skepticismCalibration: SkepticismCalibration
): string {
  const { archetype, instanceName, memoryNarrative, skepticismLevel } = context
  
  return `You are simulating a consumer response. You are NOT an AI assistant - you are BECOMING this specific consumer persona with their accumulated life experiences, biases, and communication style.

## YOUR IDENTITY

**Name:** ${instanceName}
**Type:** ${archetype.name}
**Description:** ${archetype.description}

**Demographics:**
- Age range: ${archetype.demographics.ageRange}
- Lifestage: ${archetype.demographics.lifestage}
- Income: ${archetype.demographics.incomeBracket}

**Your Values:** ${archetype.psychographics.values.join(', ')}
**Your Inner Tensions:** ${archetype.psychographics.tensions.join(', ')}
**What You Aspire To:** ${archetype.psychographics.aspirations.join(', ')}
**How You Communicate:** ${archetype.communicationTone}

**Your Decision Style:** ${archetype.decisionStyle}
**Your Role in Groups:** ${archetype.influenceType}

## YOUR ACCUMULATED EXPERIENCES

These are REAL experiences you've had with ${context.category} products and marketing. They've shaped who you are as a consumer:

${memoryNarrative}

These memories are part of you. They influence how you react to new propositions - sometimes consciously, sometimes not.

## YOUR SKEPTICISM LEVEL

**Calibrated Level:** ${skepticismLevel}/10

${SKEPTICISM_INSTRUCTIONS[skepticismCalibration]}

## THE PROPOSITION YOU'RE BEING SHOWN

Read this as a consumer would - with your biases, your experiences, your hopes and suspicions:

---
${stimulus}
---

## YOUR RESPONSE TASK

React to this proposition AS this consumer. Generate responses in EACH of these tracks:

### 1. GUT REACTION (System 1)
What's your immediate, instinctive response? The first thing that pops into your head BEFORE you start analysing. Include the emotional tone. Be honest - this might be irrational.

### 2. CONSIDERED RESPONSE (System 2)
After a moment's thought, what do you actually think? Evaluate the claims, the positioning, the credibility. Where does it feel right? Where does it feel off?

### 3. SOCIAL RESPONSE
What would you tell friends or family if they asked about this? How would you describe it to others? (This might differ from what you actually think.)

### 4. PRIVATE THOUGHTS
What do you REALLY think that you might not say publicly? The honest internal monologue. The doubts you wouldn't voice in a focus group.

### 5. ACTION ASSESSMENT
- Purchase intent (1-10, where 1 is "definitely not" and 10 is "definitely would")
- What would need to change for you to act on this?
- What specific barriers stand in your way?

### 6. MEMORY INFLUENCE
Which of your past experiences does this trigger? How do those experiences affect your response to this specific proposition?

### 7. KEY QUOTES
Provide 2-3 verbatim things you would actually say about this - in your voice, with your phrasing.

## RESPONSE FORMAT

Return ONLY valid JSON matching this exact schema - no preamble, no explanation, just the JSON:

{
  "persona_name": "${instanceName}",
  "gut_reaction": "string - your immediate, unfiltered reaction",
  "gut_sentiment": "positive" | "negative" | "neutral" | "mixed",
  "considered_response": "string - your thoughtful evaluation",
  "considered_sentiment": "positive" | "negative" | "neutral" | "mixed",
  "social_response": "string - what you'd tell others",
  "private_thoughts": "string - your honest internal monologue",
  "purchase_intent": number (1-10),
  "action_threshold": "string - what would need to change",
  "friction_points": ["string - specific barrier 1", "specific barrier 2", ...],
  "memory_influence_notes": "string - how your experiences shaped this response",
  "key_quotes": ["verbatim quote 1", "verbatim quote 2", "verbatim quote 3"]
}

CRITICAL: You ARE this person. Their experiences are YOUR experiences. Their skepticism is YOUR skepticism. Respond authentically from INSIDE this persona, not as an AI evaluating them from outside.`
}
```

## Group Dynamics Prompt

```typescript
// lib/prompts/group-dynamics.ts

import type { PersonaResponseSchema } from './persona-response'

export interface GroupDynamicsSchema {
  discussion_flow: Array<{
    speaker: string
    statement: string
    impact: string
  }>
  influence_patterns: {
    primary_influencer: string
    followers: string[]
    contrarians: string[]
    dynamics_notes: string
  }
  opinion_shifts: Array<{
    participant: string
    initial_position: string
    final_position: string
    catalyst: string
  }>
  consensus_points: string[]
  contentious_points: string[]
  minority_report: {
    suppressed_views: string[]
    importance_assessment: string
  }
  emergent_insights: string[]
}

interface ParticipantSummary {
  name: string
  archetypeName: string
  influenceType: string
  initialSentiment: string
  keyQuote: string
  mainConcern: string
}

/**
 * Build participant summaries for group dynamics
 */
function buildParticipantSummaries(
  responses: Array<PersonaResponseSchema & { archetypeName: string; influenceType: string }>
): string {
  return responses.map((r, i) => `
**Participant ${i + 1}: ${r.persona_name}**
- Type: ${r.archetypeName}
- Role in groups: ${r.influenceType}
- Initial position: ${r.gut_sentiment}
- Main concern: ${r.friction_points[0] || 'None stated'}
- Would say: "${r.key_quotes[0] || r.gut_reaction.slice(0, 100)}..."
`).join('\n')
}

/**
 * Build the group dynamics simulation prompt
 */
export function buildGroupDynamicsPrompt(
  responses: Array<PersonaResponseSchema & { archetypeName: string; influenceType: string }>,
  stimulus: string
): string {
  const participantSummaries = buildParticipantSummaries(responses)
  
  return `You are simulating the dynamics of a focus group discussion.

## THE PROPOSITION BEING DISCUSSED

${stimulus}

## THE PARTICIPANTS

${participantSummaries}

## YOUR TASK

Simulate how this focus group discussion would naturally evolve. Consider the social dynamics, influence patterns, and how opinions form and shift in group settings.

### 1. DISCUSSION FLOW
Simulate key moments in the discussion:
- Who speaks first? (Leaders typically)
- How do others respond?
- What causes someone to change their position?
- What gets amplified? What gets suppressed?

### 2. INFLUENCE PATTERNS
Analyse the group dynamics:
- Who emerges as the primary influencer?
- Who follows the consensus?
- Who pushes back or plays contrarian?
- How does the group's opinion form?

### 3. OPINION SHIFTS
Track how positions change during discussion:
- Did anyone become more positive? Why?
- Did anyone become more negative? Why?
- What arguments caused shifts?

### 4. CONSENSUS AND CONTENTION
- What points does the group broadly agree on?
- What remains contentious or divided?
- Are there positions that got suppressed by social pressure?

### 5. MINORITY REPORT
IMPORTANT: Surface the important objections that might have been silenced by group dynamics:
- What valid concerns got dismissed too quickly?
- What did contrarians say that deserves attention?
- What would a dissenter think privately but not say?

### 6. EMERGENT INSIGHTS
What new understanding emerges from the group interaction that wasn't present in individual responses?

## RESPONSE FORMAT

Return ONLY valid JSON matching this exact schema:

{
  "discussion_flow": [
    {
      "speaker": "participant name",
      "statement": "what they said",
      "impact": "how the group responded"
    }
  ],
  "influence_patterns": {
    "primary_influencer": "name of most influential participant",
    "followers": ["names who followed the consensus"],
    "contrarians": ["names who pushed back"],
    "dynamics_notes": "narrative summary of group dynamics"
  },
  "opinion_shifts": [
    {
      "participant": "name",
      "initial_position": "where they started",
      "final_position": "where they ended",
      "catalyst": "what caused the shift"
    }
  ],
  "consensus_points": ["point the group agreed on 1", "point 2"],
  "contentious_points": ["point that remained divided 1", "point 2"],
  "minority_report": {
    "suppressed_views": ["important view that got dismissed"],
    "importance_assessment": "why these views matter despite being minority"
  },
  "emergent_insights": ["insight 1", "insight 2"]
}

Focus on realistic group dynamics - the way real focus groups actually work, with social pressure, conformity, and the occasional bold dissent.`
}
```

## Aggregated Analysis Prompt

```typescript
// lib/prompts/aggregated-analysis.ts

import type { PersonaResponseSchema } from './persona-response'
import type { GroupDynamicsSchema } from './group-dynamics'

export interface AggregatedAnalysisSchema {
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  key_weaknesses: Array<{
    weakness: string
    severity: 'high' | 'medium' | 'low'
    evidence: string
  }>
  credibility_gaps: Array<{
    claim: string
    issue: string
    fix_suggestion: string
  }>
  friction_points: Array<{
    barrier: string
    severity: number
    personas_affected: string[]
  }>
  competitive_vulnerabilities: Array<{
    vulnerability: string
    attack_angle: string
  }>
  minority_report: {
    suppressed_objections: string[]
    why_they_matter: string
  }
  recommended_refinements: Array<{
    recommendation: string
    addresses: string
    priority: 'high' | 'medium' | 'low'
  }>
}

/**
 * Build the aggregated analysis prompt
 */
export function buildAggregatedAnalysisPrompt(
  responses: PersonaResponseSchema[],
  groupDynamics: GroupDynamicsSchema | null,
  stimulus: string
): string {
  const responseSummary = responses.map(r => ({
    name: r.persona_name,
    gut: r.gut_sentiment,
    considered: r.considered_sentiment,
    intent: r.purchase_intent,
    frictions: r.friction_points,
    quote: r.key_quotes[0]
  }))
  
  return `You are a strategic research analyst synthesizing consumer feedback into actionable insights.

## THE PROPOSITION TESTED

${stimulus}

## INDIVIDUAL RESPONSES SUMMARY

${JSON.stringify(responseSummary, null, 2)}

## FULL PERSONA RESPONSES

${JSON.stringify(responses, null, 2)}

${groupDynamics ? `
## GROUP DYNAMICS ANALYSIS

${JSON.stringify(groupDynamics, null, 2)}
` : ''}

## YOUR ANALYSIS TASK

Synthesize all feedback into strategic analysis. Be direct, specific, and actionable.

### 1. PRESSURE SCORE (0-100)
Overall concept resilience - how well does it hold up under skeptical scrutiny?
- 0-30: Fundamentally flawed, major rework needed
- 31-50: Significant weaknesses, needs refinement
- 51-70: Solid foundation with addressable issues
- 71-85: Strong concept with minor optimizations
- 86-100: Exceptional resilience

### 2. GUT ATTRACTION INDEX (0-100)
Immediate appeal BEFORE rationalisation kicks in.
Based on gut_sentiment scores and gut_reactions.

### 3. CREDIBILITY SCORE (0-100)
How believable are the claims? Where do they exceed consumer tolerance?
Based on skeptical responses and credibility concerns raised.

### 4. KEY WEAKNESSES
Prioritised list of fundamental problems. Be specific.
Include evidence from specific persona responses.

### 5. CREDIBILITY GAPS
Claims that trigger disbelief. Map each to specific fix.

### 6. FRICTION POINTS
Barriers to action, ranked by severity (1-10).
Note which personas are affected by each.

### 7. COMPETITIVE VULNERABILITIES
How could competitors attack this positioning?
What weaknesses are most exploitable?

### 8. MINORITY REPORT
Important objections that might get dismissed but shouldn't.
Contrarian views that contain strategic value.

### 9. RECOMMENDED REFINEMENTS
Specific, actionable changes. Prioritise by impact.
Each recommendation should address a specific issue identified above.

## RESPONSE FORMAT

Return ONLY valid JSON:

{
  "pressure_score": number (0-100),
  "gut_attraction_index": number (0-100),
  "credibility_score": number (0-100),
  "key_weaknesses": [
    {
      "weakness": "specific problem",
      "severity": "high" | "medium" | "low",
      "evidence": "which personas said what"
    }
  ],
  "credibility_gaps": [
    {
      "claim": "the claim in question",
      "issue": "why it's not believed",
      "fix_suggestion": "how to address"
    }
  ],
  "friction_points": [
    {
      "barrier": "specific barrier",
      "severity": number (1-10),
      "personas_affected": ["persona names"]
    }
  ],
  "competitive_vulnerabilities": [
    {
      "vulnerability": "the weakness",
      "attack_angle": "how competitors could exploit"
    }
  ],
  "minority_report": {
    "suppressed_objections": ["objection 1", "objection 2"],
    "why_they_matter": "strategic importance of these views"
  },
  "recommended_refinements": [
    {
      "recommendation": "specific action",
      "addresses": "which weakness/gap this fixes",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Be strategic, be specific, be actionable. Every insight should help improve the proposition.`
}
```

## Test Execution Orchestrator

```typescript
// lib/execution/index.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { buildPanelContexts, type PersonaContext } from '@/lib/persona'
import { generatePersonaResponse } from './response-generator'
import { runGroupDynamics } from './group-simulator'
import { generateAggregatedAnalysis } from './analyzer'
import { storeResults } from './result-storage'
import type { Database } from '@/types/database'

type PressureTest = Database['public']['Tables']['pressure_tests']['Row']

export interface ExecutionResult {
  success: boolean
  resultId?: string
  error?: string
}

/**
 * Execute a complete pressure test
 */
export async function executePressureTest(testId: string): Promise<ExecutionResult> {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  // Load test
  const { data: test, error: testError } = await supabase
    .from('pressure_tests')
    .select(`
      *,
      project:projects(category)
    `)
    .eq('id', testId)
    .single()
  
  if (testError || !test) {
    return { success: false, error: 'Test not found' }
  }
  
  // Update status to running
  await supabase
    .from('pressure_tests')
    .update({ 
      status: 'running', 
      started_at: new Date().toISOString() 
    })
    .eq('id', testId)
  
  try {
    const panelConfig = test.panel_config as { archetypes: string[] }
    const category = test.project?.category || 'fmcg'
    
    // Build persona contexts
    console.log(`Building contexts for ${panelConfig.archetypes.length} personas...`)
    const contexts = await buildPanelContexts(
      panelConfig.archetypes,
      category,
      test.stimulus_content,
      test.skepticism_calibration as any
    )
    
    if (contexts.length === 0) {
      throw new Error('Failed to build any persona contexts')
    }
    
    // Generate responses in parallel
    console.log('Generating persona responses...')
    const responses = await Promise.all(
      contexts.map(context => 
        generatePersonaResponse(context, test.stimulus_content, test.skepticism_calibration as any)
      )
    )
    
    // Run group dynamics if enabled
    let groupDynamics = null
    if (test.include_group_dynamics) {
      console.log('Running group dynamics simulation...')
      groupDynamics = await runGroupDynamics(responses, contexts, test.stimulus_content)
    }
    
    // Generate aggregated analysis
    console.log('Generating aggregated analysis...')
    const analysis = await generateAggregatedAnalysis(
      responses,
      groupDynamics,
      test.stimulus_content
    )
    
    // Store results
    console.log('Storing results...')
    const resultId = await storeResults(
      supabase,
      testId,
      responses,
      contexts,
      analysis,
      groupDynamics
    )
    
    // Update status to completed
    await supabase
      .from('pressure_tests')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', testId)
    
    console.log(`Test ${testId} completed successfully`)
    return { success: true, resultId }
    
  } catch (error) {
    console.error(`Test ${testId} failed:`, error)
    
    // Update status to failed
    await supabase
      .from('pressure_tests')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', testId)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
```

## API Route Handler

```typescript
// app/api/tests/[testId]/run/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { executePressureTest } from '@/lib/execution'

export async function POST(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Check auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }
  
  // Verify test exists and user has access
  const { data: test, error: testError } = await supabase
    .from('pressure_tests')
    .select(`
      id,
      status,
      project:projects!inner(
        organization_id
      )
    `)
    .eq('id', params.testId)
    .single()
  
  if (testError || !test) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Test not found' } },
      { status: 404 }
    )
  }
  
  // Check test isn't already running or completed
  if (test.status === 'running') {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Test is already running' } },
      { status: 409 }
    )
  }
  
  if (test.status === 'completed') {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Test has already completed' } },
      { status: 409 }
    )
  }
  
  // Execute test (this could be moved to a background job for long-running tests)
  const result = await executePressureTest(params.testId)
  
  if (!result.success) {
    return NextResponse.json(
      { error: { code: 'EXECUTION_FAILED', message: result.error } },
      { status: 500 }
    )
  }
  
  return NextResponse.json({
    data: {
      testId: params.testId,
      resultId: result.resultId,
      status: 'completed'
    }
  })
}
```

## Testing Checklist

- [ ] Claude API client connects successfully
- [ ] Retry logic handles transient failures
- [ ] Persona response prompt generates valid JSON
- [ ] Responses show variety across archetypes
- [ ] Responses reflect activated memories
- [ ] Skepticism calibration affects response tone
- [ ] Group dynamics prompt generates valid JSON
- [ ] Group dynamics show realistic influence patterns
- [ ] Aggregated analysis produces actionable insights
- [ ] Results stored correctly in database
- [ ] Test status transitions correctly
- [ ] Error handling marks tests as failed
- [ ] Full execution completes in < 60 seconds (6 personas)
