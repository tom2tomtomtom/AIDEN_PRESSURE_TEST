import { Document } from '@react-pdf/renderer'
import { CoverPage } from './components/cover-page'
import { ExecutiveSummary } from './components/executive-summary'
import { ScoresDashboard } from './components/scores-dashboard'
import { StrengthsSection } from './components/strengths-section'
import { WeaknessesSection } from './components/weaknesses-section'
import { RecommendationsSection } from './components/recommendations-section'
import { PersonaAppendix } from './components/persona-appendix'

// Types matching the database/API structure
export interface TestData {
  id: string
  name: string
  stimulus_type: string
  stimulus_content: string
  stimulus_claims?: string[]
  status: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export interface ProjectData {
  id: string
  name: string
  category: string
}

export interface TestResultData {
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  purchase_intent_avg?: number
  purchase_intent_distribution?: {
    high: number
    medium: number
    low: number
  }
  one_line_verdict?: string
  key_strengths?: Array<{
    point: string
    evidence: string[]
    confidence: 'high' | 'medium' | 'low'
  }>
  key_weaknesses?: Array<{
    point: string
    evidence: string[]
    severity: 'critical' | 'major' | 'minor'
  }>
  recommendations?: Array<{
    recommendation: string
    rationale: string
    priority: 'must_fix' | 'should_improve' | 'nice_to_have'
    effort?: 'low' | 'medium' | 'high'
  }>
  verbatim_highlights?: Array<{
    persona_name: string
    archetype: string
    quote: string
    topic: 'strength' | 'weakness' | 'general'
  }>
  total_responses?: number
  execution_time_ms?: number
}

export interface PersonaResponseData {
  id: string
  archetype_id: string
  archetype: {
    id: string
    name: string
    slug: string
    category: string
    baseline_skepticism: string
  }
  generated_name: string
  response_data: {
    gut_reaction: string
    considered_view: string
    social_response: string
    private_thought: string
    purchase_intent: number
    credibility_rating: number
    emotional_response: string
    key_concerns: string[]
    what_would_convince: string[]
    what_works?: string[]
  }
  memories_used: string[]
  created_at: string
}

export interface ReportOptions {
  includeAppendix?: boolean
}

interface PressureTestReportProps {
  test: TestData
  project: ProjectData
  result: TestResultData
  responses: PersonaResponseData[]
  options?: ReportOptions
}

const stimulusLabels: Record<string, string> = {
  concept: 'Concept Test',
  claim: 'Claim Validation',
  product: 'Product Test',
  ad: 'Ad Test',
  ad_copy: 'Ad Copy Test',
  tagline: 'Tagline Test',
  product_description: 'Product Description',
}

export function PressureTestReport({
  test,
  project,
  result,
  responses,
  options = { includeAppendix: true },
}: PressureTestReportProps) {
  const stimulusType = stimulusLabels[test.stimulus_type] || test.stimulus_type

  return (
    <Document
      title={`Pressure Test Report - ${test.name}`}
      author="AIDEN"
      subject={`Pressure Test results for ${test.name}`}
      creator="AIDEN Pressure Test Platform"
    >
      {/* Cover Page */}
      <CoverPage
        testName={test.name}
        projectName={project.name}
        stimulusType={stimulusType}
        createdAt={test.created_at}
        completedAt={test.completed_at}
      />

      {/* Executive Summary */}
      <ExecutiveSummary
        pressureScore={result.pressure_score}
        oneLineVerdict={result.one_line_verdict}
        keyStrengths={result.key_strengths}
        keyWeaknesses={result.key_weaknesses}
        recommendations={result.recommendations}
      />

      {/* Scores Dashboard */}
      <ScoresDashboard
        pressureScore={result.pressure_score}
        gutAttractionIndex={result.gut_attraction_index}
        credibilityScore={result.credibility_score}
        purchaseIntentAvg={result.purchase_intent_avg}
        purchaseIntentDistribution={result.purchase_intent_distribution}
      />

      {/* Strengths Section */}
      {result.key_strengths && result.key_strengths.length > 0 && (
        <StrengthsSection
          strengths={result.key_strengths}
          verbatimHighlights={result.verbatim_highlights}
        />
      )}

      {/* Weaknesses Section */}
      {result.key_weaknesses && result.key_weaknesses.length > 0 && (
        <WeaknessesSection
          weaknesses={result.key_weaknesses}
          verbatimHighlights={result.verbatim_highlights}
        />
      )}

      {/* Recommendations Section */}
      {result.recommendations && result.recommendations.length > 0 && (
        <RecommendationsSection recommendations={result.recommendations} />
      )}

      {/* Persona Appendix (optional) */}
      {options.includeAppendix && responses.length > 0 && (
        <PersonaAppendix responses={responses} />
      )}
    </Document>
  )
}

// Export type for use in API route
export type { PressureTestReportProps }
