'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, TrendingDown, Minus, RefreshCw, Users } from 'lucide-react'

interface ViewShift {
  persona: string
  archetypeSlug: string
  metricName: string
  before: number
  after: number
}

interface ModerationImpactData {
  personasClarified: number
  viewShifts: ViewShift[]
  salvageRate: number
}

interface BeforeAfterResponse {
  personaName: string
  archetypeSlug: string
  initial: {
    gutReaction: string
    purchaseIntent: number
    credibilityRating: number
    emotionalResponse: string
  }
  revised?: {
    consideredView: string
    purchaseIntent: number
    credibilityRating: number
    emotionalResponse: string
  }
  receivedClarification: boolean
  clarificationProvided?: string
}

interface ModerationImpactProps {
  impact: ModerationImpactData
  beforeAfterResponses: BeforeAfterResponse[]
}

/**
 * Calculate the change indicator
 */
function getChangeIndicator(before: number, after: number) {
  const diff = after - before
  if (diff > 0) {
    return {
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: `+${diff}`
    }
  }
  if (diff < 0) {
    return {
      icon: TrendingDown,
      color: 'text-red-hot',
      bgColor: 'bg-red-hot/10',
      label: `${diff}`
    }
  }
  return {
    icon: Minus,
    color: 'text-white-muted',
    bgColor: 'bg-white-muted/10',
    label: '0'
  }
}

/**
 * Score display component
 */
function ScoreDisplay({
  label,
  before,
  after,
  showChange = true
}: {
  label: string
  before: number
  after?: number
  showChange?: boolean
}) {
  const hasRevision = after !== undefined
  const change = hasRevision ? getChangeIndicator(before, after) : null

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white-muted">{label}:</span>
      <span className="text-sm font-bold text-white-full">{before}</span>
      {hasRevision && showChange && (
        <>
          <span className="text-white-muted">→</span>
          <span className={`text-sm font-bold ${change!.color}`}>{after}</span>
          {change!.label !== '0' && (
            <span className={`text-xs ${change!.color}`}>({change!.label})</span>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Before/After comparison card
 */
function BeforeAfterCard({ response }: { response: BeforeAfterResponse }) {
  const hasRevision = response.revised && response.receivedClarification

  // Calculate overall change
  const intentChange = hasRevision
    ? response.revised!.purchaseIntent - response.initial.purchaseIntent
    : 0
  const credChange = hasRevision
    ? response.revised!.credibilityRating - response.initial.credibilityRating
    : 0

  const netChange = intentChange + credChange
  const wasSalvaged = netChange > 0

  return (
    <div
      className={`border p-4 ${
        hasRevision
          ? wasSalvaged
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-yellow-electric/30 bg-yellow-electric/5'
          : 'border-border-subtle bg-black-deep'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-red-hot bg-red-hot/10 flex items-center justify-center text-red-hot font-bold text-sm">
            {response.personaName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-sm text-white-full">{response.personaName}</div>
            <div className="text-xs text-white-muted">{response.archetypeSlug}</div>
          </div>
        </div>
        {hasRevision && (
          <Badge
            className={`${
              wasSalvaged
                ? 'bg-green-500/20 text-green-500 border-green-500/50'
                : 'bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50'
            }`}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {wasSalvaged ? 'Salvaged' : 'Unchanged'}
          </Badge>
        )}
      </div>

      {/* Initial Response */}
      <div className="mb-3">
        <div className="text-xs text-white-muted uppercase tracking-wider mb-1">Initial Reaction</div>
        <p className="text-sm text-white-full italic">&ldquo;{response.initial.gutReaction}&rdquo;</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <ScoreDisplay
            label="Intent"
            before={response.initial.purchaseIntent}
            after={response.revised?.purchaseIntent}
            showChange={hasRevision}
          />
          <ScoreDisplay
            label="Credibility"
            before={response.initial.credibilityRating}
            after={response.revised?.credibilityRating}
            showChange={hasRevision}
          />
        </div>
      </div>

      {/* Clarification provided */}
      {response.clarificationProvided && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30">
          <div className="text-xs text-blue-500 uppercase tracking-wider mb-1">
            Moderator Context
          </div>
          <p className="text-xs text-white-muted">{response.clarificationProvided}</p>
        </div>
      )}

      {/* Revised Response */}
      {hasRevision && (
        <div className="pt-3 border-t border-border-subtle">
          <div className="text-xs text-green-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            After Context
          </div>
          <p className="text-sm text-white-full italic">
            &ldquo;{response.revised!.consideredView}&rdquo;
          </p>
        </div>
      )}

      {/* No revision note */}
      {!hasRevision && response.receivedClarification && (
        <div className="pt-3 border-t border-border-subtle text-sm text-white-muted italic">
          View unchanged after clarification
        </div>
      )}
    </div>
  )
}

/**
 * Summary statistics
 */
function ImpactSummary({ impact }: { impact: ModerationImpactData }) {
  const positiveShifts = impact.viewShifts.filter(s => s.after > s.before).length
  const negativeShifts = impact.viewShifts.filter(s => s.after < s.before).length
  const unchangedShifts = impact.viewShifts.filter(s => s.after === s.before).length

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-black-deep border border-border-subtle p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Users className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-white-full">{impact.personasClarified}</div>
        <div className="text-xs text-white-muted">Clarified</div>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-green-500">{positiveShifts}</div>
        <div className="text-xs text-white-muted">Improved</div>
      </div>

      <div className="bg-yellow-electric/10 border border-yellow-electric/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Minus className="h-4 w-4 text-yellow-electric" />
        </div>
        <div className="text-2xl font-bold text-yellow-electric">{unchangedShifts}</div>
        <div className="text-xs text-white-muted">Unchanged</div>
      </div>

      <div className="bg-red-hot/10 border border-red-hot/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingDown className="h-4 w-4 text-red-hot" />
        </div>
        <div className="text-2xl font-bold text-red-hot">{negativeShifts}</div>
        <div className="text-xs text-white-muted">Declined</div>
      </div>
    </div>
  )
}

/**
 * Main Moderation Impact component
 */
export function ModerationImpact({ impact, beforeAfterResponses }: ModerationImpactProps) {
  // Filter to only show personas who received clarification
  const clarifiedResponses = useMemo(
    () => beforeAfterResponses.filter(r => r.receivedClarification),
    [beforeAfterResponses]
  )

  if (!impact || impact.personasClarified === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-red-hot" />
            Moderation Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white-muted text-sm">
            No moderation was needed for this test. Personas understood the creative intent without clarification.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-electric" />
            Moderation Impact
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-500 border-green-500/50 text-lg px-3 py-1">
            {impact.salvageRate}% Salvage Rate
          </Badge>
        </div>
        <p className="text-sm text-white-muted">
          How providing creative context changed persona views
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <ImpactSummary impact={impact} />

        {/* Before/After cards */}
        <div>
          <h4 className="text-sm font-bold text-white-full mb-3">
            Before & After Comparison
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {clarifiedResponses.map((response, index) => (
              <BeforeAfterCard key={index} response={response} />
            ))}
          </div>
        </div>

        {/* View shifts detail */}
        {impact.viewShifts.length > 0 && (
          <div className="border-t border-border-subtle pt-4">
            <h4 className="text-sm font-bold text-white-full mb-3">All View Shifts</h4>
            <div className="space-y-2">
              {impact.viewShifts.map((shift, index) => {
                const change = getChangeIndicator(shift.before, shift.after)
                const ChangeIcon = change.icon

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 ${change.bgColor} border border-border-subtle`}
                  >
                    <ChangeIcon className={`h-4 w-4 ${change.color}`} />
                    <span className="text-sm text-white-full">{shift.persona}</span>
                    <span className="text-xs text-white-muted">{shift.metricName}</span>
                    <span className="text-sm">
                      {shift.before} → <span className={change.color}>{shift.after}</span>
                    </span>
                    <span className={`text-sm font-bold ${change.color}`}>
                      ({change.label})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-black-deep border border-border-subtle p-4">
          <h4 className="text-sm font-bold text-white-full mb-2">Key Takeaway</h4>
          <p className="text-sm text-white-muted">
            {impact.salvageRate >= 50 ? (
              <>
                The creative approach resonated better once context was provided.{' '}
                <span className="text-green-500">
                  {impact.salvageRate}% of personas improved their view
                </span>{' '}
                after understanding the intent.
              </>
            ) : impact.salvageRate > 0 ? (
              <>
                Context helped some personas, but{' '}
                <span className="text-yellow-electric">
                  {100 - impact.salvageRate}% maintained their concerns
                </span>{' '}
                even after clarification. Consider revising the creative approach.
              </>
            ) : (
              <>
                Personas{' '}
                <span className="text-red-hot">
                  did not change their view
                </span>{' '}
                even with context. The concerns may be fundamental rather than interpretation issues.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
