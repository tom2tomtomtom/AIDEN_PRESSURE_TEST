'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PanelSelector } from './panel-selector'
import { SkepticismSlider } from './skepticism-slider'
import { ChevronLeft, ChevronRight, Loader2, Beaker } from 'lucide-react'

interface TestWizardProps {
  projectId: string
}

type WizardStep = 'basics' | 'stimulus' | 'panel' | 'calibration' | 'review'

const STEPS: { id: WizardStep; title: string; description: string }[] = [
  { id: 'basics', title: 'Test Details', description: 'Name and describe your test' },
  { id: 'stimulus', title: 'Stimulus', description: 'Define what you\'re testing' },
  { id: 'panel', title: 'Panel', description: 'Select consumer archetypes' },
  { id: 'calibration', title: 'Calibration', description: 'Adjust skepticism levels' },
  { id: 'review', title: 'Review', description: 'Confirm and launch' }
]

interface TestConfig {
  name: string
  description: string
  stimulus_type: 'concept' | 'claim' | 'product' | 'ad'
  stimulus_content: string
  stimulus_context: string
  archetype_ids: string[]
  skepticism_override: number
  enable_group_dynamics: boolean
}

const defaultConfig: TestConfig = {
  name: '',
  description: '',
  stimulus_type: 'concept',
  stimulus_content: '',
  stimulus_context: '',
  archetype_ids: [],
  skepticism_override: 50,
  enable_group_dynamics: true
}

export function TestWizard({ projectId }: TestWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics')
  const [config, setConfig] = useState<TestConfig>(defaultConfig)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const currentStepData = STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const updateConfig = <K extends keyof TestConfig>(key: K, value: TestConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'basics':
        return config.name.trim().length >= 3
      case 'stimulus':
        return config.stimulus_content.trim().length >= 10
      case 'panel':
        return config.archetype_ids.length >= 2
      case 'calibration':
        return true
      case 'review':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    const nextStep = STEPS[currentStepIndex + 1]
    if (!isLastStep && canProceed() && nextStep) {
      setCurrentStep(nextStep.id)
    }
  }

  const goPrev = () => {
    const prevStep = STEPS[currentStepIndex - 1]
    if (!isFirstStep && prevStep) {
      setCurrentStep(prevStep.id)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name: config.name,
          description: config.description || null,
          stimulus_type: config.stimulus_type,
          stimulus_content: config.stimulus_content,
          stimulus_context: config.stimulus_context || null,
          config: {
            archetype_ids: config.archetype_ids,
            skepticism_override: config.skepticism_override,
            enable_group_dynamics: config.enable_group_dynamics
          }
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create test')
      }

      const { test } = await response.json()
      router.push(`/projects/${projectId}/tests/${test.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index < currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStepIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
          <CardDescription>{currentStepData?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 'basics' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Test Name *</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={e => updateConfig('name', e.target.value)}
                  placeholder="e.g., Premium Yogurt Launch Concept"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={e => updateConfig('description', e.target.value)}
                  placeholder="Brief description of what you're testing and why..."
                  rows={3}
                />
              </div>
            </>
          )}

          {currentStep === 'stimulus' && (
            <>
              <div className="space-y-2">
                <Label>Stimulus Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['concept', 'claim', 'product', 'ad'] as const).map(type => (
                    <Button
                      key={type}
                      type="button"
                      variant={config.stimulus_type === type ? 'default' : 'outline'}
                      onClick={() => updateConfig('stimulus_type', type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">
                  {config.stimulus_type === 'concept' && 'Concept Description *'}
                  {config.stimulus_type === 'claim' && 'Claim Statement *'}
                  {config.stimulus_type === 'product' && 'Product Description *'}
                  {config.stimulus_type === 'ad' && 'Ad Copy / Script *'}
                </Label>
                <Textarea
                  id="content"
                  value={config.stimulus_content}
                  onChange={e => updateConfig('stimulus_content', e.target.value)}
                  placeholder={
                    config.stimulus_type === 'concept'
                      ? 'Describe your product concept in detail...'
                      : config.stimulus_type === 'claim'
                      ? 'Enter the specific claim you want to test...'
                      : config.stimulus_type === 'product'
                      ? 'Describe the product including key features...'
                      : 'Paste your ad copy or describe the ad...'
                  }
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (optional)</Label>
                <Textarea
                  id="context"
                  value={config.stimulus_context}
                  onChange={e => updateConfig('stimulus_context', e.target.value)}
                  placeholder="Price point, target audience, competitive context, etc."
                  rows={3}
                />
              </div>
            </>
          )}

          {currentStep === 'panel' && (
            <PanelSelector
              value={config.archetype_ids}
              onChange={ids => updateConfig('archetype_ids', ids)}
              maxSelection={8}
            />
          )}

          {currentStep === 'calibration' && (
            <>
              <SkepticismSlider
                value={config.skepticism_override}
                onChange={value => updateConfig('skepticism_override', value)}
              />
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="groupDynamics"
                    checked={config.enable_group_dynamics}
                    onChange={e => updateConfig('enable_group_dynamics', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="groupDynamics" className="font-normal cursor-pointer">
                    Enable Group Dynamics Simulation
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Simulates focus group interaction where personas influence each other
                </p>
              </div>
            </>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Test Name:</span>
                  <p className="font-medium">{config.name}</p>
                </div>
                {config.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p>{config.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Stimulus Type:</span>
                  <p className="capitalize">{config.stimulus_type}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Stimulus Content:</span>
                  <p className="whitespace-pre-wrap text-sm">{config.stimulus_content}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Panel Size:</span>
                  <p>{config.archetype_ids.length} archetypes selected</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Skepticism Level:</span>
                  <p>
                    {config.skepticism_override <= 25
                      ? 'Low'
                      : config.skepticism_override <= 50
                      ? 'Medium'
                      : config.skepticism_override <= 75
                      ? 'High'
                      : 'Extreme'}
                    {' '}({config.skepticism_override}%)
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Group Dynamics:</span>
                  <p>{config.enable_group_dynamics ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <strong>Ready to launch?</strong> This will create your test in draft status.
                You can then run it from the test details page.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Beaker className="w-4 h-4 mr-2" />
                Create Test
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canProceed()}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
