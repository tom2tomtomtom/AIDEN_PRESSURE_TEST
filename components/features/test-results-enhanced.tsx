'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  MessageSquare,
  Grid3X3,
  FileText,
  Lightbulb,
  Eye,
  AlertCircle
} from 'lucide-react'

// Import new visualization components
import { ModeratedTranscript } from '@/components/results/moderated-transcript'
import { SegmentHeatmap } from '@/components/results/segment-heatmap'
import { ClaimBreakdown } from '@/components/results/claim-breakdown'
import { ModerationImpact } from '@/components/results/moderation-impact'
import { TriangulationView } from '@/components/results/triangulation-view'

// Types
interface TestResult {
  id: string
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  purchase_intent_avg?: number
  analysis_summary?: string
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
    priority: 'must_fix' | 'should_improve' | 'nice_to_have'
    recommendation: string
    rationale: string
    effort?: 'low' | 'medium' | 'high'
  }>
  friction_points?: Array<{
    friction: string
    affected_segments: string[]
    impact: 'high' | 'medium' | 'low'
  }>
  credibility_gaps?: Array<{
    claim: string
    issue: string
    suggested_fix: string
  }>
  verbatim_highlights?: Array<{
    persona_name: string
    archetype: string
    quote: string
    topic: 'strength' | 'weakness' | 'general'
  }>
  // New moderation fields
  brief_analysis?: {
    primaryTone: string
    creativeDevices: string[]
    moderationNeeded: boolean
    intendedInterpretation: string
  }
  moderation_used?: boolean
  moderation_impact?: {
    personasClarified: number
    viewShifts: Array<{
      persona: string
      archetypeSlug: string
      metricName: string
      before: number
      after: number
    }>
    salvageRate: number
  }
  created_at: string
}

interface ConversationTurn {
  turn_number: number
  speaker_type: 'moderator' | 'persona'
  speaker_name: string
  archetype_slug?: string
  content: string
  turn_type:
    | 'introduction'
    | 'initial_response'
    | 'probe'
    | 'follow_up'
    | 'clarification'
    | 'revised_response'
    | 'draw_out'
    | 'closing'
  is_revised?: boolean
  response_data?: {
    purchase_intent?: number
    credibility_rating?: number
    emotional_response?: string
  }
}

interface PersonaResponse {
  id: string
  persona_name: string
  archetype_id: string
  archetype_slug: string
  archetype_name: string
  gut_reaction: string
  considered_view: string
  social_response: string
  private_thought: string
  purchase_intent: number
  credibility_rating: number
  emotional_response: string
  what_works?: string[]
  key_concerns?: string[]
  what_would_convince?: string
}

interface TestResultsEnhancedProps {
  results: TestResult
  responses: PersonaResponse[]
  conversationTurns?: ConversationTurn[]
  stimulus: string
  stimulusType: string
  testName: string
  testDate: string
}

// Score gauge component
function ScoreGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-border-subtle"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={color}
            strokeDasharray={`${(value / 100) * 251.2} 251.2`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white-full">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-sm text-white-muted mt-2">{label}</span>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-yellow-electric'
  if (score >= 30) return 'text-orange-accent'
  return 'text-red-hot'
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'must_fix':
      return 'bg-red-hot/20 text-red-hot border-red-hot/50'
    case 'should_improve':
      return 'bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50'
    case 'nice_to_have':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
    default:
      return 'bg-white-muted/20 text-white-muted border-white-muted/50'
  }
}

// Overview tab content
function OverviewTab({ results }: { results: TestResult }) {
  const keyStrengths = results.key_strengths || []
  const keyWeaknesses = results.key_weaknesses || []
  const recommendations = results.recommendations || []
  const verbatimHighlights = results.verbatim_highlights || []

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Scores</CardTitle>
          <CardDescription>How your stimulus performed with phantom consumers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around py-4">
            <ScoreGauge
              value={results.pressure_score}
              label="Pressure Score"
              color={getScoreColor(results.pressure_score)}
            />
            <ScoreGauge
              value={results.gut_attraction_index}
              label="Gut Attraction"
              color={getScoreColor(results.gut_attraction_index)}
            />
            <ScoreGauge
              value={results.credibility_score}
              label="Credibility"
              color={getScoreColor(results.credibility_score)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brief Analysis (if available) */}
      {results.brief_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-electric" />
              Creative Intent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-white-muted uppercase tracking-wider">Primary Tone</span>
                <p className="text-white-full font-medium">{results.brief_analysis.primaryTone}</p>
              </div>
              {results.brief_analysis.creativeDevices.length > 0 && (
                <div>
                  <span className="text-xs text-white-muted uppercase tracking-wider">Creative Devices</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {results.brief_analysis.creativeDevices.map((device, i) => (
                      <Badge key={i} variant="outline" className="border-orange-accent text-orange-accent">
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-white-muted uppercase tracking-wider">Intended Interpretation</span>
                <p className="text-sm text-white-muted">{results.brief_analysis.intendedInterpretation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary / Verdict */}
      {(results.one_line_verdict || results.analysis_summary) && (
        <Card>
          <CardHeader>
            <CardTitle>Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white-muted">{results.one_line_verdict || results.analysis_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Verbatim Highlights */}
      {verbatimHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verbatim Highlights</CardTitle>
            <CardDescription>Direct quotes from the phantom panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {verbatimHighlights.map((highlight, i) => (
                <div
                  key={i}
                  className={`p-4 border-l-4 ${
                    highlight.topic === 'strength'
                      ? 'border-green-500 bg-green-500/5'
                      : highlight.topic === 'weakness'
                      ? 'border-red-hot bg-red-hot/5'
                      : 'border-blue-500 bg-blue-500/5'
                  }`}
                >
                  <p className="text-sm italic text-white-full mb-2">&ldquo;{highlight.quote}&rdquo;</p>
                  <div className="flex items-center justify-between text-xs text-white-muted">
                    <span className="font-medium text-white-full">{highlight.persona_name}</span>
                    <span className="uppercase tracking-wider">{highlight.archetype}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(keyStrengths.length > 0 || keyWeaknesses.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {keyStrengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-500">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {keyStrengths.map((strength, i) => (
                    <li key={i} className="border-l-2 border-green-500 pl-3">
                      <p className="font-medium text-sm text-white-full">{strength.point}</p>
                      {strength.evidence && strength.evidence.length > 0 && (
                        <p className="text-xs text-white-muted mt-1">
                          Evidence: {strength.evidence.join('; ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {keyWeaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-hot">Key Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {keyWeaknesses.map((weakness, i) => (
                    <li key={i} className="border-l-2 border-red-hot pl-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white-full">{weakness.point}</p>
                        {weakness.severity && (
                          <Badge
                            className={
                              weakness.severity === 'critical'
                                ? 'bg-red-hot/20 text-red-hot border-red-hot/50'
                                : 'bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50'
                            }
                          >
                            {weakness.severity}
                          </Badge>
                        )}
                      </div>
                      {weakness.evidence && weakness.evidence.length > 0 && (
                        <p className="text-xs text-white-muted mt-1">
                          Evidence: {weakness.evidence.join('; ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Prioritized actions to improve performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="border border-border-subtle p-4">
                  <div className="flex items-start gap-3">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority.replace('_', ' ')}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-white-full">{rec.recommendation}</p>
                      <p className="text-sm text-white-muted mt-1">{rec.rationale}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Main enhanced results component
export function TestResultsEnhanced({
  results,
  responses,
  conversationTurns,
  stimulus,
  stimulusType,
  testName,
  testDate
}: TestResultsEnhancedProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Transform responses for components
  const heatmapData = responses.map(r => ({
    archetypeSlug: r.archetype_slug,
    archetypeName: r.archetype_name,
    purchaseIntent: r.purchase_intent,
    credibilityRating: r.credibility_rating,
    emotionalResponse: r.emotional_response,
    personaName: r.persona_name
  }))

  const triangulationData = responses.map(r => ({
    personaName: r.persona_name,
    archetypeSlug: r.archetype_slug,
    archetypeName: r.archetype_name,
    gutReaction: r.gut_reaction,
    consideredView: r.considered_view,
    socialResponse: r.social_response,
    privateThought: r.private_thought,
    purchaseIntent: r.purchase_intent,
    credibilityRating: r.credibility_rating,
    emotionalResponse: r.emotional_response
  }))

  // Check if we have moderated conversation
  const hasConversation = conversationTurns && conversationTurns.length > 0
  const hasModeration = results.moderation_used && results.moderation_impact

  return (
    <div className="space-y-6">
      {/* Moderation badge if applicable */}
      {results.moderation_used && (
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50">
            <Lightbulb className="h-3 w-3 mr-1" />
            AI Moderated Focus Group
          </Badge>
          {results.moderation_impact && (
            <span className="text-sm text-white-muted">
              {results.moderation_impact.personasClarified} personas received context •{' '}
              {results.moderation_impact.salvageRate}% salvage rate
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-black-deep">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          {hasConversation && (
            <TabsTrigger value="transcript" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Transcript</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="heatmap" className="flex items-center gap-1">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Heatmap</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Claims</span>
          </TabsTrigger>
          {hasModeration && (
            <TabsTrigger value="moderation" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="triangulation" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Say/Do</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab results={results} />
        </TabsContent>

        {hasConversation && (
          <TabsContent value="transcript" className="mt-6">
            <ModeratedTranscript
              turns={conversationTurns!}
              stimulus={stimulus}
              stimulusType={stimulusType}
              testName={testName}
              testDate={testDate}
              moderationUsed={results.moderation_used || false}
              moderationImpact={results.moderation_impact}
            />
          </TabsContent>
        )}

        <TabsContent value="heatmap" className="mt-6">
          <SegmentHeatmap responses={heatmapData} />
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <ClaimBreakdown
            claims={
              results.credibility_gaps?.map(gap => ({
                claim: gap.claim,
                averageCredibility: 5, // Would need to calculate from responses
                believers: [],
                doubters: [],
                suggestedProof: gap.suggested_fix
              })) || []
            }
            stimulus={stimulus}
          />
        </TabsContent>

        {hasModeration && (
          <TabsContent value="moderation" className="mt-6">
            <ModerationImpact
              impact={results.moderation_impact!}
              beforeAfterResponses={responses.map(r => ({
                personaName: r.persona_name,
                archetypeSlug: r.archetype_slug,
                initial: {
                  gutReaction: r.gut_reaction,
                  purchaseIntent: r.purchase_intent,
                  credibilityRating: r.credibility_rating,
                  emotionalResponse: r.emotional_response
                },
                receivedClarification: false // Would need to track this
              }))}
            />
          </TabsContent>
        )}

        <TabsContent value="triangulation" className="mt-6">
          <TriangulationView responses={triangulationData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
