/**
 * Archetype Loader
 * Loads persona archetypes from database with caching
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface PersonaArchetype {
  id: string
  name: string
  slug: string
  category: string
  demographics: {
    age_range: string
    lifestage: string
    income: string
    location: string
    education: string
    household: string
  }
  psychographics: {
    values: string[]
    motivations: string[]
    pain_points: string[]
    media_habits: string[]
    decision_style: string
    influence_type: string
    brand_relationship: string
  }
  baseline_skepticism: 'low' | 'medium' | 'high' | 'extreme'
  voice_traits: string[]
  created_at: string
}

export interface ArchetypeWithStats extends PersonaArchetype {
  memoryCount: number
}

// In-memory cache for archetypes (session-level)
let archetypeCache: Map<string, PersonaArchetype> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Clear the archetype cache
 */
export function clearArchetypeCache(): void {
  archetypeCache = null
  cacheTimestamp = 0
}

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  return archetypeCache !== null && Date.now() - cacheTimestamp < CACHE_TTL
}

/**
 * Load all archetypes (with caching)
 */
export async function loadAllArchetypes(): Promise<PersonaArchetype[]> {
  if (isCacheValid() && archetypeCache) {
    return Array.from(archetypeCache.values())
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error loading archetypes:', error)
    throw new Error('Failed to load archetypes')
  }

  // Update cache
  archetypeCache = new Map()
  for (const archetype of data || []) {
    archetypeCache.set(archetype.id, archetype as PersonaArchetype)
    archetypeCache.set(archetype.slug, archetype as PersonaArchetype)
  }
  cacheTimestamp = Date.now()

  return data as PersonaArchetype[]
}

/**
 * Load a single archetype by ID
 */
export async function loadArchetypeById(id: string): Promise<PersonaArchetype | null> {
  // Check cache first
  if (isCacheValid() && archetypeCache?.has(id)) {
    return archetypeCache.get(id) || null
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error loading archetype:', error)
    throw new Error('Failed to load archetype')
  }

  // Update cache
  if (!archetypeCache) {
    archetypeCache = new Map()
    cacheTimestamp = Date.now()
  }
  archetypeCache.set(data.id, data as PersonaArchetype)
  archetypeCache.set(data.slug, data as PersonaArchetype)

  return data as PersonaArchetype
}

/**
 * Load a single archetype by slug
 */
export async function loadArchetypeBySlug(slug: string): Promise<PersonaArchetype | null> {
  // Check cache first
  if (isCacheValid() && archetypeCache?.has(slug)) {
    return archetypeCache.get(slug) || null
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error loading archetype:', error)
    throw new Error('Failed to load archetype')
  }

  // Update cache
  if (!archetypeCache) {
    archetypeCache = new Map()
    cacheTimestamp = Date.now()
  }
  archetypeCache.set(data.id, data as PersonaArchetype)
  archetypeCache.set(data.slug, data as PersonaArchetype)

  return data as PersonaArchetype
}

/**
 * Load archetypes with memory counts
 */
export async function loadArchetypesWithStats(): Promise<ArchetypeWithStats[]> {
  const supabase = createAdminClient()

  // Get archetypes
  const { data: archetypes, error: archError } = await supabase
    .from('persona_archetypes')
    .select('*')
    .order('name')

  if (archError) {
    console.error('Error loading archetypes:', archError)
    throw new Error('Failed to load archetypes')
  }

  // Get memory counts per archetype
  const { data: memoryCounts, error: memError } = await supabase
    .from('phantom_memories')
    .select('archetype_id')

  if (memError) {
    console.error('Error loading memory counts:', memError)
    throw new Error('Failed to load memory counts')
  }

  // Count memories per archetype
  const countMap = new Map<string, number>()
  for (const m of memoryCounts || []) {
    const current = countMap.get(m.archetype_id) || 0
    countMap.set(m.archetype_id, current + 1)
  }

  // Combine data
  return (archetypes || []).map(archetype => ({
    ...archetype,
    memoryCount: countMap.get(archetype.id) || 0
  })) as ArchetypeWithStats[]
}

/**
 * Load multiple archetypes by IDs
 */
export async function loadArchetypesByIds(ids: string[]): Promise<PersonaArchetype[]> {
  if (ids.length === 0) return []

  // Check cache first
  if (isCacheValid() && archetypeCache) {
    const cached = ids
      .map(id => archetypeCache?.get(id))
      .filter((a): a is PersonaArchetype => a !== undefined)

    if (cached.length === ids.length) {
      return cached
    }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('persona_archetypes')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error('Error loading archetypes:', error)
    throw new Error('Failed to load archetypes')
  }

  // Update cache
  if (!archetypeCache) {
    archetypeCache = new Map()
    cacheTimestamp = Date.now()
  }
  for (const archetype of data || []) {
    archetypeCache.set(archetype.id, archetype as PersonaArchetype)
    archetypeCache.set(archetype.slug, archetype as PersonaArchetype)
  }

  return data as PersonaArchetype[]
}

/**
 * Get skepticism level as numeric value
 */
export function getSkepticismValue(level: PersonaArchetype['baseline_skepticism']): number {
  const values: Record<string, number> = {
    low: 3,
    medium: 5,
    high: 7,
    extreme: 9
  }
  return values[level] || 5
}

/**
 * Get a random archetype (useful for testing)
 */
export async function loadRandomArchetype(): Promise<PersonaArchetype> {
  const archetypes = await loadAllArchetypes()
  if (archetypes.length === 0) {
    throw new Error('No archetypes available')
  }
  const randomIndex = Math.floor(Math.random() * archetypes.length)
  return archetypes[randomIndex]!
}
