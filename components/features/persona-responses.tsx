'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MessageSquare, Lock, Users } from 'lucide-react'

interface Archetype {
  id: string
  name: string
  slug: string
  category: string
  baseline_skepticism: string
}

interface ResponseData {
  gut_reaction: string
  considered_view: string
  social_response: string
  private_thought: string
  purchase_intent: number
  credibility_rating: number
  emotional_response: string
  key_concerns: string[]
  what_would_convince: string[]
}

interface PersonaResponse {
  id: string
  archetype_id: string
  archetype: Archetype
  generated_name: string
  response_data: ResponseData
  memories_used: string[]
  created_at: string
}

interface PersonaResponsesProps {
  responses: PersonaResponse[]
}

const categoryColors: Record<string, string> = {
  value: 'bg-blue-100 text-blue-800',
  traditional: 'bg-amber-100 text-amber-800',
  health: 'bg-emerald-100 text-emerald-800',
  convenience: 'bg-purple-100 text-purple-800',
  premium: 'bg-pink-100 text-pink-800',
  sustainability: 'bg-green-100 text-green-800',
  innovation: 'bg-cyan-100 text-cyan-800'
}

function IntentBar({ value, label }: { value: number; label: string }) {
  const color = value >= 7 ? 'bg-green-500' : value >= 4 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

function PersonaCard({ response }: { response: PersonaResponse }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const data = response.response_data

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{response.generated_name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={categoryColors[response.archetype.category] || 'bg-gray-100'}>
                {response.archetype.name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {response.archetype.baseline_skepticism} skepticism
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-3">
          <IntentBar value={data.purchase_intent} label="Purchase Intent" />
          <IntentBar value={data.credibility_rating} label="Credibility" />
        </div>

        {/* Gut Reaction - Always visible */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <MessageSquare className="h-4 w-4 text-orange-500" />
            Gut Reaction
          </div>
          <p className="text-sm italic">&quot;{data.gut_reaction}&quot;</p>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <>
            {/* Considered View */}
            <div className="border-l-2 border-blue-300 pl-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Considered View</p>
              <p className="text-sm">{data.considered_view}</p>
            </div>

            {/* Social vs Private */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-1">
                  <Users className="h-4 w-4" />
                  What they&apos;d say publicly
                </div>
                <p className="text-sm text-green-800">&quot;{data.social_response}&quot;</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-700 mb-1">
                  <Lock className="h-4 w-4" />
                  What they really think
                </div>
                <p className="text-sm text-purple-800">&quot;{data.private_thought}&quot;</p>
              </div>
            </div>

            {/* Emotional Response */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Emotional Response</p>
              <p className="text-sm">{data.emotional_response}</p>
            </div>

            {/* Concerns */}
            {data.key_concerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Key Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {data.key_concerns.map((concern, i) => (
                    <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* What Would Convince */}
            {data.what_would_convince.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">What Would Convince Them</p>
                <ul className="text-sm space-y-1">
                  {data.what_would_convince.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memories Used */}
            {response.memories_used.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Memories Referenced ({response.memories_used.length})
                </p>
                <div className="text-xs text-muted-foreground">
                  {response.memories_used.slice(0, 3).join(' • ')}
                  {response.memories_used.length > 3 && ` +${response.memories_used.length - 3} more`}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function PersonaResponses({ responses }: PersonaResponsesProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedResponses = showAll ? responses : responses.slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Responses</CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed reactions from {responses.length} phantom consumers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {displayedResponses.map(response => (
            <PersonaCard key={response.id} response={response} />
          ))}
        </div>

        {responses.length > 4 && !showAll && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              Show all {responses.length} responses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
