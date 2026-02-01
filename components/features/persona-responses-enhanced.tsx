'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lock,
  Users,
  LayoutGrid,
  List,
  GitCompare
} from 'lucide-react'

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

interface PersonaResponsesEnhancedProps {
  responses: PersonaResponse[]
}

type ViewMode = 'cards' | 'compact' | 'compare'
type SortOption = 'intent' | 'credibility' | 'skepticism' | 'name'

const categoryColors: Record<string, string> = {
  value: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  traditional: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  health: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  convenience: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  premium: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  sustainability: 'bg-green-500/20 text-green-400 border-green-500/50',
  innovation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
}

function IntentBar({ value, label }: { value: number; label: string }) {
  const color = value >= 7 ? 'bg-green-500' : value >= 4 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 bg-black-deep border border-border-subtle overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

function PersonaCard({ response, expanded = false }: { response: PersonaResponse; expanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const data = response.response_data

  return (
    <Card className="border-border-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{response.generated_name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={categoryColors[response.archetype.category] || 'bg-gray-500/20'}>
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
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <IntentBar value={data.purchase_intent} label="Purchase Intent" />
          <IntentBar value={data.credibility_rating} label="Credibility" />
        </div>

        <div className="bg-black-deep border border-border-subtle p-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <MessageSquare className="h-4 w-4 text-orange-accent" />
            Gut Reaction
          </div>
          <p className="text-sm italic text-muted-foreground">&quot;{data.gut_reaction}&quot;</p>
        </div>

        {isExpanded && (
          <>
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-xs font-medium text-blue-400 mb-1">Considered View</p>
              <p className="text-sm text-muted-foreground">{data.considered_view}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-green-500/5 border border-green-500/30 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-400 mb-1">
                  <Users className="h-4 w-4" />
                  What they&apos;d say publicly
                </div>
                <p className="text-sm text-muted-foreground">&quot;{data.social_response}&quot;</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/30 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-400 mb-1">
                  <Lock className="h-4 w-4" />
                  What they really think
                </div>
                <p className="text-sm text-muted-foreground">&quot;{data.private_thought}&quot;</p>
              </div>
            </div>

            {data.key_concerns && data.key_concerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Key Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {data.key_concerns.map((concern, i) => (
                    <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {data.what_would_convince && data.what_would_convince.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">What Would Convince Them</p>
                <ul className="text-sm space-y-1">
                  {data.what_would_convince.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CompactTable({ responses }: { responses: PersonaResponse[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="border border-border-subtle overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black-deep text-left">
            <th className="p-3 text-xs uppercase tracking-wide text-muted-foreground">Persona</th>
            <th className="p-3 text-xs uppercase tracking-wide text-muted-foreground text-center">Intent</th>
            <th className="p-3 text-xs uppercase tracking-wide text-muted-foreground text-center">Cred</th>
            <th className="p-3 text-xs uppercase tracking-wide text-muted-foreground">Gut Reaction</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => {
            const data = response.response_data
            const isExpanded = expandedId === response.id
            return (
              <>
                <tr
                  key={response.id}
                  className="border-t border-border-subtle hover:bg-black-deep/50 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : response.id)}
                >
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{response.generated_name}</div>
                      <div className="text-xs text-muted-foreground">{response.archetype.name}</div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${data.purchase_intent >= 7 ? 'text-green-500' : data.purchase_intent >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {data.purchase_intent}/10
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${data.credibility_rating >= 7 ? 'text-green-500' : data.credibility_rating >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {data.credibility_rating}/10
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                    {data.gut_reaction}
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${response.id}-expanded`} className="border-t border-border-subtle">
                    <td colSpan={4} className="p-4 bg-black-deep">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Considered View</h4>
                          <p className="text-sm text-muted-foreground">{data.considered_view}</p>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Private Thought</h4>
                          <p className="text-sm text-muted-foreground">{data.private_thought}</p>
                        </div>
                      </div>
                      {data.key_concerns && data.key_concerns.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs uppercase tracking-wide text-red-400 mb-2">Concerns</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.key_concerns.map((c, i) => (
                              <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CompareView({ responses }: { responses: PersonaResponse[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectedResponses = responses.filter((r) => selectedIds.includes(r.id))

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Select 2-3 personas to compare side-by-side:</p>
        <div className="flex flex-wrap gap-2">
          {responses.map((r) => (
            <Button
              key={r.id}
              variant={selectedIds.includes(r.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSelection(r.id)}
              className={selectedIds.includes(r.id) ? '' : 'border-border-subtle'}
            >
              {r.generated_name}
            </Button>
          ))}
        </div>
      </div>

      {selectedResponses.length >= 2 && (
        <div className={`grid gap-4 ${selectedResponses.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {selectedResponses.map((response) => (
            <PersonaCard key={response.id} response={response} expanded />
          ))}
        </div>
      )}

      {selectedResponses.length < 2 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border-subtle">
          Select at least 2 personas to compare
        </div>
      )}
    </div>
  )
}

export function PersonaResponsesEnhanced({ responses }: PersonaResponsesEnhancedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [sortBy, setSortBy] = useState<SortOption>('intent')
  const [showAll, setShowAll] = useState(false)

  const sortedResponses = useMemo(() => {
    const sorted = [...responses]
    switch (sortBy) {
      case 'intent':
        return sorted.sort((a, b) => b.response_data.purchase_intent - a.response_data.purchase_intent)
      case 'credibility':
        return sorted.sort((a, b) => b.response_data.credibility_rating - a.response_data.credibility_rating)
      case 'skepticism':
        const skepticismOrder = { low: 0, medium: 1, high: 2, extreme: 3 }
        return sorted.sort((a, b) =>
          (skepticismOrder[b.archetype.baseline_skepticism as keyof typeof skepticismOrder] || 0) -
          (skepticismOrder[a.archetype.baseline_skepticism as keyof typeof skepticismOrder] || 0)
        )
      case 'name':
        return sorted.sort((a, b) => a.generated_name.localeCompare(b.generated_name))
      default:
        return sorted
    }
  }, [responses, sortBy])

  const displayedResponses = showAll ? sortedResponses : sortedResponses.slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Individual Responses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed reactions from {responses.length} phantom consumers
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-border-subtle">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="rounded-none border-x border-border-subtle"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compare' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compare')}
                className="rounded-none"
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            {viewMode !== 'compare' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-black-deep border border-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="intent">Sort: Intent</option>
                <option value="credibility">Sort: Credibility</option>
                <option value="skepticism">Sort: Skepticism</option>
                <option value="name">Sort: Name</option>
              </select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {viewMode === 'cards' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {displayedResponses.map((response) => (
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
          </>
        )}

        {viewMode === 'compact' && <CompactTable responses={sortedResponses} />}

        {viewMode === 'compare' && <CompareView responses={sortedResponses} />}
      </CardContent>
    </Card>
  )
}
