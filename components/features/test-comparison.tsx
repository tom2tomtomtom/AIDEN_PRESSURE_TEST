'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface TestResult {
  id: string
  name: string
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  one_line_verdict?: string
  created_at: string
}

interface TestComparisonProps {
  testA: TestResult
  testB: TestResult
}

function DeltaIndicator({ value }: { value: number }) {
  const isPositive = value > 0
  const isNeutral = value === 0

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-bold ${
        isNeutral
          ? 'text-muted-foreground'
          : isPositive
          ? 'text-green-500'
          : 'text-red-500'
      }`}
    >
      {isPositive && <ArrowUp className="h-4 w-4" />}
      {!isPositive && !isNeutral && <ArrowDown className="h-4 w-4" />}
      {isNeutral && <Minus className="h-4 w-4" />}
      {isPositive && '+'}
      {value}
    </span>
  )
}

function ScoreComparisonCard({
  label,
  scoreA,
  scoreB,
  description,
}: {
  label: string
  scoreA: number
  scoreB: number
  description: string
}) {
  const delta = scoreB - scoreA
  const isImproved = delta > 0
  const isUnchanged = delta === 0

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="border-border-subtle">
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{label}</div>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(scoreA)}`}>{scoreA}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Test A</div>
          </div>

          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                isUnchanged ? 'text-muted-foreground' : isImproved ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isImproved ? '↑' : isUnchanged ? '=' : '↓'}
            </div>
            <DeltaIndicator value={delta} />
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(scoreB)}`}>{scoreB}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Test B</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

export function TestComparison({ testA, testB }: TestComparisonProps) {
  const analysis = useMemo(() => {
    const scoreDelta = {
      pressureScore: testB.pressure_score - testA.pressure_score,
      gutIndex: testB.gut_attraction_index - testA.gut_attraction_index,
      credibilityScore: testB.credibility_score - testA.credibility_score,
    }

    const improvedAreas: string[] = []
    const declinedAreas: string[] = []

    if (scoreDelta.pressureScore > 5) improvedAreas.push('Overall pressure score')
    else if (scoreDelta.pressureScore < -5) declinedAreas.push('Overall pressure score')

    if (scoreDelta.gutIndex > 5) improvedAreas.push('Emotional appeal')
    else if (scoreDelta.gutIndex < -5) declinedAreas.push('Emotional appeal')

    if (scoreDelta.credibilityScore > 5) improvedAreas.push('Credibility')
    else if (scoreDelta.credibilityScore < -5) declinedAreas.push('Credibility')

    return { scoreDelta, improvedAreas, declinedAreas }
  }, [testA, testB])

  return (
    <div className="space-y-6">
      {/* Test Headers */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border-subtle">
          <CardContent className="pt-6">
            <Badge variant="outline" className="mb-2">Test A</Badge>
            <h3 className="font-bold text-lg">{testA.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(testA.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardContent className="pt-6">
            <Badge className="mb-2">Test B (Latest)</Badge>
            <h3 className="font-bold text-lg">{testB.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(testB.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreComparisonCard
          label="Pressure Score"
          scoreA={testA.pressure_score}
          scoreB={testB.pressure_score}
          description="Overall marketing effectiveness"
        />
        <ScoreComparisonCard
          label="Gut Index"
          scoreA={testA.gut_attraction_index}
          scoreB={testB.gut_attraction_index}
          description="Emotional resonance"
        />
        <ScoreComparisonCard
          label="Credibility"
          scoreA={testA.credibility_score}
          scoreB={testB.credibility_score}
          description="Trust & believability"
        />
      </div>

      {/* Key Differences */}
      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Key Differences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.improvedAreas.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wide text-green-500">Improved</span>
              <ul className="mt-2 space-y-1">
                {analysis.improvedAreas.map((area, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.declinedAreas.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wide text-red-500">Declined</span>
              <ul className="mt-2 space-y-1">
                {analysis.declinedAreas.map((area, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.improvedAreas.length === 0 && analysis.declinedAreas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No significant differences detected (changes within ±5 points).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Verdicts Comparison */}
      {(testA.one_line_verdict || testB.one_line_verdict) && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-lg">Verdict Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black-deep border border-border-subtle">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Test A</span>
                <p className="mt-2 text-sm italic text-muted-foreground">
                  {testA.one_line_verdict || 'No verdict available'}
                </p>
              </div>
              <div className="p-4 bg-black-deep border border-primary">
                <span className="text-xs uppercase tracking-wide text-primary">Test B</span>
                <p className="mt-2 text-sm italic text-muted-foreground">
                  {testB.one_line_verdict || 'No verdict available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
