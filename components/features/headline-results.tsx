'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react'

interface HeadlineRanking {
  index: number
  headline: string
  avgScore: number
  topPicks: number
  bottomPicks: number
  winnerPicks: number
}

interface HeadlineWinner {
  index: number
  headline: string
  avgScore: number
  margin: number
}

interface SegmentInsight {
  archetype: string
  topPick: number
  reasoning: string
}

interface VerbatimHighlight {
  personaName: string
  archetype: string
  quote: string
  topic: 'winner' | 'concern' | 'general'
}

interface HeadlineResultsData {
  type: 'headline_test'
  headlines: string[]
  rankings: HeadlineRanking[]
  winner: HeadlineWinner
  consensus: 'strong' | 'moderate' | 'weak'
  segmentInsights: SegmentInsight[]
  verbatimHighlights?: VerbatimHighlight[]
}

interface HeadlineResultsProps {
  data: HeadlineResultsData
  totalResponses: number
}

function getConsensusColor(consensus: string): string {
  switch (consensus) {
    case 'strong':
      return 'bg-green-500/20 text-green-400 border-green-500'
    case 'moderate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    case 'weak':
      return 'bg-red-500/20 text-red-400 border-red-500'
    default:
      return 'bg-muted text-muted-foreground border-muted'
  }
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-green-400'
  if (score >= 5) return 'text-yellow-400'
  return 'text-red-400'
}

export function HeadlineResults({ data, totalResponses }: HeadlineResultsProps) {
  const { rankings, winner, consensus, segmentInsights, headlines, verbatimHighlights = [] } = data

  const topThree = rankings.slice(0, 3)
  const bottomThree = rankings.slice(-3).reverse()

  return (
    <div className="space-y-6">
      {/* Winner Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <CardTitle>Winning Headline</CardTitle>
            <Badge className={getConsensusColor(consensus)}>
              {consensus} consensus
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border-2 border-primary">
              <p className="text-xl font-bold">#{winner.index}</p>
              <p className="text-lg mt-2">&ldquo;{winner.headline}&rdquo;</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{winner.avgScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold">+{winner.margin.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">vs #2</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{totalResponses}</p>
                <p className="text-sm text-muted-foreground">Panelists</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verbatim Highlights */}
      {verbatimHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verbatim Highlights</CardTitle>
            <CardDescription>Direct feedback on specific headlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {verbatimHighlights.map((highlight, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${
                  highlight.topic === 'winner' ? 'border-green-500 bg-green-500/5' :
                  highlight.topic === 'concern' ? 'border-red-500 bg-red-500/5' :
                  'border-blue-500 bg-blue-500/5'
                }`}>
                  <p className="text-sm italic mb-2">&ldquo;{highlight.quote}&rdquo;</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{highlight.personaName}</span>
                    <span className="uppercase tracking-wider">{highlight.archetype}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>All {headlines.length} headlines ranked by average score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankings.map((item, i) => (
              <div
                key={item.index}
                className={`flex items-center gap-4 p-3 border ${
                  i === 0 ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span className="font-mono text-lg w-8 text-center font-bold">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">
                    <span className="text-muted-foreground">#{item.index}:</span> {item.headline}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{item.topPicks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span>{item.bottomPicks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span>{item.winnerPicks}</span>
                  </div>
                  <span className={`font-bold text-lg ${getScoreColor(item.avgScore)}`}>
                    {item.avgScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-6 text-xs text-muted-foreground justify-end">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Top 3 picks
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Bottom 3 picks
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" /> #1 picks
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top & Bottom */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topThree.map((item, i) => (
                <div key={item.index} className="flex items-start gap-3">
                  <span className="text-2xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <p className="font-medium">#{item.index}: &ldquo;{item.headline}&rdquo;</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {item.avgScore.toFixed(1)} • {item.winnerPicks} first-place votes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <CardTitle className="text-lg">Lowest Performers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomThree.map((item) => (
                <div key={item.index} className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-medium">#{item.index}: &ldquo;{item.headline}&rdquo;</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {item.avgScore.toFixed(1)} • {item.bottomPicks} bottom-3 votes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Insights */}
      {segmentInsights.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Segment Preferences</CardTitle>
            </div>
            <CardDescription>Which headline each segment preferred</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {segmentInsights.map((insight, i) => (
                <div key={i} className="p-3 border border-border">
                  <p className="font-medium text-sm">{insight.archetype}</p>
                  <p className="text-primary font-bold">
                    Preferred #{insight.topPick}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    &ldquo;{insight.reasoning}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
