/**
 * Memory Retrieval Engine
 * Retrieves relevant phantom memories for persona context
 * Falls back to seed data when database memories are empty
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { extractKeywords, calculateKeywordScore } from './keyword-extractor'
import { detectClaims, getClaimTriggerMapping, type ClaimType } from './claim-detector'
import { getRelevantSeedMemories } from '@/lib/phantom-memory/seed-data'
import { loadArchetypeById } from './archetype-loader'

export interface PhantomMemory {
  id: string
  archetype_id: string
  category: string
  memory_text: string
  trigger_keywords: string[]
  emotional_residue: 'positive' | 'negative' | 'mixed' | 'neutral'
  trust_modifier: number
  brand_mentioned: string | null
  experience_type: string
  created_at: string
}

export interface ScoredMemory extends PhantomMemory {
  relevanceScore: number
  matchDetails: {
    keywordScore: number
    claimScore: number
    emotionalWeight: number
  }
}

export interface RetrievalResult {
  memories: ScoredMemory[]
  extractedKeywords: string[]
  detectedClaims: { type: ClaimType; confidence: number }[]
  fallbackUsed: boolean
}

// Emotional intensity weights (how strongly the memory resonates)
const EMOTIONAL_WEIGHTS: Record<string, number> = {
  negative: 1.2,   // Negative experiences are more memorable
  positive: 1.0,
  mixed: 0.9,
  neutral: 0.7
}

/**
 * Retrieve relevant memories for an archetype given a stimulus
 */
export async function retrieveMemories(
  archetypeId: string,
  stimulusText: string,
  category: string = 'fmcg',
  limit: number = 5
): Promise<RetrievalResult> {
  const supabase = createAdminClient()

  // Extract keywords from stimulus
  const extracted = extractKeywords(stimulusText)

  // Detect claim types
  const claims = detectClaims(stimulusText)

  // Fetch all memories for this archetype and category
  // Note: phantom_memories is in ppt schema, may not be accessible via REST API
  let memories: PhantomMemory[] | null = null

  try {
    const { data, error } = await supabase
      .from('phantom_memories')
      .select('*')
      .eq('archetype_id', archetypeId)
      .eq('category', category)

    if (error) {
      // Schema not accessible or other error - fall back to seed data
      console.log('Memories not accessible via REST, using seed data fallback')
      memories = null
    } else {
      memories = data as PhantomMemory[]
    }
  } catch (e) {
    console.log('Error accessing memories, using seed data fallback:', e)
    memories = null
  }

  if (!memories || memories.length === 0) {
    // Fallback: use seed data or random memories from any archetype
    return await fallbackRetrieval(category, limit, extracted.all, claims, archetypeId)
  }

  // Score each memory
  const scoredMemories: ScoredMemory[] = memories.map(memory => {
    const keywordScore = calculateKeywordScore(extracted, memory.trigger_keywords)

    // Calculate claim type match score
    let claimScore = 0
    for (const claim of claims) {
      const claimTriggers = getClaimTriggerMapping(claim.type)
      const hasOverlap = memory.trigger_keywords.some((k: string) =>
        claimTriggers.some((ct: string) => k.includes(ct) || ct.includes(k))
      )
      if (hasOverlap) {
        claimScore += 2 * claim.confidence
      }
    }

    // Get emotional weight
    const emotionalWeight = EMOTIONAL_WEIGHTS[memory.emotional_residue] || 1.0

    // Calculate total score
    const relevanceScore = (keywordScore + claimScore) * emotionalWeight

    return {
      ...memory,
      relevanceScore,
      matchDetails: {
        keywordScore,
        claimScore,
        emotionalWeight
      }
    }
  })

  // Sort by relevance score
  scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Check if we have any relevant matches
  const topMemories = scoredMemories.slice(0, limit)
  const hasRelevantMatches = topMemories.some(m => m.relevanceScore > 0)

  if (!hasRelevantMatches) {
    // Fallback to random selection if no relevant matches
    return await fallbackRetrieval(category, limit, extracted.all, claims, archetypeId)
  }

  return {
    memories: topMemories,
    extractedKeywords: extracted.all,
    detectedClaims: claims.map(c => ({ type: c.type, confidence: c.confidence })),
    fallbackUsed: false
  }
}

/**
 * Fallback retrieval when no relevant memories found
 * Uses seed data when database memories are empty
 */
async function fallbackRetrieval(
  category: string,
  limit: number,
  keywords: string[],
  claims: { type: ClaimType; confidence: number }[],
  preferredArchetypeId?: string
): Promise<RetrievalResult> {
  const supabase = createAdminClient()

  // Get random memories from the category
  let query = supabase
    .from('phantom_memories')
    .select('*')
    .eq('category', category)

  // Prefer memories from the same archetype if specified
  if (preferredArchetypeId) {
    query = query.eq('archetype_id', preferredArchetypeId)
  }

  const { data: memories, error } = await query.limit(limit * 3)

  // If we have database memories, use them
  if (!error && memories && memories.length > 0) {
    // Shuffle and take random selection
    const shuffled = memories.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, limit)

    const scoredMemories: ScoredMemory[] = selected.map(memory => ({
      ...memory,
      relevanceScore: 0,
      matchDetails: {
        keywordScore: 0,
        claimScore: 0,
        emotionalWeight: EMOTIONAL_WEIGHTS[memory.emotional_residue] || 1.0
      }
    }))

    return {
      memories: scoredMemories,
      extractedKeywords: keywords,
      detectedClaims: claims.map(c => ({ type: c.type, confidence: c.confidence })),
      fallbackUsed: true
    }
  }

  // No database memories - use seed data
  if (preferredArchetypeId) {
    const archetype = await loadArchetypeById(preferredArchetypeId)
    if (archetype) {
      const seedMemories = getRelevantSeedMemories(archetype.slug, category, keywords, limit)

      if (seedMemories.length > 0) {
        // Convert seed memories to ScoredMemory format
        const scoredMemories: ScoredMemory[] = seedMemories.map((seed, index) => ({
          id: `seed-${archetype.slug}-${index}`,
          archetype_id: preferredArchetypeId,
          category,
          memory_text: seed.memory_text,
          trigger_keywords: seed.trigger_keywords,
          emotional_residue: seed.emotional_residue,
          trust_modifier: seed.trust_modifier,
          brand_mentioned: seed.brand_mentioned,
          experience_type: seed.experience_type,
          created_at: new Date().toISOString(),
          relevanceScore: 1, // Seed memories are assumed relevant
          matchDetails: {
            keywordScore: 1,
            claimScore: 0,
            emotionalWeight: EMOTIONAL_WEIGHTS[seed.emotional_residue] || 1.0
          }
        }))

        return {
          memories: scoredMemories,
          extractedKeywords: keywords,
          detectedClaims: claims.map(c => ({ type: c.type, confidence: c.confidence })),
          fallbackUsed: true
        }
      }
    }
  }

  // No memories available at all
  return {
    memories: [],
    extractedKeywords: keywords,
    detectedClaims: claims.map(c => ({ type: c.type, confidence: c.confidence })),
    fallbackUsed: true
  }
}

/**
 * Build a narrative string from retrieved memories
 */
export function buildMemoryNarrative(memories: ScoredMemory[]): string {
  if (memories.length === 0) {
    return ''
  }

  const narratives = memories.map((m, i) => {
    const prefix = i === 0 ? 'I remember when' : 'Also,'
    return `${prefix} ${m.memory_text}`
  })

  return narratives.join(' ')
}

/**
 * Calculate aggregate trust impact from memories
 */
export function calculateTrustImpact(memories: ScoredMemory[]): number {
  if (memories.length === 0) return 0

  const totalModifier = memories.reduce((sum, m) => sum + m.trust_modifier, 0)
  // Average and clamp to -5 to +5
  const average = totalModifier / memories.length
  return Math.max(-5, Math.min(5, average))
}

/**
 * Get dominant emotional residue from memories
 */
export function getDominantEmotion(memories: ScoredMemory[]): string {
  if (memories.length === 0) return 'neutral'

  const counts: Record<string, number> = {}
  for (const m of memories) {
    counts[m.emotional_residue] = (counts[m.emotional_residue] || 0) + 1
  }

  let dominant = 'neutral'
  let maxCount = 0
  for (const [emotion, count] of Object.entries(counts)) {
    if (count > maxCount) {
      dominant = emotion
      maxCount = count
    }
  }

  return dominant
}
