// Domain model types for Phantom Pressure Test

export type TestStatus = 'draft' | 'running' | 'completed' | 'failed'

export type Category = 'fmcg' | 'services' | 'premium'

export interface PersonaArchetype {
  id: string
  name: string
  description: string
  demographics: {
    age_range: string
    income_level: string
    education: string
    location_type: string
  }
  psychographics: {
    values: string[]
    pain_points: string[]
    decision_drivers: string[]
  }
  base_skepticism: number
  created_at: string
}

export interface PhantomMemory {
  id: string
  archetype_id: string
  memory_bank_id: string
  memory_text: string
  trigger_keywords: string[]
  emotional_residue: 'positive' | 'negative' | 'neutral' | 'mixed'
  trust_modifier: number
  created_at: string
}

export interface PressureTest {
  id: string
  project_id: string
  name: string
  stimulus: string
  category: Category
  status: TestStatus
  panel_config: {
    archetypes: string[]
    skepticism_level: number
    enable_group_dynamics: boolean
  }
  created_at: string
  started_at?: string
  completed_at?: string
}

export interface PersonaResponse {
  id: string
  test_id: string
  archetype_id: string
  gut_reaction: {
    score: number
    immediate_thoughts: string
    emotional_tone: string
  }
  credibility_assessment: {
    score: number
    believable_elements: string[]
    skeptical_points: string[]
    triggered_memories: string[]
  }
  created_at: string
}

export interface TestResult {
  id: string
  test_id: string
  pressure_score: number
  aggregated_analysis: {
    overall_gut_score: number
    overall_credibility_score: number
    top_weaknesses: Array<{
      issue: string
      severity: number
      affected_personas: string[]
    }>
    credibility_gaps: Array<{
      claim: string
      gap_size: number
      personas_flagging: string[]
    }>
    friction_points: Array<{
      point: string
      resistance_level: number
    }>
    recommendations: string[]
  }
  group_dynamics?: {
    influence_patterns: Array<{
      influencer: string
      influenced: string[]
      topic: string
    }>
    consensus_areas: string[]
    minority_reports: string[]
  }
  created_at: string
}

