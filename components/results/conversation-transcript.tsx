'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MessageSquare, Bot, User } from 'lucide-react'

interface ResponseData {
  gut_reaction: string
  considered_view: string
  social_response: string
  private_thought: string
  purchase_intent: number
  credibility_rating: number
  emotional_response: string
  what_works?: string[]
  key_concerns?: string[]
  what_would_convince?: string
}

interface PersonaResponse {
  id: string
  archetype_id: string
  archetype: {
    id: string
    name: string
    slug: string
    baseline_skepticism: string
  }
  generated_name: string
  response_data: ResponseData
  memories_used: string[]
}

interface ConversationTranscriptProps {
  responses: PersonaResponse[]
  stimulus: string
  stimulusType: string
}

function TranscriptCard({ response, stimulus, stimulusType }: {
  response: PersonaResponse
  stimulus: string
  stimulusType: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const data = response.response_data

  return (
    <Card className="border-border-subtle hover:border-red-hot transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-red-hot bg-red-hot/10 flex items-center justify-center text-red-hot font-bold">
              {response.generated_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white-full">{response.generated_name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-orange-accent text-orange-accent">
                  {response.archetype.name}
                </Badge>
                <span className="text-xs text-white-muted">
                  {response.archetype.baseline_skepticism} skepticism
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white-muted hover:text-red-hot"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Always show gut reaction as quick preview */}
        <div className="bg-black-deep border border-border-subtle p-3">
          <div className="flex items-start gap-3">
            <Bot className="h-4 w-4 text-red-hot mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-white-muted mb-1 font-bold uppercase tracking-wider">First Impression</p>
              <p className="text-sm text-white-full italic">&ldquo;{data.gut_reaction}&rdquo;</p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* The stimulus they were shown */}
            <div className="bg-red-hot/5 border border-red-hot/20 p-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-red-hot mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-red-hot mb-1 font-bold uppercase tracking-wider">
                    Shown: {stimulusType}
                  </p>
                  <p className="text-sm text-white-muted line-clamp-3">{stimulus}</p>
                </div>
              </div>
            </div>

            {/* Considered View */}
            <div className="bg-black-deep border border-border-subtle p-3">
              <div className="flex items-start gap-3">
                <Bot className="h-4 w-4 text-orange-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-orange-accent mb-1 font-bold uppercase tracking-wider">After Thinking About It</p>
                  <p className="text-sm text-white-full">{data.considered_view}</p>
                </div>
              </div>
            </div>

            {/* Social vs Private - the key insight */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-black-deep border border-green-500/30 p-3">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-green-500 mb-1 font-bold uppercase tracking-wider">What They&apos;d Say in Public</p>
                    <p className="text-sm text-white-full italic">&ldquo;{data.social_response}&rdquo;</p>
                  </div>
                </div>
              </div>
              <div className="bg-black-deep border border-purple-500/30 p-3">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-purple-500 mb-1 font-bold uppercase tracking-wider">What They Really Think</p>
                    <p className="text-sm text-white-full italic">&ldquo;{data.private_thought}&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white-muted">Would Buy:</span>
                <span className={`font-bold ${data.purchase_intent >= 7 ? 'text-green-500' : data.purchase_intent >= 4 ? 'text-yellow-electric' : 'text-red-hot'}`}>
                  {data.purchase_intent}/10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white-muted">Believability:</span>
                <span className={`font-bold ${data.credibility_rating >= 7 ? 'text-green-500' : data.credibility_rating >= 4 ? 'text-yellow-electric' : 'text-red-hot'}`}>
                  {data.credibility_rating}/10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white-muted">Feeling:</span>
                <span className="font-bold text-orange-accent">{data.emotional_response}</span>
              </div>
            </div>

            {/* What would convince them */}
            {data.what_would_convince && (
              <div className="bg-black-deep border border-yellow-electric/30 p-3">
                <p className="text-xs text-yellow-electric mb-1 font-bold uppercase tracking-wider">What Would Change Their Mind</p>
                <p className="text-sm text-white-full">{data.what_would_convince}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ConversationTranscript({ responses, stimulus, stimulusType }: ConversationTranscriptProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedResponses = showAll ? responses : responses.slice(0, 3)

  if (responses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-hot" />
          Conversation Transcripts
        </CardTitle>
        <p className="text-sm text-white-muted">
          See exactly how each persona responded to your {stimulusType}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedResponses.map(response => (
          <TranscriptCard
            key={response.id}
            response={response}
            stimulus={stimulus}
            stimulusType={stimulusType}
          />
        ))}

        {responses.length > 3 && !showAll && (
          <div className="text-center pt-2">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              Show all {responses.length} conversations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
