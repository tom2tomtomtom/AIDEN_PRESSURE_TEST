'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, MessageSquare, Lock, AlertTriangle, CheckCircle } from 'lucide-react'

interface TriangulationData {
  personaName: string
  archetypeSlug: string
  archetypeName: string
  gutReaction: string
  consideredView: string
  socialResponse: string
  privateThought: string
  purchaseIntent: number
  credibilityRating: number
  emotionalResponse: string
}

interface TriangulationViewProps {
  responses: TriangulationData[]
}

/**
 * Analyze say/do gap for a single response
 */
function analyzeSayDoGap(response: TriangulationData): {
  hasGap: boolean
  gapType: 'positive_gap' | 'negative_gap' | 'aligned'
  gapSeverity: 'high' | 'medium' | 'low'
  description: string
} {
  const socialLower = response.socialResponse.toLowerCase()
  const privateLower = response.privateThought.toLowerCase()

  // Check for positive words
  const positiveWords = ['great', 'love', 'good', 'nice', 'like', 'interesting', 'cool', 'amazing', 'impressed']
  const negativeWords = ['not sure', 'skeptical', 'doubt', 'worried', 'concerned', 'wouldn\'t', 'won\'t', 'don\'t', 'hate', 'dislike', 'annoying']

  const socialPositive = positiveWords.some(w => socialLower.includes(w))
  const socialNegative = negativeWords.some(w => socialLower.includes(w))
  const privatePositive = positiveWords.some(w => privateLower.includes(w))
  const privateNegative = negativeWords.some(w => privateLower.includes(w))

  // Positive gap: Says nice things publicly, thinks differently privately
  if (socialPositive && !socialNegative && privateNegative && !privatePositive) {
    return {
      hasGap: true,
      gapType: 'positive_gap',
      gapSeverity: 'high',
      description: 'Says positive things publicly but has private doubts'
    }
  }

  // Negative gap: Critical publicly, more positive privately
  if (socialNegative && !socialPositive && privatePositive && !privateNegative) {
    return {
      hasGap: true,
      gapType: 'negative_gap',
      gapSeverity: 'medium',
      description: 'More critical publicly than privately'
    }
  }

  // Check for word count/tone differences
  const socialLength = response.socialResponse.split(' ').length
  const privateLength = response.privateThought.split(' ').length

  if (Math.abs(socialLength - privateLength) > 20) {
    return {
      hasGap: true,
      gapType: 'positive_gap',
      gapSeverity: 'low',
      description: 'Different level of detail in public vs private'
    }
  }

  return {
    hasGap: false,
    gapType: 'aligned',
    gapSeverity: 'low',
    description: 'Public and private views are aligned'
  }
}

/**
 * Single persona triangulation card
 */
function TriangulationCard({ response }: { response: TriangulationData }) {
  const gapAnalysis = useMemo(() => analyzeSayDoGap(response), [response])

  return (
    <div className="border border-border-subtle bg-black-deep">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-red-hot bg-red-hot/10 flex items-center justify-center text-red-hot font-bold">
              {response.personaName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white-full">{response.personaName}</div>
              <div className="text-xs text-white-muted">{response.archetypeName}</div>
            </div>
          </div>
          {gapAnalysis.hasGap ? (
            <Badge className="bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Say/Do Gap
            </Badge>
          ) : (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aligned
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <span className="text-white-muted">Intent: </span>
            <span className={`font-bold ${
              response.purchaseIntent >= 7 ? 'text-green-500' :
              response.purchaseIntent >= 5 ? 'text-yellow-electric' : 'text-red-hot'
            }`}>
              {response.purchaseIntent}/10
            </span>
          </div>
          <div>
            <span className="text-white-muted">Credibility: </span>
            <span className={`font-bold ${
              response.credibilityRating >= 7 ? 'text-green-500' :
              response.credibilityRating >= 5 ? 'text-yellow-electric' : 'text-red-hot'
            }`}>
              {response.credibilityRating}/10
            </span>
          </div>
          <div>
            <span className="text-white-muted">Feeling: </span>
            <span className="font-bold text-orange-accent">{response.emotionalResponse}</span>
          </div>
        </div>
      </div>

      {/* Three views */}
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        {/* Gut Reaction */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-red-hot" />
            <span className="text-xs text-red-hot font-bold uppercase tracking-wider">
              Gut Reaction
            </span>
          </div>
          <p className="text-sm text-white-full italic">
            &ldquo;{response.gutReaction}&rdquo;
          </p>
        </div>

        {/* Social Response */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500 font-bold uppercase tracking-wider">
              Public View
            </span>
          </div>
          <p className="text-sm text-white-full italic">
            &ldquo;{response.socialResponse}&rdquo;
          </p>
        </div>

        {/* Private Thought */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-purple-500 font-bold uppercase tracking-wider">
              Private Truth
            </span>
          </div>
          <p className="text-sm text-white-full italic">
            &ldquo;{response.privateThought}&rdquo;
          </p>
        </div>
      </div>

      {/* Gap analysis */}
      {gapAnalysis.hasGap && (
        <div className="p-3 bg-yellow-electric/10 border-t border-yellow-electric/30">
          <p className="text-xs text-yellow-electric">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {gapAnalysis.description}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Summary of gaps across all personas
 */
function GapSummary({ responses }: { responses: TriangulationData[] }) {
  const analysis = useMemo(() => {
    const gaps = responses.map(r => ({
      persona: r.personaName,
      ...analyzeSayDoGap(r)
    }))

    const withGaps = gaps.filter(g => g.hasGap)
    const aligned = gaps.filter(g => !g.hasGap)

    return {
      total: responses.length,
      withGaps: withGaps.length,
      aligned: aligned.length,
      gapRate: Math.round((withGaps.length / responses.length) * 100),
      highSeverity: withGaps.filter(g => g.gapSeverity === 'high'),
      positiveGaps: withGaps.filter(g => g.gapType === 'positive_gap'),
      negativeGaps: withGaps.filter(g => g.gapType === 'negative_gap')
    }
  }, [responses])

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-black-deep border border-border-subtle p-4 text-center">
        <div className="text-2xl font-bold text-white-full">{analysis.total}</div>
        <div className="text-xs text-white-muted">Total Personas</div>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 p-4 text-center">
        <div className="text-2xl font-bold text-green-500">{analysis.aligned}</div>
        <div className="text-xs text-white-muted">Aligned Views</div>
      </div>

      <div className="bg-yellow-electric/10 border border-yellow-electric/30 p-4 text-center">
        <div className="text-2xl font-bold text-yellow-electric">{analysis.withGaps}</div>
        <div className="text-xs text-white-muted">Say/Do Gaps</div>
      </div>

      <div className="bg-red-hot/10 border border-red-hot/30 p-4 text-center">
        <div className="text-2xl font-bold text-red-hot">{analysis.gapRate}%</div>
        <div className="text-xs text-white-muted">Gap Rate</div>
      </div>
    </div>
  )
}

/**
 * Main Triangulation View component
 */
export function TriangulationView({ responses }: TriangulationViewProps) {
  // Sort by those with gaps first
  const sortedResponses = useMemo(() => {
    return [...responses].sort((a, b) => {
      const aGap = analyzeSayDoGap(a).hasGap ? 0 : 1
      const bGap = analyzeSayDoGap(b).hasGap ? 0 : 1
      return aGap - bGap
    })
  }, [responses])

  if (responses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-red-hot" />
          Triangulation View
        </CardTitle>
        <p className="text-sm text-white-muted">
          Compare gut reactions, public statements, and private thoughts to reveal say/do gaps
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <GapSummary responses={responses} />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-white-muted pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-red-hot" />
            <span>Gut = Immediate reaction</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-green-500" />
            <span>Public = What they&apos;d say in a group</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-purple-500" />
            <span>Private = What they really think</span>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {sortedResponses.map((response, index) => (
            <TriangulationCard key={index} response={response} />
          ))}
        </div>

        {/* Insights */}
        <div className="bg-black-deep border border-border-subtle p-4 mt-4">
          <h4 className="text-sm font-bold text-white-full mb-2">What This Means</h4>
          <ul className="text-sm text-white-muted space-y-1">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-green-500">Aligned views</strong> indicate genuine reactions - what they say publicly reflects their true feelings.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-yellow-electric rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-yellow-electric">Say/do gaps</strong> suggest social desirability bias - they may not act on what they say in focus groups.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <strong className="text-purple-500">Private thoughts</strong> are the best predictor of actual behavior - pay attention to these.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
