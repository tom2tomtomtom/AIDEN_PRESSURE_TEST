'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { TestComparison } from '@/components/features/test-comparison'
import { GitCompare } from 'lucide-react'

interface Test {
  id: string
  name: string
  status: string
  created_at: string
}

interface TestResult {
  id: string
  name: string
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  one_line_verdict?: string
  created_at: string
}

interface TestComparisonSelectorProps {
  projectId: string
  tests: Test[]
  selectedTestA?: string
  selectedTestB?: string
  testA: TestResult | null
  testB: TestResult | null
}

export function TestComparisonSelector({
  projectId,
  tests,
  selectedTestA,
  selectedTestB,
  testA,
  testB,
}: TestComparisonSelectorProps) {
  const router = useRouter()

  const updateSelection = (testAId: string, testBId: string) => {
    const params = new URLSearchParams()
    if (testAId) params.set('testA', testAId)
    if (testBId) params.set('testB', testBId)
    router.push(`/projects/${projectId}/compare?${params.toString()}`)
  }

  if (tests.length < 2) {
    return (
      <Card className="border-border-subtle">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium mb-2">Not enough tests to compare</p>
            <p className="text-sm text-muted-foreground">
              Complete at least 2 tests in this project to compare their results
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Test Selectors */}
      <Card className="border-border-subtle">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Test A (Baseline)
              </label>
              <select
                value={selectedTestA || ''}
                onChange={(e) => updateSelection(e.target.value, selectedTestB || '')}
                className="w-full bg-black-deep border border-border-subtle px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select a test...</option>
                {tests
                  .filter((t) => t.id !== selectedTestB)
                  .map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} ({new Date(test.created_at).toLocaleDateString()})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Test B (Comparison)
              </label>
              <select
                value={selectedTestB || ''}
                onChange={(e) => updateSelection(selectedTestA || '', e.target.value)}
                className="w-full bg-black-deep border border-border-subtle px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select a test...</option>
                {tests
                  .filter((t) => t.id !== selectedTestA)
                  .map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name} ({new Date(test.created_at).toLocaleDateString()})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {testA && testB ? (
        <TestComparison testA={testA} testB={testB} />
      ) : (
        <Card className="border-border-subtle border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium mb-2">Select two tests to compare</p>
              <p className="text-sm text-muted-foreground">
                Choose Test A (baseline) and Test B (comparison) from the dropdowns above
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
