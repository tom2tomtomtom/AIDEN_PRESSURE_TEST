'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'

interface ResponseData {
  social_response: string
  private_thought: string
  purchase_intent: number
  credibility_rating: number
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

interface HiddenConcernsProps {
  responses: PersonaResponse[]
}

interface ConcernItem {
  personaName: string
  archetype: string
  publicSays: string
  privateThinks: string
  gapSeverity: 'high' | 'medium' | 'low'
}

function analyzeConcerns(responses: PersonaResponse[]): ConcernItem[] {
  const concerns: ConcernItem[] = []

  for (const response of responses) {
    const data = response.response_data
    const publicSays = data.social_response.toLowerCase()
    const privateThinks = data.private_thought.toLowerCase()

    // Detect significant gaps between public and private responses
    // Look for contradictory sentiment indicators
    const publicPositive = /good|nice|interesting|like|might|could|okay/i.test(publicSays)
    const privateNegative = /but|however|actually|really|doubt|skeptic|won't|don't|concern|worry|suspicious/i.test(privateThinks)

    // Calculate gap severity based on sentiment mismatch
    let gapSeverity: 'high' | 'medium' | 'low' = 'low'

    if (publicPositive && privateNegative) {
      gapSeverity = 'high'
    } else if (data.purchase_intent >= 6 && privateThinks.includes('but')) {
      gapSeverity = 'medium'
    } else if (data.social_response !== data.private_thought) {
      // Any difference is noteworthy
      const socialWords = new Set(publicSays.split(/\s+/))
      const privateWords = new Set(privateThinks.split(/\s+/))
      const overlap = [...socialWords].filter(w => privateWords.has(w)).length
      const totalUnique = new Set([...socialWords, ...privateWords]).size

      if (overlap / totalUnique < 0.3) {
        gapSeverity = 'medium'
      }
    }

    if (gapSeverity !== 'low') {
      concerns.push({
        personaName: response.generated_name,
        archetype: response.archetype.name,
        publicSays: data.social_response,
        privateThinks: data.private_thought,
        gapSeverity
      })
    }
  }

  // Sort by severity (high first)
  return concerns.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.gapSeverity] - severityOrder[b.gapSeverity]
  })
}

export function HiddenConcerns({ responses }: HiddenConcernsProps) {
  const concerns = analyzeConcerns(responses)

  if (concerns.length === 0) {
    return null
  }

  const highSeverity = concerns.filter(c => c.gapSeverity === 'high')
  const mediumSeverity = concerns.filter(c => c.gapSeverity === 'medium')

  return (
    <Card className="border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <AlertTriangle className="h-5 w-5" />
          Hidden Concerns
        </CardTitle>
        <p className="text-sm text-white-muted">
          What personas are thinking but might not say out loud
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {highSeverity.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-hot uppercase tracking-wider">
              Significant Gaps ({highSeverity.length})
            </h4>
            {highSeverity.map((concern, i) => (
              <ConcernCard key={i} concern={concern} />
            ))}
          </div>
        )}

        {mediumSeverity.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-yellow-electric uppercase tracking-wider">
              Notable Differences ({mediumSeverity.length})
            </h4>
            {mediumSeverity.slice(0, 3).map((concern, i) => (
              <ConcernCard key={i} concern={concern} />
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-border-subtle">
          <p className="text-xs text-white-muted">
            <strong className="text-orange-accent">Why this matters:</strong> Focus group participants often soften
            their criticism in public. These hidden concerns reveal the real barriers to purchase.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ConcernCard({ concern }: { concern: ConcernItem }) {
  return (
    <div className="bg-black-deep border border-border-subtle p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-bold text-white-full">{concern.personaName}</span>
          <span className="text-white-muted text-sm"> • {concern.archetype}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="flex items-start gap-2">
          <Eye className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-green-500 font-bold uppercase tracking-wider mb-1">Says Publicly</p>
            <p className="text-sm text-white-muted italic">&ldquo;{concern.publicSays}&rdquo;</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <EyeOff className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Really Thinks</p>
            <p className="text-sm text-white-full italic">&ldquo;{concern.privateThinks}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  )
}
