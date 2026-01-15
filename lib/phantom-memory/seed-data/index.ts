/**
 * Phantom Memory Seed Data Loader
 * Pre-built experiences for each archetype to make them feel real
 */

import technologyMemories from './categories/technology.json'
import foodBeverageMemories from './categories/food-beverage.json'
import fashionMemories from './categories/fashion.json'
import homeGoodsMemories from './categories/home-goods.json'
import servicesMemories from './categories/services.json'

export interface SeedMemory {
  archetype_slug: string
  memory_text: string
  trigger_keywords: string[]
  emotional_residue: 'positive' | 'negative' | 'mixed' | 'neutral'
  trust_modifier: number // -5 to +5
  brand_mentioned: string | null
  experience_type: 'purchase' | 'disappointment' | 'delight' | 'social' | 'discovery' | 'regret'
}

export interface CategoryMemories {
  category: string
  memories: SeedMemory[]
}

// Load all category memories
const allMemories: Record<string, CategoryMemories> = {
  technology: technologyMemories as CategoryMemories,
  'food-beverage': foodBeverageMemories as CategoryMemories,
  fashion: fashionMemories as CategoryMemories,
  'home-goods': homeGoodsMemories as CategoryMemories,
  services: servicesMemories as CategoryMemories,
  // Default FMCG to food-beverage
  fmcg: foodBeverageMemories as CategoryMemories,
}

/**
 * Get seed memories for an archetype in a specific category
 */
export function getSeedMemories(
  archetypeSlug: string,
  category: string,
  limit: number = 5
): SeedMemory[] {
  const normalizedCategory = category.toLowerCase().replace(/_/g, '-')
  const categoryData = allMemories[normalizedCategory] || allMemories['food-beverage']

  if (!categoryData) {
    return []
  }

  // Filter memories for this archetype
  const archetypeMemories = categoryData.memories.filter(
    m => m.archetype_slug === archetypeSlug
  )

  // Return random selection up to limit
  const shuffled = [...archetypeMemories].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

/**
 * Get memories relevant to specific keywords
 */
export function getRelevantSeedMemories(
  archetypeSlug: string,
  category: string,
  keywords: string[],
  limit: number = 3
): SeedMemory[] {
  const normalizedCategory = category.toLowerCase().replace(/_/g, '-')
  const categoryData = allMemories[normalizedCategory] || allMemories['food-beverage']

  if (!categoryData) {
    return []
  }

  // Filter memories for this archetype
  const archetypeMemories = categoryData.memories.filter(
    m => m.archetype_slug === archetypeSlug
  )

  // Score by keyword overlap
  const scored = archetypeMemories.map(memory => {
    const keywordMatches = memory.trigger_keywords.filter(tk =>
      keywords.some(k =>
        tk.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(tk.toLowerCase())
      )
    ).length
    return { memory, score: keywordMatches }
  })

  // Sort by score and return top matches
  scored.sort((a, b) => b.score - a.score)

  // If no keyword matches, return random selection
  if (scored.length === 0 || scored[0]?.score === 0) {
    return getSeedMemories(archetypeSlug, category, limit)
  }

  return scored.slice(0, limit).map(s => s.memory)
}

/**
 * Build a narrative from seed memories for inclusion in prompts
 */
export function buildSeedMemoryNarrative(memories: SeedMemory[]): string {
  if (memories.length === 0) {
    return ''
  }

  const narratives = memories.map((m, i) => {
    const prefix = i === 0 ? 'I remember' : 'I also recall'
    return `${prefix} ${m.memory_text}`
  })

  return narratives.join('. ') + '.'
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.keys(allMemories).filter(k => k !== 'fmcg')
}
