'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Grid3X3 } from 'lucide-react'

interface PersonaMetrics {
  archetypeSlug: string
  archetypeName: string
  purchaseIntent: number
  credibilityRating: number
  emotionalResponse: string
  personaName: string
}

interface SegmentHeatmapProps {
  responses: PersonaMetrics[]
}

/**
 * Get color class based on score (1-10 scale)
 */
function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-green-500/60'
  if (score >= 5) return 'bg-yellow-electric'
  if (score >= 4) return 'bg-orange-accent'
  if (score >= 3) return 'bg-red-hot/70'
  return 'bg-red-hot'
}

/**
 * Get text color for contrast
 */
function getTextColor(score: number): string {
  if (score >= 6) return 'text-black'
  return 'text-white'
}

/**
 * Get color for emotional response
 */
function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    excited: 'bg-green-500',
    interested: 'bg-green-500/60',
    neutral: 'bg-yellow-electric',
    skeptical: 'bg-orange-accent',
    dismissive: 'bg-red-hot/70',
    hostile: 'bg-red-hot'
  }
  return colors[emotion] || 'bg-gray-500'
}

/**
 * Get emotion text color
 */
function getEmotionTextColor(emotion: string): string {
  if (['excited', 'interested'].includes(emotion)) return 'text-black'
  return 'text-white'
}

/**
 * Heatmap cell component
 */
function HeatmapCell({
  value,
  label,
  colorClass,
  textColorClass,
  tooltip
}: {
  value: string | number
  label: string
  colorClass: string
  textColorClass: string
  tooltip: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${colorClass} ${textColorClass} p-2 text-center cursor-default transition-transform hover:scale-105`}
          >
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs opacity-80 truncate">{label}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Row for a single archetype
 */
function ArchetypeRow({ response }: { response: PersonaMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {/* Archetype name */}
      <div className="bg-black-deep border border-border-subtle p-2 flex items-center">
        <div>
          <div className="font-bold text-sm text-white-full truncate">{response.archetypeName}</div>
          <div className="text-xs text-white-muted truncate">{response.personaName}</div>
        </div>
      </div>

      {/* Purchase Intent */}
      <HeatmapCell
        value={response.purchaseIntent}
        label="Intent"
        colorClass={getScoreColor(response.purchaseIntent)}
        textColorClass={getTextColor(response.purchaseIntent)}
        tooltip={`${response.personaName} would buy: ${response.purchaseIntent}/10`}
      />

      {/* Credibility */}
      <HeatmapCell
        value={response.credibilityRating}
        label="Credibility"
        colorClass={getScoreColor(response.credibilityRating)}
        textColorClass={getTextColor(response.credibilityRating)}
        tooltip={`${response.personaName} believability: ${response.credibilityRating}/10`}
      />

      {/* Emotional Response */}
      <HeatmapCell
        value={response.emotionalResponse.charAt(0).toUpperCase() + response.emotionalResponse.slice(1)}
        label="Emotion"
        colorClass={getEmotionColor(response.emotionalResponse)}
        textColorClass={getEmotionTextColor(response.emotionalResponse)}
        tooltip={`${response.personaName} feels: ${response.emotionalResponse}`}
      />
    </div>
  )
}

/**
 * Summary row showing averages
 */
function SummaryRow({ responses }: { responses: PersonaMetrics[] }) {
  const avgIntent =
    responses.reduce((sum, r) => sum + r.purchaseIntent, 0) / responses.length
  const avgCredibility =
    responses.reduce((sum, r) => sum + r.credibilityRating, 0) / responses.length

  // Count emotions
  const emotionCounts = responses.reduce(
    (acc, r) => {
      acc[r.emotionalResponse] = (acc[r.emotionalResponse] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'

  return (
    <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-border-subtle">
      <div className="bg-black-deep border border-red-hot/50 p-2 flex items-center">
        <div className="font-bold text-sm text-red-hot">AVERAGE</div>
      </div>

      <HeatmapCell
        value={avgIntent.toFixed(1)}
        label="Intent"
        colorClass={getScoreColor(avgIntent)}
        textColorClass={getTextColor(avgIntent)}
        tooltip={`Average purchase intent: ${avgIntent.toFixed(1)}/10`}
      />

      <HeatmapCell
        value={avgCredibility.toFixed(1)}
        label="Credibility"
        colorClass={getScoreColor(avgCredibility)}
        textColorClass={getTextColor(avgCredibility)}
        tooltip={`Average credibility: ${avgCredibility.toFixed(1)}/10`}
      />

      <HeatmapCell
        value={dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}
        label="Dominant"
        colorClass={getEmotionColor(dominantEmotion)}
        textColorClass={getEmotionTextColor(dominantEmotion)}
        tooltip={`Most common emotion: ${dominantEmotion}`}
      />
    </div>
  )
}

/**
 * Legend component
 */
function HeatmapLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-white-muted">
      <div className="flex items-center gap-2">
        <span>Score:</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-red-hot" title="1-2" />
          <div className="w-4 h-4 bg-red-hot/70" title="3" />
          <div className="w-4 h-4 bg-orange-accent" title="4" />
          <div className="w-4 h-4 bg-yellow-electric" title="5" />
          <div className="w-4 h-4 bg-green-500/60" title="6-7" />
          <div className="w-4 h-4 bg-green-500" title="8-10" />
        </div>
        <span className="text-white-muted">Low → High</span>
      </div>
    </div>
  )
}

/**
 * Main Segment Heatmap component
 */
export function SegmentHeatmap({ responses }: SegmentHeatmapProps) {
  // Sort responses by archetype name for consistent display
  const sortedResponses = useMemo(
    () => [...responses].sort((a, b) => a.archetypeName.localeCompare(b.archetypeName)),
    [responses]
  )

  // Identify segments that love/hate the concept
  const segments = useMemo(() => {
    const lovers = sortedResponses.filter(r => r.purchaseIntent >= 7 && r.credibilityRating >= 6)
    const haters = sortedResponses.filter(r => r.purchaseIntent <= 4 || r.credibilityRating <= 4)
    const neutral = sortedResponses.filter(
      r => !lovers.includes(r) && !haters.includes(r)
    )

    return { lovers, haters, neutral }
  }, [sortedResponses])

  if (responses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-red-hot" />
          Segment Heatmap
        </CardTitle>
        <p className="text-sm text-white-muted">
          Quick view of how each persona segment responded
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segment summary badges */}
        <div className="flex flex-wrap gap-2">
          {segments.lovers.length > 0 && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
              {segments.lovers.length} Enthusiast{segments.lovers.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {segments.neutral.length > 0 && (
            <Badge className="bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50">
              {segments.neutral.length} On the fence
            </Badge>
          )}
          {segments.haters.length > 0 && (
            <Badge className="bg-red-hot/20 text-red-hot border-red-hot/50">
              {segments.haters.length} Skeptic{segments.haters.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-4 gap-1 text-xs text-white-muted font-bold">
          <div className="p-2">SEGMENT</div>
          <div className="p-2 text-center">PURCHASE INTENT</div>
          <div className="p-2 text-center">CREDIBILITY</div>
          <div className="p-2 text-center">EMOTION</div>
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {sortedResponses.map((response, index) => (
            <ArchetypeRow key={index} response={response} />
          ))}
        </div>

        {/* Summary row */}
        <SummaryRow responses={sortedResponses} />

        {/* Legend */}
        <HeatmapLegend />
      </CardContent>
    </Card>
  )
}
