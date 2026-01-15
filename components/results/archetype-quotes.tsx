'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Quote, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ResponseData {
  gut_reaction: string
  considered_view: string
  purchase_intent: number
  credibility_rating: number
  emotional_response: string
  what_works?: string[]
  key_concerns?: string[]
}

interface PersonaResponse {
  id: string
  generated_name: string
  archetype: {
    name: string
    baseline_skepticism: string
  }
  response_data: ResponseData
}

interface ArchetypeQuotesProps {
  responses: PersonaResponse[]
}

interface NotableQuote {
  personaName: string
  archetype: string
  skepticism: string
  quote: string
  type: 'supporter' | 'critic' | 'neutral'
  score: number
  emotionalResponse: string
}

function findNotableQuotes(responses: PersonaResponse[]): NotableQuote[] {
  if (responses.length === 0) return []

  // Sort by purchase intent to find strongest supporter and critic
  const sorted = [...responses].sort((a, b) =>
    b.response_data.purchase_intent - a.response_data.purchase_intent
  )

  const quotes: NotableQuote[] = []

  // Strongest supporter
  const supporter = sorted[0]
  if (supporter && supporter.response_data.purchase_intent >= 6) {
    quotes.push({
      personaName: supporter.generated_name,
      archetype: supporter.archetype.name,
      skepticism: supporter.archetype.baseline_skepticism,
      quote: supporter.response_data.gut_reaction,
      type: 'supporter',
      score: supporter.response_data.purchase_intent,
      emotionalResponse: supporter.response_data.emotional_response
    })
  }

  // Strongest critic
  const critic = sorted[sorted.length - 1]
  if (critic && critic.response_data.purchase_intent <= 4 && critic.id !== supporter?.id) {
    quotes.push({
      personaName: critic.generated_name,
      archetype: critic.archetype.name,
      skepticism: critic.archetype.baseline_skepticism,
      quote: critic.response_data.gut_reaction,
      type: 'critic',
      score: critic.response_data.purchase_intent,
      emotionalResponse: critic.response_data.emotional_response
    })
  }

  // Find the most skeptical persona and add their view (if different)
  const skeptics = responses.filter(r =>
    r.archetype.baseline_skepticism === 'high' || r.archetype.baseline_skepticism === 'extreme'
  )
  if (skeptics.length > 0) {
    const topSkeptic = skeptics.sort((a, b) =>
      a.response_data.credibility_rating - b.response_data.credibility_rating
    )[0]!

    // Only add if different from supporter/critic
    if (topSkeptic.id !== supporter?.id && topSkeptic.id !== critic?.id) {
      quotes.push({
        personaName: topSkeptic.generated_name,
        archetype: topSkeptic.archetype.name,
        skepticism: topSkeptic.archetype.baseline_skepticism,
        quote: topSkeptic.response_data.considered_view,
        type: 'neutral',
        score: topSkeptic.response_data.purchase_intent,
        emotionalResponse: topSkeptic.response_data.emotional_response
      })
    }
  }

  return quotes
}

export function ArchetypeQuotes({ responses }: ArchetypeQuotesProps) {
  const quotes = findNotableQuotes(responses)

  if (quotes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-orange-accent" />
          Notable Voices
        </CardTitle>
        <p className="text-sm text-white-muted">
          Standout reactions from the phantom consumer panel
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote, i) => (
            <QuoteCard key={i} quote={quote} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuoteCard({ quote }: { quote: NotableQuote }) {
  const borderColor = quote.type === 'supporter'
    ? 'border-green-500/50'
    : quote.type === 'critic'
      ? 'border-red-hot/50'
      : 'border-orange-accent/50'

  const icon = quote.type === 'supporter'
    ? <ThumbsUp className="h-4 w-4 text-green-500" />
    : quote.type === 'critic'
      ? <ThumbsDown className="h-4 w-4 text-red-hot" />
      : <Quote className="h-4 w-4 text-orange-accent" />

  const label = quote.type === 'supporter'
    ? 'Strongest Supporter'
    : quote.type === 'critic'
      ? 'Harshest Critic'
      : 'Skeptic\'s View'

  return (
    <div className={`bg-black-deep border-2 ${borderColor} p-4 flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-white-muted">
          {label}
        </span>
      </div>

      <blockquote className="text-sm text-white-full italic flex-grow mb-4">
        &ldquo;{quote.quote}&rdquo;
      </blockquote>

      <div className="border-t border-border-subtle pt-3 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white-full text-sm">{quote.personaName}</p>
            <p className="text-xs text-white-muted">{quote.archetype}</p>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={`text-xs ${
                quote.score >= 7 ? 'border-green-500 text-green-500' :
                quote.score >= 4 ? 'border-yellow-electric text-yellow-electric' :
                'border-red-hot text-red-hot'
              }`}
            >
              {quote.score}/10
            </Badge>
            <p className="text-xs text-white-muted mt-1 capitalize">{quote.emotionalResponse}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
