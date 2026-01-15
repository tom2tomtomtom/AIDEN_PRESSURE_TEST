'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface ResponseData {
  purchase_intent: number
  emotional_response: string
}

interface PersonaResponse {
  id: string
  generated_name: string
  archetype: {
    name: string
  }
  response_data: ResponseData
}

interface ReactionSpectrumProps {
  responses: PersonaResponse[]
}

const emotionOrder = ['excited', 'interested', 'neutral', 'skeptical', 'dismissive', 'hostile']
const emotionColors: Record<string, string> = {
  excited: 'bg-green-500',
  interested: 'bg-green-400',
  neutral: 'bg-yellow-electric',
  skeptical: 'bg-orange-accent',
  dismissive: 'bg-red-hot',
  hostile: 'bg-red-dim'
}

const emotionLabels: Record<string, string> = {
  excited: 'Excited',
  interested: 'Interested',
  neutral: 'Neutral',
  skeptical: 'Skeptical',
  dismissive: 'Dismissive',
  hostile: 'Hostile'
}

export function ReactionSpectrum({ responses }: ReactionSpectrumProps) {
  if (responses.length === 0) {
    return null
  }

  // Count emotions
  const emotionCounts: Record<string, number> = {}
  for (const emotion of emotionOrder) {
    emotionCounts[emotion] = 0
  }
  for (const response of responses) {
    const emotion = response.response_data.emotional_response
    if (emotionCounts[emotion] !== undefined) {
      emotionCounts[emotion]++
    }
  }

  // Calculate percentages
  const total = responses.length
  const emotionData = emotionOrder.map(emotion => ({
    emotion,
    count: emotionCounts[emotion] || 0,
    percentage: Math.round(((emotionCounts[emotion] || 0) / total) * 100)
  }))

  // Find the dominant emotion
  const dominantEmotion = emotionData.reduce((max, current) =>
    current.count > max.count ? current : max
  , emotionData[0]!)

  // Calculate average purchase intent
  const avgIntent = responses.reduce((sum, r) => sum + r.response_data.purchase_intent, 0) / total

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-orange-accent" />
          Reaction Spectrum
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual spectrum bar */}
        <div className="mb-4">
          <div className="flex h-8 overflow-hidden">
            {emotionData.map(({ emotion, percentage }) => (
              percentage > 0 && (
                <div
                  key={emotion}
                  className={`${emotionColors[emotion]} flex items-center justify-center transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage >= 15 && (
                    <span className="text-xs font-bold text-black-ink">{percentage}%</span>
                  )}
                </div>
              )
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {emotionData.map(({ emotion, count }) => (
            count > 0 && (
              <div key={emotion} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${emotionColors[emotion]}`} />
                <span className="text-xs text-white-muted">
                  {emotionLabels[emotion]} ({count})
                </span>
              </div>
            )
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
          <div className="text-center">
            <p className="text-2xl font-bold text-white-full">{total}</p>
            <p className="text-xs text-white-muted uppercase tracking-wider">Responses</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              avgIntent >= 7 ? 'text-green-500' :
              avgIntent >= 4 ? 'text-yellow-electric' : 'text-red-hot'
            }`}>
              {avgIntent.toFixed(1)}
            </p>
            <p className="text-xs text-white-muted uppercase tracking-wider">Avg Intent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold capitalize text-orange-accent">
              {dominantEmotion.emotion}
            </p>
            <p className="text-xs text-white-muted uppercase tracking-wider">Dominant</p>
          </div>
        </div>

        {/* Individual dots showing distribution */}
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-xs text-white-muted uppercase tracking-wider mb-3">Purchase Intent Distribution</p>
          <div className="flex items-end justify-between h-16 px-2">
            {responses
              .sort((a, b) => a.response_data.purchase_intent - b.response_data.purchase_intent)
              .map((response) => {
                const intent = response.response_data.purchase_intent
                const height = (intent / 10) * 100
                const color = intent >= 7 ? 'bg-green-500' : intent >= 4 ? 'bg-yellow-electric' : 'bg-red-hot'

                return (
                  <div
                    key={response.id}
                    className="group relative flex flex-col items-center"
                    style={{ width: `${100 / responses.length}%` }}
                  >
                    <div
                      className={`w-3 ${color} transition-all group-hover:w-4`}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black-card border border-border-subtle px-2 py-1 text-xs whitespace-nowrap z-10">
                      <p className="font-bold">{response.generated_name}</p>
                      <p className="text-white-muted">{response.archetype.name}: {intent}/10</p>
                    </div>
                  </div>
                )
              })}
          </div>
          <div className="flex justify-between text-xs text-white-muted mt-1 px-2">
            <span>Low Intent</span>
            <span>High Intent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
