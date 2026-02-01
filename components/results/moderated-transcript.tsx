'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Search,
  Download,
  Clock,
  Lightbulb,
  RefreshCw
} from 'lucide-react'

/**
 * Conversation turn from the moderated focus group
 */
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

interface ModeratedTranscriptProps {
  turns: ConversationTurn[]
  stimulus: string
  stimulusType: string
  testName: string
  testDate: string
  moderationUsed: boolean
  moderationImpact?: {
    personasClarified: number
    viewShifts: Array<{
      persona: string
      metricName: string
      before: number
      after: number
    }>
    salvageRate: number
  }
}

/**
 * Format turn type for display
 */
function formatTurnType(turnType: string): string {
  const labels: Record<string, string> = {
    introduction: 'Introduction',
    initial_response: 'Initial Response',
    probe: 'Probing Question',
    follow_up: 'Follow-up',
    clarification: 'Context Provided',
    revised_response: 'Revised View',
    draw_out: 'Inviting Response',
    closing: 'Closing'
  }
  return labels[turnType] || turnType
}

/**
 * Get color for turn type
 */
function getTurnColor(turnType: string, speakerType: string): string {
  if (speakerType === 'moderator') {
    if (turnType === 'clarification') return 'border-yellow-electric/50 bg-yellow-electric/5'
    return 'border-blue-500/30 bg-blue-500/5'
  }

  if (turnType === 'revised_response') return 'border-green-500/30 bg-green-500/5'
  return 'border-border-subtle bg-black-deep'
}

/**
 * Individual turn component
 */
function TurnBubble({ turn, showMetrics }: { turn: ConversationTurn; showMetrics?: boolean }) {
  const isModerator = turn.speaker_type === 'moderator'
  const colorClass = getTurnColor(turn.turn_type, turn.speaker_type)

  return (
    <div className={`p-4 border ${colorClass} ${isModerator ? 'ml-0 mr-12' : 'ml-12 mr-0'}`}>
      {/* Speaker header */}
      <div className="flex items-center gap-2 mb-2">
        {isModerator ? (
          <User className="h-4 w-4 text-blue-500" />
        ) : (
          <div className="w-6 h-6 border border-red-hot bg-red-hot/10 flex items-center justify-center text-red-hot text-xs font-bold">
            {turn.speaker_name.charAt(0)}
          </div>
        )}
        <span className={`font-bold text-sm ${isModerator ? 'text-blue-500' : 'text-white-full'}`}>
          {turn.speaker_name}
        </span>
        {turn.archetype_slug && (
          <Badge variant="outline" className="text-xs border-orange-accent text-orange-accent">
            {turn.archetype_slug}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={`text-xs ml-auto ${
            turn.turn_type === 'clarification'
              ? 'border-yellow-electric text-yellow-electric'
              : turn.turn_type === 'revised_response'
              ? 'border-green-500 text-green-500'
              : 'border-white-muted text-white-muted'
          }`}
        >
          {turn.is_revised && <RefreshCw className="h-3 w-3 mr-1 inline" />}
          {formatTurnType(turn.turn_type)}
        </Badge>
      </div>

      {/* Content */}
      <p className={`text-sm ${isModerator ? 'text-white-muted' : 'text-white-full'}`}>
        {isModerator ? turn.content : `"${turn.content}"`}
      </p>

      {/* Metrics for persona responses */}
      {showMetrics && turn.response_data && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-border-subtle text-xs">
          {turn.response_data.purchase_intent && (
            <div className="flex items-center gap-1">
              <span className="text-white-muted">Intent:</span>
              <span
                className={`font-bold ${
                  turn.response_data.purchase_intent >= 7
                    ? 'text-green-500'
                    : turn.response_data.purchase_intent >= 4
                    ? 'text-yellow-electric'
                    : 'text-red-hot'
                }`}
              >
                {turn.response_data.purchase_intent}/10
              </span>
            </div>
          )}
          {turn.response_data.credibility_rating && (
            <div className="flex items-center gap-1">
              <span className="text-white-muted">Credibility:</span>
              <span
                className={`font-bold ${
                  turn.response_data.credibility_rating >= 7
                    ? 'text-green-500'
                    : turn.response_data.credibility_rating >= 4
                    ? 'text-yellow-electric'
                    : 'text-red-hot'
                }`}
              >
                {turn.response_data.credibility_rating}/10
              </span>
            </div>
          )}
          {turn.response_data.emotional_response && (
            <div className="flex items-center gap-1">
              <span className="text-white-muted">Feeling:</span>
              <span className="font-bold text-orange-accent">
                {turn.response_data.emotional_response}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Moderation impact summary component
 */
function ModerationImpactSummary({
  impact
}: {
  impact: ModeratedTranscriptProps['moderationImpact']
}) {
  if (!impact || impact.personasClarified === 0) return null

  return (
    <div className="bg-yellow-electric/10 border border-yellow-electric/30 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-yellow-electric" />
        <h4 className="font-bold text-yellow-electric">Moderation Impact</h4>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-white-muted">Personas Clarified</p>
          <p className="text-2xl font-bold text-white-full">{impact.personasClarified}</p>
        </div>
        <div>
          <p className="text-white-muted">Views Shifted</p>
          <p className="text-2xl font-bold text-white-full">{impact.viewShifts.length}</p>
        </div>
        <div>
          <p className="text-white-muted">Salvage Rate</p>
          <p className="text-2xl font-bold text-green-500">{impact.salvageRate}%</p>
        </div>
      </div>
      {impact.viewShifts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-yellow-electric/30">
          <p className="text-xs text-white-muted mb-2">View changes after context:</p>
          <div className="space-y-1">
            {impact.viewShifts.map((shift, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-white-full">{shift.persona}</span>
                <span className="text-white-muted">{shift.metricName}:</span>
                <span className="text-red-hot">{shift.before}</span>
                <span className="text-white-muted">→</span>
                <span className={shift.after > shift.before ? 'text-green-500' : 'text-red-hot'}>
                  {shift.after}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Main moderated transcript component
 */
export function ModeratedTranscript({
  turns,
  stimulus,
  stimulusType,
  testName,
  testDate,
  moderationUsed,
  moderationImpact
}: ModeratedTranscriptProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMetrics, setShowMetrics] = useState(true)

  // Filter turns by search query
  const filteredTurns = useMemo(() => {
    if (!searchQuery.trim()) return turns

    const query = searchQuery.toLowerCase()
    return turns.filter(
      turn =>
        turn.content.toLowerCase().includes(query) ||
        turn.speaker_name.toLowerCase().includes(query) ||
        (turn.archetype_slug && turn.archetype_slug.toLowerCase().includes(query))
    )
  }, [turns, searchQuery])

  // Calculate simulated duration (turns * ~30 seconds each)
  const estimatedDuration = Math.ceil((turns.length * 30) / 60)

  const handleExport = () => {
    // Generate transcript text
    const header = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOCUS GROUP TRANSCRIPT
Test: "${testName}"
Date: ${testDate} | Duration: ~${estimatedDuration} mins simulated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STIMULUS SHOWN:
${stimulus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const transcript = turns
      .map(turn => {
        const prefix = turn.speaker_type === 'moderator' ? 'MODERATOR' : turn.speaker_name.toUpperCase()
        const archetype = turn.archetype_slug ? ` (${turn.archetype_slug})` : ''
        return `${prefix}${archetype}:\n${turn.content}\n`
      })
      .join('\n')

    const fullText = header + transcript

    // Download as text file
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${testName.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (turns.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-hot" />
              Focus Group Transcript
              {moderationUsed && (
                <Badge className="bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50">
                  AI Moderated
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 mt-1 text-sm text-white-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                ~{estimatedDuration} mins simulated
              </span>
              <span>{turns.length} turns</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white-muted hover:text-red-hot"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Moderation impact summary */}
          {moderationUsed && <ModerationImpactSummary impact={moderationImpact} />}

          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white-muted" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
              className={showMetrics ? 'border-red-hot text-red-hot' : ''}
            >
              {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            </Button>
          </div>

          {/* Stimulus shown */}
          <div className="bg-red-hot/5 border border-red-hot/30 p-4">
            <p className="text-xs text-red-hot mb-2 font-bold uppercase tracking-wider">
              Stimulus Shown: {stimulusType}
            </p>
            <p className="text-sm text-white-muted">{stimulus}</p>
          </div>

          {/* Conversation turns */}
          <div className="space-y-3">
            {filteredTurns.map(turn => (
              <TurnBubble key={turn.turn_number} turn={turn} showMetrics={showMetrics} />
            ))}
          </div>

          {searchQuery && filteredTurns.length === 0 && (
            <p className="text-center text-white-muted py-4">
              No turns match &ldquo;{searchQuery}&rdquo;
            </p>
          )}

          {searchQuery && filteredTurns.length > 0 && filteredTurns.length < turns.length && (
            <p className="text-center text-white-muted text-sm">
              Showing {filteredTurns.length} of {turns.length} turns
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
