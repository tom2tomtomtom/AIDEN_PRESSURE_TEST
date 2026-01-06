'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TestStatusPollerProps {
  testId: string
  projectId: string
  initialStatus: string
}

export function TestStatusPoller({ testId, projectId, initialStatus }: TestStatusPollerProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [dots, setDots] = useState('')

  useEffect(() => {
    // Only poll if status is 'running'
    if (status !== 'running') return

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // Poll for status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/tests/${testId}/status`)
        if (response.ok) {
          const data = await response.json()

          if (data.status === 'completed') {
            setStatus('completed')
            // Navigate to the test results page
            router.refresh()
            // Scroll to results section
            setTimeout(() => {
              const resultsSection = document.getElementById('test-results')
              if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth' })
              }
            }, 500)
          } else if (data.status === 'failed' || data.status === 'cancelled') {
            setStatus(data.status)
            router.refresh()
          }
        }
      } catch (error) {
        console.error('Failed to poll test status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval)
      clearInterval(dotsInterval)
    }
  }, [status, testId, projectId, router])

  if (status !== 'running') return null

  return (
    <div className="border-2 border-primary bg-primary/5 p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="font-bold text-xl uppercase tracking-wider text-primary">
          Test Running{dots}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Generating responses from phantom consumers
        </p>
        <p className="text-xs text-muted-foreground mt-4 border border-border px-3 py-1">
          Auto-navigating to results when complete
        </p>
      </div>
    </div>
  )
}
