/**
 * Archetype Loader
 * Loads persona archetypes from database with caching
 */

import { createAdminAuthClient } from '@/lib/supabase/admin'

// Use auth client (public schema) for RPC calls since our functions are in public schema
const createRpcClient = createAdminAuthClient

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
 * Uses RPC function to access ppt schema
 */
export async function loadAllArchetypes(): Promise<PersonaArchetype[]> {
  if (isCacheValid() && archetypeCache) {
    return Array.from(archetypeCache.values())
  }

  const supabase = createRpcClient()

  const { data, error } = await supabase.rpc('get_all_archetypes')

  if (error) {
    console.error('Error loading archetypes:', error)
    throw new Error('Failed to load archetypes')
  }

  // RPC returns JSONB directly, extract the data
  const archetypes = (data || []).map((item: any) => {
    // Handle both direct JSONB and wrapped response formats
    return typeof item === 'object' && item !== null
      ? (item.get_all_archetypes || item) as PersonaArchetype
      : item
  })

  // Update cache
  archetypeCache = new Map()
  for (const archetype of archetypes) {
    archetypeCache.set(archetype.id, archetype)
    archetypeCache.set(archetype.slug, archetype)
  }
  cacheTimestamp = Date.now()

  return archetypes
}

/**
 * Load a single archetype by ID
 * Uses RPC function to access ppt schema
 */
export async function loadArchetypeById(id: string): Promise<PersonaArchetype | null> {
  // Check cache first
  if (isCacheValid() && archetypeCache?.has(id)) {
    return archetypeCache.get(id) || null
  }

  const supabase = createRpcClient()

  const { data, error } = await supabase.rpc('get_archetype_by_id', { archetype_id: id })

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error loading archetype:', error)
    throw new Error('Failed to load archetype')
  }

  if (!data) return null

  // Handle wrapped JSONB response
  const archetype = (typeof data === 'object' && data.get_archetype_by_id)
    ? data.get_archetype_by_id as PersonaArchetype
    : data as PersonaArchetype

  // Update cache
  if (!archetypeCache) {
    archetypeCache = new Map()
    cacheTimestamp = Date.now()
  }
  archetypeCache.set(archetype.id, archetype)
  archetypeCache.set(archetype.slug, archetype)

  return archetype
}

/**
 * Load a single archetype by slug
 * Uses RPC function to access ppt schema
 */
export async function loadArchetypeBySlug(slug: string): Promise<PersonaArchetype | null> {
  // Check cache first
  if (isCacheValid() && archetypeCache?.has(slug)) {
    return archetypeCache.get(slug) || null
  }

  const supabase = createRpcClient()

  const { data, error } = await supabase.rpc('get_archetype_by_slug', { archetype_slug: slug })

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error loading archetype:', error)
    throw new Error('Failed to load archetype')
  }

  if (!data) return null

  // Handle wrapped JSONB response
  const archetype = (typeof data === 'object' && data.get_archetype_by_slug)
    ? data.get_archetype_by_slug as PersonaArchetype
    : data as PersonaArchetype

  // Update cache
  if (!archetypeCache) {
    archetypeCache = new Map()
    cacheTimestamp = Date.now()
  }
  archetypeCache.set(archetype.id, archetype)
  archetypeCache.set(archetype.slug, archetype)

  return archetype
}

/**
 * Load archetypes with memory counts
 * Uses RPC function to access ppt schema
 */
export async function loadArchetypesWithStats(): Promise<ArchetypeWithStats[]> {
  // Load archetypes via RPC
  const archetypes = await loadAllArchetypes()

  // For now, return with 0 memory counts (phantom_memories also needs RPC)
  // TODO: Create RPC for memory counts when phantom_memories table is populated
  return archetypes.map(archetype => ({
    ...archetype,
    memoryCount: 0
  })) as ArchetypeWithStats[]
}

/**
 * Load multiple archetypes by IDs or slugs
 * Uses RPC function to access ppt schema
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

  // Load all and filter (since we don't have a batch RPC function)
  const all = await loadAllArchetypes()
  const idSet = new Set(ids)

  return all.filter(a => idSet.has(a.id) || idSet.has(a.slug))
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
