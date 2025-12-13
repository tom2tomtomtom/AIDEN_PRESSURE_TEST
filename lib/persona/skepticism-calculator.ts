/**
 * Skepticism Calculator
 * Calibrates persona skepticism level based on multiple factors
 */

import type { PersonaArchetype } from './archetype-loader'
import type { ScoredMemory } from './memory-retrieval'

export type CalibrationLevel = 'low' | 'medium' | 'high' | 'extreme'

// Calibration modifiers from test configuration
const CALIBRATION_MODIFIERS: Record<CalibrationLevel, number> = {
  low: -2,      // More trusting test environment
  medium: 0,   // Neutral
  high: 1,     // Slightly more skeptical
  extreme: 3   // Maximum skepticism
}

// Base skepticism values
const BASE_SKEPTICISM: Record<PersonaArchetype['baseline_skepticism'], number> = {
  low: 3,
  medium: 5,
  high: 7,
  extreme: 9
}

export interface SkepticismResult {
  level: number           // 1-10 numeric skepticism level
  label: string           // Human-readable label
  modifiers: {
    baseline: number
    calibration: number
    memory: number
    total: number
  }
}

/**
 * Calculate calibrated skepticism level for a persona
 */
export function calculateSkepticism(
  archetype: PersonaArchetype,
  calibration: CalibrationLevel = 'medium',
  triggeredMemories: ScoredMemory[] = []
): SkepticismResult {
  // Start with archetype baseline
  const baseline = BASE_SKEPTICISM[archetype.baseline_skepticism]

  // Apply test calibration modifier
  const calibrationModifier = CALIBRATION_MODIFIERS[calibration]

  // Calculate memory trust impact
  // Negative trust modifiers increase skepticism, positive decrease
  let memoryModifier = 0
  if (triggeredMemories.length > 0) {
    const totalTrustImpact = triggeredMemories.reduce(
      (sum, m) => sum + m.trust_modifier,
      0
    )
    // Invert: negative trust = more skeptical
    memoryModifier = -Math.round(totalTrustImpact / triggeredMemories.length)
  }

  // Calculate total (clamped to 1-10)
  const unclamped = baseline + calibrationModifier + memoryModifier
  const level = Math.max(1, Math.min(10, unclamped))

  return {
    level,
    label: getSkepticismLabel(level),
    modifiers: {
      baseline,
      calibration: calibrationModifier,
      memory: memoryModifier,
      total: level
    }
  }
}

/**
 * Get a human-readable label for skepticism level
 */
export function getSkepticismLabel(level: number): string {
  if (level <= 2) return 'Very Trusting'
  if (level <= 4) return 'Open-Minded'
  if (level <= 6) return 'Cautiously Skeptical'
  if (level <= 8) return 'Highly Skeptical'
  return 'Deeply Cynical'
}

/**
 * Get skepticism description for prompt context
 */
export function getSkepticismDescription(level: number): string {
  if (level <= 2) {
    return 'tends to take claims at face value and gives brands the benefit of the doubt'
  }
  if (level <= 4) {
    return 'is generally open to marketing messages but occasionally questions claims'
  }
  if (level <= 6) {
    return 'approaches marketing with healthy skepticism and looks for evidence behind claims'
  }
  if (level <= 8) {
    return 'is highly skeptical of marketing claims and actively looks for contradictions or exaggerations'
  }
  return 'assumes marketing claims are manipulative until proven otherwise and actively challenges everything'
}

/**
 * Calculate how skepticism affects response style
 */
export function getSkepticismBehaviors(level: number): string[] {
  const behaviors: string[] = []

  if (level >= 3) {
    behaviors.push('questions vague claims')
  }
  if (level >= 5) {
    behaviors.push('asks for specific evidence')
    behaviors.push('notices inconsistencies')
  }
  if (level >= 7) {
    behaviors.push('challenges marketing language directly')
    behaviors.push('references past brand disappointments')
    behaviors.push('compares to competitor claims')
  }
  if (level >= 9) {
    behaviors.push('assumes manipulation')
    behaviors.push('dismisses unsubstantiated claims')
    behaviors.push('expresses cynicism openly')
  }

  return behaviors
}

/**
 * Determine if persona will challenge a specific claim type
 */
export function shouldChallengeClaimType(
  level: number,
  claimType: string
): boolean {
  // High-skepticism claims that get challenged easily
  const highSkepticismClaims = [
    'natural', 'organic', 'healthy', 'clinically proven',
    'sustainable', 'eco-friendly', 'premium', 'artisan'
  ]

  // Medium-skepticism claims
  const mediumSkepticismClaims = [
    'new', 'improved', 'best', 'favorite', 'trusted'
  ]

  const normalizedClaim = claimType.toLowerCase()

  // High skepticism claims challenged at level 5+
  if (highSkepticismClaims.some(c => normalizedClaim.includes(c))) {
    return level >= 5
  }

  // Medium skepticism claims challenged at level 7+
  if (mediumSkepticismClaims.some(c => normalizedClaim.includes(c))) {
    return level >= 7
  }

  // Other claims challenged at level 8+
  return level >= 8
}
