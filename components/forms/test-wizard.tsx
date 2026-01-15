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
import { ChevronLeft, ChevronRight, Loader2, Beaker, Plus, X } from 'lucide-react'

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
  stimulus_type: 'concept' | 'claim' | 'product_description' | 'ad_copy' | 'tagline' | 'headline_test'
  stimulus_content: string
  headlines: string[]  // For headline_test type
  brief: string
  archetype_ids: string[]
  skepticism_override: number
  enable_group_dynamics: boolean
}

const defaultConfig: TestConfig = {
  name: '',
  description: '',
  stimulus_type: 'concept',
  stimulus_content: '',
  headlines: ['', ''],  // Start with 2 empty headlines
  brief: '',
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
        // For headline tests, need at least 3 non-empty headlines
        if (config.stimulus_type === 'headline_test') {
          const validHeadlines = config.headlines.filter(h => h.trim().length >= 3)
          return validHeadlines.length >= 3 && config.brief.trim().length >= 20
        }
        // For other types, content and brief are required
        return config.stimulus_content.trim().length >= 10 && config.brief.trim().length >= 20
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

  const addHeadline = () => {
    if (config.headlines.length < 30) {
      setConfig(prev => ({ ...prev, headlines: [...prev.headlines, ''] }))
    }
  }

  const removeHeadline = (index: number) => {
    if (config.headlines.length > 2) {
      setConfig(prev => ({
        ...prev,
        headlines: prev.headlines.filter((_, i) => i !== index)
      }))
    }
  }

  const updateHeadline = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      headlines: prev.headlines.map((h, i) => i === index ? value : h)
    }))
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

    // Convert numeric skepticism (0-100) to enum
    const getSkepticismLevel = (value: number): 'low' | 'medium' | 'high' | 'extreme' => {
      if (value <= 25) return 'low'
      if (value <= 50) return 'medium'
      if (value <= 75) return 'high'
      return 'extreme'
    }

    try {
      // For headline tests, join headlines as content and store array in panel_config
      const isHeadlineTest = config.stimulus_type === 'headline_test'
      const headlines = isHeadlineTest
        ? config.headlines.filter(h => h.trim().length >= 3)
        : []

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name: config.name,
          stimulus_type: config.stimulus_type,
          stimulus_content: isHeadlineTest
            ? headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')
            : config.stimulus_content,
          stimulus_context: config.brief,
          panel_config: {
            archetypes: config.archetype_ids,
            skepticism_override: getSkepticismLevel(config.skepticism_override),
            panel_size: config.archetype_ids.length,
            ...(isHeadlineTest && { headlines })  // Include headlines array for headline tests
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
                <Label>Test Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    { value: 'concept', label: 'Concept' },
                    { value: 'claim', label: 'Claim' },
                    { value: 'product_description', label: 'Product' },
                    { value: 'ad_copy', label: 'Ad Copy' },
                    { value: 'tagline', label: 'Tagline' },
                    { value: 'headline_test', label: 'Headlines' },
                  ] as const).map(type => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={config.stimulus_type === type.value ? 'default' : 'outline'}
                      onClick={() => updateConfig('stimulus_type', type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Headline Test Input */}
              {config.stimulus_type === 'headline_test' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Headlines to Test (minimum 3 required)</Label>
                      <p className="text-xs text-white-muted mt-1">
                        {config.headlines.filter(h => h.trim().length >= 3).length}/3 minimum entered
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHeadline}
                      disabled={config.headlines.length >= 30}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {config.headlines.map((headline, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex items-center justify-center w-8 h-10 text-sm text-muted-foreground font-mono">
                          {index + 1}.
                        </span>
                        <Input
                          value={headline}
                          onChange={e => updateHeadline(index, e.target.value)}
                          placeholder={`Headline ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeadline(index)}
                          disabled={config.headlines.length <= 2}
                          className="px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const validCount = config.headlines.filter(h => h.trim().length >= 3).length
                    const briefLength = config.brief.trim().length
                    const needsMoreHeadlines = validCount < 3
                    const needsMoreBrief = briefLength < 20
                    return (
                      <p className={`text-xs ${needsMoreHeadlines ? 'text-red-hot' : 'text-muted-foreground'}`}>
                        {needsMoreHeadlines
                          ? `Need ${3 - validCount} more headline${3 - validCount > 1 ? 's' : ''} (min 3 characters each). Currently have ${validCount}/3 minimum.`
                          : `${validCount} valid headlines. Personas will rank their top 3 and bottom 3.`
                        }
                        {needsMoreBrief && (
                          <span className="block mt-1 text-orange-accent">
                            Creative brief needs {20 - briefLength} more characters.
                          </span>
                        )}
                      </p>
                    )
                  })()}
                </div>
              ) : (
                /* Standard Stimulus Input */
                <div className="space-y-2">
                  <Label htmlFor="content">
                    {config.stimulus_type === 'concept' && 'Concept Description *'}
                    {config.stimulus_type === 'claim' && 'Claim Statement *'}
                    {config.stimulus_type === 'product_description' && 'Product Description *'}
                    {config.stimulus_type === 'ad_copy' && 'Ad Copy / Script *'}
                    {config.stimulus_type === 'tagline' && 'Tagline *'}
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
                        : config.stimulus_type === 'product_description'
                        ? 'Describe the product including key features...'
                        : config.stimulus_type === 'ad_copy'
                        ? 'Paste your ad copy or describe the ad...'
                        : 'Enter your tagline or slogan...'
                    }
                    rows={6}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brief">Creative Brief *</Label>
                <Textarea
                  id="brief"
                  value={config.brief}
                  onChange={e => updateConfig('brief', e.target.value)}
                  placeholder={config.stimulus_type === 'headline_test'
                    ? "Describe the brand, target audience, and what these headlines are for (e.g., email subject lines, social ads, website hero)..."
                    : "Describe the context for evaluation: target audience, brand positioning, campaign objectives..."
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {config.stimulus_type === 'headline_test'
                    ? "Help personas understand the context. E.g., \"These are email subject lines for a fitness app targeting millennials\""
                    : "Help personas understand what's reasonable to expect. E.g., \"This is a 15-second social media ad targeting Gen Z\""
                  }
                </p>
              </div>
            </>
          )}

          {currentStep === 'panel' && (
            <PanelSelector
              value={config.archetype_ids}
              onChange={ids => updateConfig('archetype_ids', ids)}
              maxSelection={12}
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
                  <span className="text-sm text-muted-foreground">Test Type:</span>
                  <p className="capitalize">{config.stimulus_type === 'headline_test' ? 'Headline Tournament' : config.stimulus_type.replace('_', ' ')}</p>
                </div>
                {config.stimulus_type === 'headline_test' ? (
                  <div>
                    <span className="text-sm text-muted-foreground">Headlines ({config.headlines.filter(h => h.trim()).length}):</span>
                    <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                      {config.headlines.filter(h => h.trim()).map((h, i) => (
                        <li key={i} className="truncate">{h}</li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm text-muted-foreground">Stimulus Content:</span>
                    <p className="whitespace-pre-wrap text-sm">{config.stimulus_content}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Creative Brief:</span>
                  <p className="whitespace-pre-wrap text-sm">{config.brief}</p>
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
