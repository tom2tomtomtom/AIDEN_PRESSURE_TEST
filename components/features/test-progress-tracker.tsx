'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Persona {
  id: string
  name: string
  archetype: string
}

interface TestProgressTrackerProps {
  testId: string
  initialStatus: string
  personas?: Persona[]
  onComplete?: (results: any) => void
}

type PersonaStatus = 'pending' | 'generating' | 'complete'

interface PersonaProgress {
  persona: Persona
  status: PersonaStatus
  score?: number
}

function PersonaProgressRow({ item }: { item: PersonaProgress }) {
  const statusConfig = {
    pending: { icon: '○', color: 'text-muted-foreground', bgColor: '' },
    generating: { icon: '→', color: 'text-orange-accent', bgColor: 'bg-orange-accent/5' },
    complete: { icon: '✓', color: 'text-green-500', bgColor: '' },
  }

  const config = statusConfig[item.status]

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 transition-colors ${config.bgColor} ${
        item.status === 'generating' ? 'animate-pulse' : ''
      }`}
    >
      <span className={`text-lg font-mono ${config.color}`}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-foreground font-medium">{item.persona.name}</span>
        <span className="text-muted-foreground ml-2 text-sm">({item.persona.archetype})</span>
      </div>
      {item.status === 'generating' && (
        <span className="text-xs text-orange-accent">Generating...</span>
      )}
      {item.status === 'complete' && item.score !== undefined && (
        <Badge variant="outline" className="text-xs">
          {item.score}/10
        </Badge>
      )}
    </div>
  )
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="h-3 bg-black-card border border-border-subtle overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-accent transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{completed} of {total} personas</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  )
}

export function TestProgressTracker({
  testId,
  initialStatus,
  personas = [],
  onComplete,
}: TestProgressTrackerProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [personaProgress, setPersonaProgress] = useState<PersonaProgress[]>(
    personas.map((p) => ({ persona: p, status: 'pending' as PersonaStatus }))
  )
  const [completedCount, setCompletedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Poll /status every 3s. A live SSE channel (/progress) is not implemented
  // server-side yet — status polling carries the full completed/failed
  // signal and is all the UI needs today.
  useEffect(() => {
    if (status !== 'running') return

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`/api/tests/${testId}/status`, {
          credentials: 'include',
          cache: 'no-store',
        })

        if (cancelled) return

        if (!response.ok) {
          if (response.status === 401) {
            router.refresh()
          }
          return
        }

        const data = await response.json()
        if (cancelled) return

        // When server exposes per-persona progress in /status, hydrate the
        // row list so users see granular progress. Until then, the progress
        // bar + spinner carry the load.
        if (Array.isArray(data.personas)) {
          setPersonaProgress((prev) => {
            if (prev.length > 0) return prev
            return data.personas.map((p: Persona) => ({
              persona: p,
              status: 'pending' as PersonaStatus,
            }))
          })
        }
        if (typeof data.completedCount === 'number') {
          setCompletedCount(data.completedCount)
        }

        if (data.status === 'completed') {
          setStatus('completed')
          router.refresh()
          onComplete?.(data.results)
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          setStatus(data.status)
          setError(data.error || 'Test failed')
          router.refresh()
        }
      } catch (err) {
        // Network blips: swallow and retry on next interval.
      }
    }

    const pollInterval = setInterval(poll, 3000)
    poll()

    return () => {
      cancelled = true
      clearInterval(pollInterval)
    }
  }, [testId, status, router, onComplete])

  if (status !== 'running') return null

  const totalPersonas = personaProgress.length || 12 // Default estimate

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg uppercase tracking-wide">
            Running Pressure Test
          </CardTitle>
          <Badge variant="outline" className="animate-pulse border-primary text-primary">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <ProgressBar completed={completedCount} total={totalPersonas} />

        {/* Persona list */}
        {personaProgress.length > 0 && (
          <div className="max-h-64 overflow-y-auto border border-border-subtle divide-y divide-border-subtle">
            {personaProgress.map((item) => (
              <PersonaProgressRow key={item.persona.id} item={item} />
            ))}
          </div>
        )}

        {/* Fallback message if no persona list */}
        {personaProgress.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-muted-foreground">
              Generating responses from phantom consumers...
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 border border-destructive bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center border-t border-border-subtle pt-4">
          Auto-navigating to results when complete
        </p>
      </CardContent>
    </Card>
  )
}
// Build trigger: 1769939673
