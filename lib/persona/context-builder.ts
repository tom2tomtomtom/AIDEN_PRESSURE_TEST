/**
 * Persona Context Builder
 * Assembles complete persona context for LLM prompts
 */

import type { PersonaArchetype } from './archetype-loader'
import { loadArchetypeById, loadArchetypeBySlug } from './archetype-loader'
import { retrieveMemories, buildMemoryNarrative, type ScoredMemory } from './memory-retrieval'
import { generateName, generateAge, generateLocation, type GeneratedName } from './name-generator'
import { calculateSkepticism, getSkepticismDescription, getSkepticismBehaviors, type CalibrationLevel, type SkepticismResult } from './skepticism-calculator'
import { evaluateTraitActivation, type ActivatedTrait, type TraitActivationResult } from './trait-activator'

export interface PersonaContext {
  // Identity
  name: GeneratedName
  age: number
  location: string

  // Archetype
  archetype: PersonaArchetype

  // Calibrated attributes
  skepticism: SkepticismResult

  // Memory context
  memories: ScoredMemory[]
  memoryNarrative: string

  // Trait activation (enhanced personality)
  traitActivation: TraitActivationResult
  activatedTraits: ActivatedTrait[]

  // For prompt construction
  demographicSummary: string
  psychographicSummary: string
  voiceSummary: string
  skepticismSummary: string
}

export interface ContextBuilderOptions {
  archetypeId: string
  stimulusText: string
  category?: string
  calibration?: CalibrationLevel
  memoryLimit?: number
}

/**
 * Build complete persona context for a test
 */
export async function buildPersonaContext(
  options: ContextBuilderOptions
): Promise<PersonaContext> {
  const {
    archetypeId,
    stimulusText,
    category = 'fmcg',
    calibration = 'medium',
    memoryLimit = 5
  } = options

  // Load archetype - try by ID first, then by slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(archetypeId)
  const archetype = isUUID
    ? await loadArchetypeById(archetypeId)
    : await loadArchetypeBySlug(archetypeId)

  if (!archetype) {
    throw new Error(`Archetype not found: ${archetypeId}`)
  }

  // Retrieve relevant memories
  const retrievalResult = await retrieveMemories(
    archetypeId,
    stimulusText,
    category,
    memoryLimit
  )

  // Generate persona identity
  const name = generateName(archetype)
  const age = generateAge(archetype)
  const location = generateLocation(archetype)

  // Calculate calibrated skepticism
  const skepticism = calculateSkepticism(archetype, calibration, retrievalResult.memories)

  // Evaluate trait activation based on stimulus
  const traitActivation = await evaluateTraitActivation(
    archetype.slug,
    stimulusText,
    skepticism.level > 6 ? 'analytical' : skepticism.level > 4 ? 'neutral' : 'trusting'
  )

  // Build narrative strings
  const memoryNarrative = buildMemoryNarrative(retrievalResult.memories)
  const demographicSummary = buildDemographicSummary(archetype, age, location)
  const psychographicSummary = buildPsychographicSummary(archetype)
  const voiceSummary = buildVoiceSummary(archetype)
  const skepticismSummary = buildSkepticismSummary(skepticism)

  return {
    name,
    age,
    location,
    archetype,
    skepticism,
    memories: retrievalResult.memories,
    memoryNarrative,
    traitActivation,
    activatedTraits: traitActivation.activatedTraits,
    demographicSummary,
    psychographicSummary,
    voiceSummary,
    skepticismSummary
  }
}

/**
 * Build demographic summary string
 */
function buildDemographicSummary(
  archetype: PersonaArchetype,
  age: number,
  location: string
): string {
  const { demographics } = archetype

  const incomeDescriptions: Record<string, string> = {
    lower_middle: 'modest household income',
    middle: 'middle-class household income',
    middle_upper: 'comfortable household income',
    upper_middle: 'upper-middle-class household income',
    upper: 'high household income',
    entry_to_middle: 'entry-level to middle income'
  }

  const householdDescriptions: Record<string, string> = {
    family_with_children: 'with children at home',
    family_with_young_children: 'with young children',
    couple_no_children: 'empty nester',
    dual_income: 'dual-income household',
    young_professional: 'single professional',
    single_or_shared: 'living alone or with roommates',
    mixed: ''
  }

  const income = incomeDescriptions[demographics.income] || 'moderate household income'
  const household = householdDescriptions[demographics.household] || ''

  return `${age}-year-old living in ${location}, ${income}${household ? `, ${household}` : ''}`
}

/**
 * Build psychographic summary string
 */
function buildPsychographicSummary(archetype: PersonaArchetype): string {
  const { psychographics } = archetype

  const values = psychographics.values.slice(0, 3).join(', ')
  const motivations = psychographics.motivations.slice(0, 2).join(' and ')
  const painPoints = psychographics.pain_points.slice(0, 2).join(' and ')

  return `Values ${values}. Motivated by ${motivations}. Frustrated by ${painPoints}.`
}

/**
 * Build voice characteristics summary
 */
function buildVoiceSummary(archetype: PersonaArchetype): string {
  const traits = archetype.voice_traits.map(t => t.replace(/_/g, ' ')).slice(0, 4)
  return `Communication style: ${traits.join(', ')}`
}

/**
 * Build skepticism summary for prompt
 */
function buildSkepticismSummary(skepticism: SkepticismResult): string {
  const description = getSkepticismDescription(skepticism.level)
  const behaviors = getSkepticismBehaviors(skepticism.level)

  let summary = `${skepticism.label} (${skepticism.level}/10): ${description}.`

  if (behaviors.length > 0) {
    summary += ` When evaluating marketing: ${behaviors.join(', ')}.`
  }

  return summary
}

/**
 * Build a complete prompt section for the persona
 */
export function buildPersonaPromptSection(context: PersonaContext): string {
  const sections: string[] = []

  // Identity
  sections.push(`You are ${context.name.fullName}, a ${context.demographicSummary}.`)

  // Psychographics
  sections.push(context.psychographicSummary)

  // Skepticism
  sections.push(context.skepticismSummary)

  // Voice
  sections.push(context.voiceSummary)

  // Memory context (if any)
  if (context.memoryNarrative) {
    sections.push(`\nYour past experiences with brands and products:\n${context.memoryNarrative}`)
  }

  return sections.join('\n\n')
}

/**
 * Build multiple persona contexts for a panel
 */
export async function buildPersonaPanel(
  archetypeIds: string[],
  stimulusText: string,
  category: string = 'fmcg',
  calibration: CalibrationLevel = 'medium'
): Promise<PersonaContext[]> {
  const contexts = await Promise.all(
    archetypeIds.map(id =>
      buildPersonaContext({
        archetypeId: id,
        stimulusText,
        category,
        calibration
      })
    )
  )

  return contexts
}
