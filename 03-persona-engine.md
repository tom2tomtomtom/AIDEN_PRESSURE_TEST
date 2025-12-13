# Blueprint 03: Persona Engine

> Component: Phantom Consumer Memory System
> Status: 📋 Specification Complete
> Dependencies: Database (01), Auth (02)

## Overview

The Persona Engine is the core innovation of Phantom Pressure Test. It implements the "Phantom Consumer Memory™" system that gives synthetic personas accumulated category experiences, making their responses more realistic and skepticism-appropriate than demographic-only approaches.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PERSONA ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  ARCHETYPE      │    │  MEMORY BANK    │                     │
│  │  LOADER         │    │  SELECTOR       │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           ▼                      ▼                               │
│  ┌─────────────────────────────────────────┐                    │
│  │         MEMORY RETRIEVAL ENGINE         │                    │
│  │  ┌───────────┐  ┌───────────────────┐  │                    │
│  │  │ Keyword   │  │  Relevance        │  │                    │
│  │  │ Matcher   │  │  Scorer           │  │                    │
│  │  └───────────┘  └───────────────────┘  │                    │
│  └─────────────────────────────────────────┘                    │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │      PERSONA CONTEXT BUILDER            │                    │
│  │  - Demographics + Psychographics        │                    │
│  │  - Activated Memories                   │                    │
│  │  - Skepticism Calibration               │                    │
│  └─────────────────────────────────────────┘                    │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │      RESPONSE GENERATOR (LLM)           │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
lib/
├── persona/
│   ├── index.ts                    # Public exports
│   ├── types.ts                    # Persona-specific types
│   ├── archetype-loader.ts         # Load archetype from DB
│   ├── memory-retrieval.ts         # Memory matching & retrieval
│   ├── context-builder.ts          # Build full persona context
│   └── name-generator.ts           # Generate realistic persona names
│
├── prompts/
│   ├── persona-response.ts         # Main persona prompt builder
│   └── templates/
│       ├── system-persona.ts       # System message template
│       └── response-schema.ts      # JSON output schema
```

## Types Definition

```typescript
// lib/persona/types.ts

import type { Database } from '@/types/database'

// Database row types
export type PersonaArchetypeRow = Database['public']['Tables']['persona_archetypes']['Row']
export type PhantomMemoryRow = Database['public']['Tables']['phantom_memories']['Row']
export type MemoryBankRow = Database['public']['Tables']['memory_banks']['Row']

// Domain types
export interface PersonaArchetype {
  id: string
  name: string
  slug: string
  description: string
  
  // Demographics
  demographics: {
    ageRange: string
    gender: string
    lifestage: string
    incomeBracket: string
  }
  
  // Psychographics
  psychographics: {
    values: string[]
    tensions: string[]
    aspirations: string[]
    communicationStyle: string
  }
  
  // Behavioral
  skepticismBaseline: number  // 1-10
  influenceType: 'leader' | 'follower' | 'contrarian' | 'observer'
  decisionStyle: 'impulsive' | 'considered' | 'research_heavy' | 'social_proof'
  communicationTone: string
}

export interface PhantomMemory {
  id: string
  archetypeId: string
  memoryBankId: string
  
  memoryType: 'betrayal' | 'delight' | 'disappointment' | 'price_shock' | 'trust_erosion' | 'competitive_experience' | 'category_fatigue'
  memoryTitle: string
  memoryContent: string
  emotionalResidue: 'anger' | 'skepticism' | 'indifference' | 'loyalty' | 'hope' | 'frustration' | 'satisfaction'
  
  recencyWeight: number      // 0-2
  emotionalIntensity: number // 1-10
  triggerKeywords: string[]
  triggerClaimTypes: string[]
  trustModifier: number      // -5 to +5
}

export interface MemoryMatchResult {
  memory: PhantomMemory
  matchScore: number
  matchedKeywords: string[]
  matchedClaimTypes: string[]
}

export interface PersonaContext {
  archetype: PersonaArchetype
  instanceName: string
  activatedMemories: PhantomMemory[]
  memoryNarrative: string
  skepticismLevel: number  // Calibrated level
  category: string
}

export interface PersonaResponse {
  personaName: string
  archetypeId: string
  personaContext: PersonaContext
  
  // Dual-track responses
  gutReaction: string
  gutSentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  
  consideredResponse: string
  consideredSentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  
  socialResponse: string
  privateThoughts: string
  
  // Action assessment
  purchaseIntent: number  // 1-10
  actionThreshold: string
  frictionPoints: string[]
  
  // Memory influence
  triggeredMemoryIds: string[]
  memoryInfluenceNotes: string
  
  // Key quotes
  keyQuotes: string[]
}
```

## Archetype Loader

```typescript
// lib/persona/archetype-loader.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { PersonaArchetype, PersonaArchetypeRow } from './types'

/**
 * Transform database row to domain type
 */
function transformArchetype(row: PersonaArchetypeRow): PersonaArchetype {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    demographics: {
      ageRange: row.age_range,
      gender: row.gender,
      lifestage: row.lifestage,
      incomeBracket: row.income_bracket
    },
    psychographics: row.psychographics as PersonaArchetype['psychographics'],
    skepticismBaseline: row.skepticism_baseline,
    influenceType: row.influence_type as PersonaArchetype['influenceType'],
    decisionStyle: row.decision_style as PersonaArchetype['decisionStyle'],
    communicationTone: row.communication_tone
  }
}

/**
 * Load a single archetype by ID
 */
export async function loadArchetype(archetypeId: string): Promise<PersonaArchetype | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .eq('id', archetypeId)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  return transformArchetype(data)
}

/**
 * Load multiple archetypes by IDs
 */
export async function loadArchetypes(archetypeIds: string[]): Promise<PersonaArchetype[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .in('id', archetypeIds)
    .eq('is_active', true)
  
  if (error || !data) return []
  return data.map(transformArchetype)
}

/**
 * Load all active archetypes
 */
export async function loadAllArchetypes(): Promise<PersonaArchetype[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error || !data) return []
  return data.map(transformArchetype)
}
```

## Memory Retrieval Engine

```typescript
// lib/persona/memory-retrieval.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { PhantomMemory, MemoryMatchResult, PhantomMemoryRow } from './types'

/**
 * Transform database row to domain type
 */
function transformMemory(row: PhantomMemoryRow): PhantomMemory {
  return {
    id: row.id,
    archetypeId: row.archetype_id,
    memoryBankId: row.memory_bank_id,
    memoryType: row.memory_type as PhantomMemory['memoryType'],
    memoryTitle: row.memory_title,
    memoryContent: row.memory_content,
    emotionalResidue: row.emotional_residue as PhantomMemory['emotionalResidue'],
    recencyWeight: Number(row.recency_weight),
    emotionalIntensity: row.emotional_intensity,
    triggerKeywords: row.trigger_keywords || [],
    triggerClaimTypes: row.trigger_claim_types || [],
    trustModifier: row.trust_modifier
  }
}

/**
 * Extract keywords from stimulus for matching
 */
function extractStimulusKeywords(stimulus: string): string[] {
  // Normalize and tokenize
  const normalized = stimulus.toLowerCase()
  
  // Remove common words and punctuation
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'our', 'your', 'we',
    'you', 'they', 'them', 'this', 'that', 'these', 'those', 'with', 'for',
    'from', 'into', 'to', 'of', 'in', 'on', 'by', 'at', 'as'
  ])
  
  const words = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // Extract bigrams for compound terms
  const bigrams: string[] = []
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`)
  }
  
  return [...new Set([...words, ...bigrams])]
}

/**
 * Detect claim types in stimulus
 */
function detectClaimTypes(stimulus: string): string[] {
  const normalized = stimulus.toLowerCase()
  const claimTypes: string[] = []
  
  const claimPatterns: Record<string, RegExp[]> = {
    natural: [/natural/i, /organic/i, /clean/i, /pure/i, /real/i],
    clinical: [/clinical/i, /proven/i, /tested/i, /dermatologist/i, /scientifically/i],
    value: [/value/i, /affordable/i, /save/i, /budget/i, /worth/i],
    premium: [/premium/i, /luxury/i, /exclusive/i, /finest/i, /best/i],
    innovation: [/new/i, /innovative/i, /revolutionary/i, /breakthrough/i, /first/i],
    trust: [/trust/i, /reliable/i, /guaranteed/i, /authentic/i, /genuine/i],
    health: [/healthy/i, /wellness/i, /nutritious/i, /good for you/i, /benefit/i],
    sustainability: [/sustainable/i, /eco/i, /green/i, /environment/i, /recycle/i]
  }
  
  for (const [claimType, patterns] of Object.entries(claimPatterns)) {
    if (patterns.some(pattern => pattern.test(normalized))) {
      claimTypes.push(claimType)
    }
  }
  
  return claimTypes
}

/**
 * Calculate match score for a memory against stimulus
 */
function calculateMatchScore(
  memory: PhantomMemory,
  stimulusKeywords: string[],
  stimulusClaimTypes: string[]
): MemoryMatchResult {
  let score = 0
  const matchedKeywords: string[] = []
  const matchedClaimTypes: string[] = []
  
  // Keyword matching (primary factor)
  for (const keyword of stimulusKeywords) {
    for (const trigger of memory.triggerKeywords) {
      const triggerLower = trigger.toLowerCase()
      const keywordLower = keyword.toLowerCase()
      
      if (triggerLower === keywordLower) {
        score += 3  // Exact match
        matchedKeywords.push(trigger)
      } else if (triggerLower.includes(keywordLower) || keywordLower.includes(triggerLower)) {
        score += 1  // Partial match
        matchedKeywords.push(trigger)
      }
    }
  }
  
  // Claim type matching (secondary factor)
  for (const claimType of stimulusClaimTypes) {
    if (memory.triggerClaimTypes.includes(claimType)) {
      score += 2
      matchedClaimTypes.push(claimType)
    }
  }
  
  // Apply modifiers
  score *= memory.recencyWeight
  score *= (memory.emotionalIntensity / 5)  // Normalize to ~2x range
  
  return {
    memory,
    matchScore: score,
    matchedKeywords: [...new Set(matchedKeywords)],
    matchedClaimTypes: [...new Set(matchedClaimTypes)]
  }
}

/**
 * Retrieve relevant memories for an archetype given a stimulus
 */
export async function retrieveRelevantMemories(
  archetypeId: string,
  category: string,
  stimulus: string,
  maxMemories: number = 5
): Promise<MemoryMatchResult[]> {
  const supabase = createServerComponentClient({ cookies })
  
  // Get memory bank for category
  const { data: memoryBank } = await supabase
    .from('memory_banks')
    .select('id')
    .eq('category', category)
    .eq('is_active', true)
    .single()
  
  if (!memoryBank) {
    console.warn(`No memory bank found for category: ${category}`)
    return []
  }
  
  // Get all memories for archetype in this memory bank
  const { data: memoriesData, error } = await supabase
    .from('phantom_memories')
    .select('*')
    .eq('archetype_id', archetypeId)
    .eq('memory_bank_id', memoryBank.id)
    .eq('is_active', true)
  
  if (error || !memoriesData) {
    console.error('Failed to retrieve memories:', error)
    return []
  }
  
  const memories = memoriesData.map(transformMemory)
  
  // Extract stimulus features
  const stimulusKeywords = extractStimulusKeywords(stimulus)
  const stimulusClaimTypes = detectClaimTypes(stimulus)
  
  // Score all memories
  const scoredMemories = memories.map(memory => 
    calculateMatchScore(memory, stimulusKeywords, stimulusClaimTypes)
  )
  
  // Sort by score and take top N
  const topMemories = scoredMemories
    .filter(result => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxMemories)
  
  // If not enough triggered memories, include some baseline memories
  if (topMemories.length < maxMemories) {
    const baselineMemories = scoredMemories
      .filter(result => result.matchScore === 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, maxMemories - topMemories.length)
    
    topMemories.push(...baselineMemories)
  }
  
  return topMemories
}

/**
 * Build memory narrative from matched memories
 */
export function buildMemoryNarrative(matchedMemories: MemoryMatchResult[]): string {
  if (matchedMemories.length === 0) {
    return "You have general category experience but no specific recent memories triggered."
  }
  
  const narratives = matchedMemories.map(({ memory, matchedKeywords }) => {
    const triggerNote = matchedKeywords.length > 0 
      ? ` (triggered by: ${matchedKeywords.join(', ')})`
      : ''
    
    return `- ${memory.memoryContent} [Emotional residue: ${memory.emotionalResidue}]${triggerNote}`
  })
  
  return narratives.join('\n')
}
```

## Persona Context Builder

```typescript
// lib/persona/context-builder.ts

import type { 
  PersonaArchetype, 
  PersonaContext, 
  MemoryMatchResult 
} from './types'
import { loadArchetype } from './archetype-loader'
import { retrieveRelevantMemories, buildMemoryNarrative } from './memory-retrieval'
import { generatePersonaName } from './name-generator'

export type SkepticismCalibration = 'low' | 'medium' | 'high' | 'extreme'

/**
 * Calculate calibrated skepticism level
 */
function calibrateSkepticism(
  baselineLevel: number,
  calibration: SkepticismCalibration,
  memoryMatches: MemoryMatchResult[]
): number {
  // Start with baseline
  let level = baselineLevel
  
  // Apply calibration modifier
  const calibrationModifiers: Record<SkepticismCalibration, number> = {
    low: -2,
    medium: 0,
    high: +1,
    extreme: +3
  }
  level += calibrationModifiers[calibration]
  
  // Apply memory-based modifiers
  for (const { memory } of memoryMatches) {
    level += (memory.trustModifier * -0.2)  // Negative trust = more skepticism
  }
  
  // Clamp to valid range
  return Math.max(1, Math.min(10, Math.round(level)))
}

/**
 * Build complete persona context for response generation
 */
export async function buildPersonaContext(
  archetypeId: string,
  category: string,
  stimulus: string,
  skepticismCalibration: SkepticismCalibration = 'high'
): Promise<PersonaContext | null> {
  // Load archetype
  const archetype = await loadArchetype(archetypeId)
  if (!archetype) {
    console.error(`Archetype not found: ${archetypeId}`)
    return null
  }
  
  // Retrieve relevant memories
  const memoryMatches = await retrieveRelevantMemories(
    archetypeId,
    category,
    stimulus,
    5  // Max memories
  )
  
  // Build memory narrative
  const memoryNarrative = buildMemoryNarrative(memoryMatches)
  
  // Calculate calibrated skepticism
  const skepticismLevel = calibrateSkepticism(
    archetype.skepticismBaseline,
    skepticismCalibration,
    memoryMatches
  )
  
  // Generate instance name
  const instanceName = generatePersonaName(archetype)
  
  return {
    archetype,
    instanceName,
    activatedMemories: memoryMatches.map(m => m.memory),
    memoryNarrative,
    skepticismLevel,
    category
  }
}

/**
 * Build multiple persona contexts for a panel
 */
export async function buildPanelContexts(
  archetypeIds: string[],
  category: string,
  stimulus: string,
  skepticismCalibration: SkepticismCalibration = 'high'
): Promise<PersonaContext[]> {
  const contexts = await Promise.all(
    archetypeIds.map(id => 
      buildPersonaContext(id, category, stimulus, skepticismCalibration)
    )
  )
  
  return contexts.filter((ctx): ctx is PersonaContext => ctx !== null)
}
```

## Name Generator

```typescript
// lib/persona/name-generator.ts

import type { PersonaArchetype } from './types'

// Name pools by demographic segments
const FIRST_NAMES = {
  female: {
    'early-career': ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia'],
    'established': ['Sarah', 'Jennifer', 'Rachel', 'Lauren', 'Michelle', 'Emily', 'Amanda', 'Stephanie'],
    'senior': ['Susan', 'Karen', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Margaret', 'Nancy']
  },
  male: {
    'early-career': ['Liam', 'Noah', 'Oliver', 'James', 'Lucas', 'Mason', 'Ethan', 'Alexander'],
    'established': ['Michael', 'David', 'James', 'Robert', 'John', 'Daniel', 'Matthew', 'Christopher'],
    'senior': ['Richard', 'Thomas', 'Charles', 'William', 'George', 'Kenneth', 'Steven', 'Edward']
  }
}

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPRSTUVW'

/**
 * Map age range to life stage
 */
function ageRangeToLifestage(ageRange: string): 'early-career' | 'established' | 'senior' {
  const [minAge] = ageRange.split('-').map(s => parseInt(s.trim()))
  
  if (minAge < 30) return 'early-career'
  if (minAge < 50) return 'established'
  return 'senior'
}

/**
 * Generate a realistic persona name based on archetype demographics
 */
export function generatePersonaName(archetype: PersonaArchetype): string {
  const { demographics } = archetype
  
  // Determine gender pool
  const genderPool = demographics.gender === 'any' 
    ? Math.random() > 0.5 ? 'female' : 'male'
    : demographics.gender as 'female' | 'male'
  
  // Determine life stage
  const lifestage = ageRangeToLifestage(demographics.ageRange)
  
  // Pick random first name
  const firstNames = FIRST_NAMES[genderPool][lifestage]
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  
  // Pick random last initial
  const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)]
  
  // Generate age within range
  const [minAge, maxAge] = demographics.ageRange.split('-').map(s => parseInt(s.trim()))
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge
  
  return `${firstName} ${lastInitial}. (${age})`
}
```

## Public Exports

```typescript
// lib/persona/index.ts

export * from './types'
export { loadArchetype, loadArchetypes, loadAllArchetypes } from './archetype-loader'
export { retrieveRelevantMemories, buildMemoryNarrative } from './memory-retrieval'
export { buildPersonaContext, buildPanelContexts } from './context-builder'
export { generatePersonaName } from './name-generator'
```

## Sample Phantom Memories (FMCG - Skeptical Switcher)

```sql
-- Betrayal memories
INSERT INTO phantom_memories (archetype_id, memory_bank_id, memory_type, memory_title, memory_content, emotional_residue, emotional_intensity, trigger_keywords, trigger_claim_types, trust_modifier) VALUES
(
  (SELECT id FROM persona_archetypes WHERE slug = 'skeptical-switcher'),
  (SELECT id FROM memory_banks WHERE category = 'fmcg'),
  'betrayal',
  'The yoghurt reformulation',
  'My favourite yoghurt brand quietly changed their recipe. Same packaging, same price, but the taste was completely different. They never announced it. I only noticed when it stopped tasting right. Felt like they thought I wouldnt notice or wouldnt care.',
  'anger',
  8,
  ARRAY['yoghurt', 'recipe', 'taste', 'favourite', 'changed', 'reformulated', 'new improved'],
  ARRAY['natural', 'premium'],
  -3
),
(
  (SELECT id FROM persona_archetypes WHERE slug = 'skeptical-switcher'),
  (SELECT id FROM memory_banks WHERE category = 'fmcg'),
  'betrayal',
  'The shrinking cereal box',
  'My cereal went from 500g to 400g but the box stayed the same size with more air at the top. They actually redesigned the box to hide less product. The audacity of thinking customers wouldnt notice. Now I check weights on everything.',
  'frustration',
  7,
  ARRAY['cereal', 'size', 'weight', 'packaging', 'shrinkflation', 'family size', 'value'],
  ARRAY['value'],
  -2
),
(
  (SELECT id FROM persona_archetypes WHERE slug = 'skeptical-switcher'),
  (SELECT id FROM memory_banks WHERE category = 'fmcg'),
  'trust_erosion',
  'The "natural" ingredients lie',
  'Bought a "natural" cleaning product because it said "plant-based" everywhere. Then I actually read the ingredients - full of synthetic chemicals with one token plant extract. The greenwashing is exhausting.',
  'skepticism',
  9,
  ARRAY['natural', 'plant', 'organic', 'eco', 'green', 'clean', 'ingredients', 'chemical-free'],
  ARRAY['natural', 'sustainability'],
  -4
),
(
  (SELECT id FROM persona_archetypes WHERE slug = 'skeptical-switcher'),
  (SELECT id FROM memory_banks WHERE category = 'fmcg'),
  'price_shock',
  'The subscription trap',
  'Signed up for a subscription for household goods because they promised 20% savings. After 6 months the prices quietly crept up until I was paying MORE than retail. Took me three months to notice. Never again.',
  'anger',
  8,
  ARRAY['subscription', 'savings', 'discount', 'members', 'loyalty', 'exclusive', 'deal'],
  ARRAY['value'],
  -3
),
(
  (SELECT id FROM persona_archetypes WHERE slug = 'skeptical-switcher'),
  (SELECT id FROM memory_banks WHERE category = 'fmcg'),
  'competitive_experience',
  'The store brand revelation',
  'Finally tried the supermarket own-brand version of my premium laundry detergent. Literally no difference in results. Ive been paying 40% more for years for a nicer bottle. Now I try store brands first for everything.',
  'indifference',
  6,
  ARRAY['premium', 'quality', 'best', 'superior', 'professional', 'leading'],
  ARRAY['premium'],
  -2
);

-- Continue with 20+ more memories covering different types...
```

## Testing Checklist

- [ ] Archetype loader returns correct data
- [ ] Memory retrieval finds relevant memories
- [ ] Keyword matching works for exact and partial matches
- [ ] Claim type detection identifies common patterns
- [ ] Memory scoring produces differentiated results
- [ ] Skepticism calibration produces expected ranges
- [ ] Name generator produces realistic names
- [ ] Context builder assembles complete context
- [ ] Panel builder handles multiple archetypes in parallel
