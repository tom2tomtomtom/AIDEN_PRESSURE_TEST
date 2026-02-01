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
  what_would_convince?: string | string[]
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

// Message bubble component for conversation flow
function ModeratorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-red-hot/20 border border-red-hot flex items-center justify-center flex-shrink-0">
        <User className="h-4 w-4 text-red-hot" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-red-hot font-bold mb-1">Moderator</p>
        <div className="bg-red-hot/10 border border-red-hot/30 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg">
          <p className="text-sm text-white-full">{children}</p>
        </div>
      </div>
    </div>
  )
}

function PersonaMessage({ name, children, isPrivate = false }: { name: string; children: React.ReactNode; isPrivate?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isPrivate ? 'bg-purple-500/20 border border-purple-500' : 'bg-orange-accent/20 border border-orange-accent'
      }`}>
        <Bot className={`h-4 w-4 ${isPrivate ? 'text-purple-500' : 'text-orange-accent'}`} />
      </div>
      <div className="flex-1">
        <p className={`text-xs font-bold mb-1 ${isPrivate ? 'text-purple-500' : 'text-orange-accent'}`}>
          {name} {isPrivate && <span className="font-normal text-white-muted">(thinking privately)</span>}
        </p>
        <div className={`p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg ${
          isPrivate
            ? 'bg-purple-500/10 border border-purple-500/30 border-dashed'
            : 'bg-black-deep border border-border-subtle'
        }`}>
          <p className="text-sm text-white-full italic">&ldquo;{children}&rdquo;</p>
        </div>
      </div>
    </div>
  )
}

function TranscriptCard({ response, stimulus, stimulusType }: {
  response: PersonaResponse
  stimulus: string
  stimulusType: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const data = response.response_data
  const personaName = response.generated_name.split(' ')[0] || response.generated_name // Use first name for conversation

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
            {isExpanded ? (
              <>
                <span className="text-xs mr-2">Collapse</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="text-xs mr-2">Full Conversation</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Collapsed preview */}
        {!isExpanded && (
          <div className="bg-black-deep border border-border-subtle p-3">
            <p className="text-xs text-white-muted mb-1">First reaction:</p>
            <p className="text-sm text-white-full italic line-clamp-2">&ldquo;{data.gut_reaction}&rdquo;</p>
          </div>
        )}

        {/* Expanded conversation */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Opening - Show the stimulus */}
            <ModeratorMessage>
              I&apos;m going to show you a {stimulusType.toLowerCase()}. Take a moment to read through it, then tell me your honest first reaction.
            </ModeratorMessage>

            <div className="ml-11 p-3 bg-black-deep border border-border-subtle text-sm text-white-muted">
              <p className="text-xs text-white-muted/60 mb-2 uppercase tracking-wider">Stimulus shown:</p>
              <p className="whitespace-pre-wrap">{stimulus}</p>
            </div>

            {/* Gut reaction */}
            <ModeratorMessage>
              {personaName}, what&apos;s your immediate gut reaction?
            </ModeratorMessage>

            <PersonaMessage name={personaName}>
              {data.gut_reaction}
            </PersonaMessage>

            {/* Considered view */}
            <ModeratorMessage>
              Now that you&apos;ve had a moment to think about it, what&apos;s your more considered view?
            </ModeratorMessage>

            <PersonaMessage name={personaName}>
              {data.considered_view}
            </PersonaMessage>

            {/* Key concerns if present */}
            {data.key_concerns && data.key_concerns.length > 0 && (
              <>
                <ModeratorMessage>
                  Are there any concerns or hesitations that come to mind?
                </ModeratorMessage>

                <PersonaMessage name={personaName}>
                  {data.key_concerns.join('. Also, ')}
                </PersonaMessage>
              </>
            )}

            {/* What works if present */}
            {data.what_works && data.what_works.length > 0 && (
              <>
                <ModeratorMessage>
                  What aspects of this resonate with you or work well?
                </ModeratorMessage>

                <PersonaMessage name={personaName}>
                  {data.what_works.join('. And ')}
                </PersonaMessage>
              </>
            )}

            {/* Social response */}
            <ModeratorMessage>
              If a friend or family member asked what you thought of this, what would you tell them?
            </ModeratorMessage>

            <PersonaMessage name={personaName}>
              {data.social_response}
            </PersonaMessage>

            {/* Private thought - shown differently */}
            <div className="ml-11 pt-2 border-t border-dashed border-purple-500/30">
              <p className="text-xs text-purple-400 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                What {personaName} is actually thinking but not saying out loud:
              </p>
              <PersonaMessage name={personaName} isPrivate>
                {data.private_thought}
              </PersonaMessage>
            </div>

            {/* Purchase intent & credibility */}
            <ModeratorMessage>
              On a scale of 1-10, how likely would you be to purchase this? And how believable do you find it?
            </ModeratorMessage>

            <PersonaMessage name={personaName}>
              I&apos;d say about a {data.purchase_intent} out of 10 on purchase intent.
              As for believability, I&apos;d rate it {data.credibility_rating} out of 10.
              Overall, I&apos;m feeling {data.emotional_response.toLowerCase()} about it.
            </PersonaMessage>

            {/* What would convince - closing question */}
            {data.what_would_convince && (
              <>
                <ModeratorMessage>
                  Last question: What would need to change to make you more interested?
                </ModeratorMessage>

                <PersonaMessage name={personaName}>
                  {typeof data.what_would_convince === 'string'
                    ? data.what_would_convince
                    : Array.isArray(data.what_would_convince)
                      ? data.what_would_convince.join('. ')
                      : 'I think it could work as is.'}
                </PersonaMessage>
              </>
            )}

            {/* Summary scores bar */}
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-white-muted">Purchase Intent: </span>
                    <span className={`font-bold ${data.purchase_intent >= 7 ? 'text-green-500' : data.purchase_intent >= 4 ? 'text-yellow-electric' : 'text-red-hot'}`}>
                      {data.purchase_intent}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-white-muted">Credibility: </span>
                    <span className={`font-bold ${data.credibility_rating >= 7 ? 'text-green-500' : data.credibility_rating >= 4 ? 'text-yellow-electric' : 'text-red-hot'}`}>
                      {data.credibility_rating}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-white-muted">Mood: </span>
                    <span className="font-bold text-orange-accent">{data.emotional_response}</span>
                  </div>
                </div>
              </div>
            </div>
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
