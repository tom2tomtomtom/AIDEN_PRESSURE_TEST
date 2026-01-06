'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TestStatusPollerProps {
  testId: string
  initialStatus: string
}

export function TestStatusPoller({ testId, initialStatus }: TestStatusPollerProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [dots, setDots] = useState('')
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/status`, {
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        // If we get an error, just refresh the page to get latest state
        if (response.status === 401) {
          router.refresh()
          return
        }
        // For other errors, try refreshing to check actual status
        router.refresh()
        return
      }

      const data = await response.json()

      if (data.status === 'completed') {
        setStatus('completed')
        router.refresh()
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
    } catch (err) {
      console.error('Failed to poll test status:', err)
      // On network error, try refreshing the page
      setError('Connection issue - refreshing...')
      setTimeout(() => router.refresh(), 1000)
    }
  }, [testId, router])

  useEffect(() => {
    if (status !== 'running') return

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // Initial check
    const initialCheck = setTimeout(checkStatus, 1000)

    // Poll for status every 3 seconds
    const pollInterval = setInterval(checkStatus, 3000)

    return () => {
      clearTimeout(initialCheck)
      clearInterval(pollInterval)
      clearInterval(dotsInterval)
    }
  }, [status, checkStatus])

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
        {error ? (
          <p className="text-xs text-primary mt-4 border border-primary px-3 py-1">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-4 border border-border px-3 py-1">
            Auto-navigating to results when complete
          </p>
        )}
      </div>
    </div>
  )
}
