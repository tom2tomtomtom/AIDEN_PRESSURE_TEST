'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Archetype {
  id: string
  name: string
  slug: string
  category: string
  baseline_skepticism: 'low' | 'medium' | 'high' | 'extreme'
  memoryCount?: number
}

interface PanelSelectorProps {
  value: string[]
  onChange: (archetypeIds: string[]) => void
  maxSelection?: number
}

const skepticismColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  extreme: 'bg-red-100 text-red-800'
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

export function PanelSelector({ value, onChange, maxSelection = 8 }: PanelSelectorProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadArchetypes() {
      try {
        const response = await fetch('/api/archetypes')
        if (!response.ok) throw new Error('Failed to load archetypes')
        const data = await response.json()
        setArchetypes(data.archetypes || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load archetypes')
      } finally {
        setLoading(false)
      }
    }
    loadArchetypes()
  }, [])

  const handleToggle = (archetypeId: string) => {
    if (value.includes(archetypeId)) {
      onChange(value.filter(id => id !== archetypeId))
    } else if (value.length < maxSelection) {
      onChange([...value, archetypeId])
    }
  }

  const selectAll = () => {
    onChange(archetypes.slice(0, maxSelection).map(a => a.id))
  }

  const clearAll = () => {
    onChange([])
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading archetypes...</div>
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {value.length} of {maxSelection} selected
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-blue-600 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {archetypes.map(archetype => (
          <div
            key={archetype.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              value.includes(archetype.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleToggle(archetype.id)}
          >
            <Checkbox
              id={archetype.id}
              checked={value.includes(archetype.id)}
              onCheckedChange={() => handleToggle(archetype.id)}
              disabled={!value.includes(archetype.id) && value.length >= maxSelection}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={archetype.id}
                className="font-medium cursor-pointer"
              >
                {archetype.name}
              </Label>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className={categoryColors[archetype.category] || 'bg-gray-100'}>
                  {archetype.category}
                </Badge>
                <Badge variant="outline" className={skepticismColors[archetype.baseline_skepticism]}>
                  {archetype.baseline_skepticism} skepticism
                </Badge>
              </div>
              {archetype.memoryCount !== undefined && (
                <div className="text-xs text-muted-foreground">
                  {archetype.memoryCount} memories
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
