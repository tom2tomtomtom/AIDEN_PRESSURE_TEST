'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface SkepticismSliderProps {
  value: number
  onChange: (value: number) => void
}

const skepticismLevels = [
  { value: 0, label: 'Low', description: 'Trusting, open to claims', color: 'text-green-600' },
  { value: 33, label: 'Medium', description: 'Balanced, needs some proof', color: 'text-yellow-600' },
  { value: 66, label: 'High', description: 'Skeptical, demands evidence', color: 'text-orange-600' },
  { value: 100, label: 'Extreme', description: 'Cynical, very hard to convince', color: 'text-red-600' }
] as const

type SkepticismLevel = typeof skepticismLevels[number]

function getSkepticismLevel(value: number): SkepticismLevel {
  if (value <= 25) return skepticismLevels[0]
  if (value <= 50) return skepticismLevels[1]
  if (value <= 75) return skepticismLevels[2]
  return skepticismLevels[3]
}

export function SkepticismSlider({ value, onChange }: SkepticismSliderProps) {
  const currentLevel = getSkepticismLevel(value)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Skepticism Calibration</Label>
        <span className={`text-sm font-medium ${currentLevel.color}`}>
          {currentLevel.label}
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? value)}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        {skepticismLevels.map(level => (
          <span key={level.value} className="text-center">
            {level.label}
          </span>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {currentLevel.description}
      </p>

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">What this means:</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>• Low: Personas will be more receptive to marketing claims</li>
          <li>• Medium: Personas will question unsupported claims but remain open</li>
          <li>• High: Personas will actively challenge claims and look for evidence</li>
          <li>• Extreme: Personas will be highly critical and resist persuasion</li>
        </ul>
      </div>
    </div>
  )
}
