'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Trash2, XCircle } from 'lucide-react'

interface Test {
  id: string
  status: string
  name: string
}

interface TestActionsProps {
  test: Test
  projectId: string
}

export function TestActions({ test, projectId }: TestActionsProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const response = await fetch(`/api/tests/${test.id}/run`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run test')
      }

      // Test started successfully - refresh to show running state and start polling
      await new Promise(resolve => setTimeout(resolve, 300))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsRunning(false)
    }
    // Note: Don't set isRunning to false on success - page will refresh
  }

  const deleteTest = async () => {
    if (!confirm(`Are you sure you want to delete "${test.name}"?`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete test')
      }

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {test.status === 'draft' && (
          <Button onClick={runTest} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        )}

        {test.status === 'running' && (
          <Button variant="destructive" disabled>
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}

        {(test.status === 'draft' || test.status === 'failed' || test.status === 'cancelled') && (
          <Button
            variant="outline"
            onClick={deleteTest}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-primary border-2 border-primary px-3 py-2 bg-primary/10">{error}</p>
      )}
    </div>
  )
}
