/**
 * Seed memory statistics
 *
 * Computes memory counts per archetype across all categories. Used by the UI
 * to show the depth of the phantom memory bank for each archetype while the
 * `phantom_memories` database table is still being populated (see
 * archetype-loader.loadArchetypesWithStats).
 */

import technologyMemories from './categories/technology.json'
import foodBeverageMemories from './categories/food-beverage.json'
import fashionMemories from './categories/fashion.json'
import homeGoodsMemories from './categories/home-goods.json'
import servicesMemories from './categories/services.json'

interface SeedCategoryFile {
  category: string
  memories: Array<{ archetype_slug: string }>
}

const ALL_FILES: SeedCategoryFile[] = [
  technologyMemories as SeedCategoryFile,
  foodBeverageMemories as SeedCategoryFile,
  fashionMemories as SeedCategoryFile,
  homeGoodsMemories as SeedCategoryFile,
  servicesMemories as SeedCategoryFile,
]

let cachedCounts: Map<string, number> | null = null

function buildCounts(): Map<string, number> {
  if (cachedCounts) return cachedCounts
  const counts = new Map<string, number>()
  for (const file of ALL_FILES) {
    for (const memory of file.memories ?? []) {
      const slug = memory.archetype_slug
      if (!slug) continue
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  cachedCounts = counts
  return counts
}

/**
 * Total seed memories for an archetype across all categories.
 */
export function getSeedMemoryCount(archetypeSlug: string): number {
  return buildCounts().get(archetypeSlug) ?? 0
}

/**
 * Memory counts keyed by archetype slug.
 */
export function getSeedMemoryCountsBySlug(): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [slug, count] of buildCounts().entries()) {
    result[slug] = count
  }
  return result
}
