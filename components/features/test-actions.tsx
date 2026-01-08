'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Trash2, XCircle, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

      toast.success('Test started successfully')
      // Test started successfully - refresh to show running state and start polling
      await new Promise(resolve => setTimeout(resolve, 300))
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      toast.error(message)
      setIsRunning(false)
    }
    // Note: Don't set isRunning to false on success - page will refresh
  }

  const deleteTest = async () => {
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

      toast.success(`Test "${test.name}" deleted successfully`)
      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      toast.error(message)
      setIsDeleting(false)
      setIsDialogOpen(false)
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <DialogTitle>Delete Test</DialogTitle>
                </div>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-bold text-foreground">&quot;{test.name}&quot;</span>? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteTest}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Test
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <p className="text-sm text-primary border-2 border-primary px-3 py-2 bg-primary/10">{error}</p>
      )}
    </div>
  )
}
