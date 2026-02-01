'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TestProgressTracker } from './test-progress-tracker'
import { TestCompleteModal } from './test-complete-modal'

interface TestExecutionViewProps {
  testId: string
  initialStatus: string
}

export function TestExecutionView({ testId, initialStatus }: TestExecutionViewProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [results, setResults] = useState<{
    pressure_score: number
    gut_attraction_index: number
    credibility_score: number
    one_line_verdict?: string
  } | null>(null)

  const handleComplete = (testResults: any) => {
    // Extract scores from results
    if (testResults) {
      setResults({
        pressure_score: testResults.pressure_score || 0,
        gut_attraction_index: testResults.gut_attraction_index || 0,
        credibility_score: testResults.credibility_score || 0,
        one_line_verdict: testResults.one_line_verdict,
      })
      setShowModal(true)
    }
  }

  const handleViewResults = () => {
    setShowModal(false)
    // Scroll to results section
    const resultsSection = document.getElementById('test-results')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' })
    }
    // Refresh to get updated data
    router.refresh()
  }

  return (
    <>
      <TestProgressTracker
        testId={testId}
        initialStatus={initialStatus}
        onComplete={handleComplete}
      />

      {results && (
        <TestCompleteModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            router.refresh()
          }}
          pressureScore={results.pressure_score}
          gutIndex={results.gut_attraction_index}
          credibilityScore={results.credibility_score}
          verdict={results.one_line_verdict}
          onViewResults={handleViewResults}
        />
      )}
    </>
  )
}
