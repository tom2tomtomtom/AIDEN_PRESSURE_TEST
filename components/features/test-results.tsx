'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TestResult {
  id: string
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  analysis_summary: string
  key_strengths: string[]
  key_weaknesses: string[]
  recommendations: Array<{
    priority: 'must_fix' | 'should_improve' | 'nice_to_have'
    recommendation: string
    rationale: string
  }>
  friction_points: string[]
  credibility_gaps: string[]
  created_at: string
}

interface TestResultsProps {
  results: TestResult
}

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
            className="text-muted"
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
          <span className="text-2xl font-bold">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  if (score >= 30) return 'text-orange-500'
  return 'text-red-500'
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'must_fix':
      return 'bg-red-100 text-red-800'
    case 'should_improve':
      return 'bg-yellow-100 text-yellow-800'
    case 'nice_to_have':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function TestResults({ results }: TestResultsProps) {
  // Provide defaults for optional arrays
  const keyStrengths = results.key_strengths || []
  const keyWeaknesses = results.key_weaknesses || []
  const frictionPoints = results.friction_points || []
  const credibilityGaps = results.credibility_gaps || []
  const recommendations = results.recommendations || []

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

      {/* Summary */}
      {results.analysis_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{results.analysis_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(keyStrengths.length > 0 || keyWeaknesses.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {keyStrengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {keyStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">+</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {keyWeaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Key Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {keyWeaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">-</span>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Friction Points & Credibility Gaps */}
      {(frictionPoints.length > 0 || credibilityGaps.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {frictionPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Friction Points</CardTitle>
                <CardDescription>Where consumers hesitate</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {frictionPoints.map((point, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {credibilityGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credibility Gaps</CardTitle>
                <CardDescription>Where trust breaks down</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {credibilityGaps.map((gap, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {gap}</li>
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
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority.replace('_', ' ')}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{rec.recommendation}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rec.rationale}</p>
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
