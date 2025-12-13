import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeTest, loadTestConfig } from '@/lib/test-execution/runner'

interface RouteParams {
  params: Promise<{ testId: string }>
}

/**
 * POST /api/tests/[testId]/run
 * Execute a pressure test
 */
export async function POST(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { testId } = await params
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check test exists and is in draft status
    const { data: test, error: testError } = await supabase
      .from('pressure_tests')
      .select('id, status, project_id')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (test.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot run test with status: ${test.status}` },
        { status: 400 }
      )
    }

    // Load test configuration
    const config = await loadTestConfig(testId)
    if (!config) {
      return NextResponse.json({ error: 'Failed to load test configuration' }, { status: 500 })
    }

    // Validate panel config
    if (!config.archetypeIds || config.archetypeIds.length === 0) {
      return NextResponse.json(
        { error: 'Test panel must have at least one archetype' },
        { status: 400 }
      )
    }

    // Execute test (this runs synchronously for now - could be backgrounded)
    // For a real app, you might want to use a job queue here
    const result = await executeTest(config)

    if (result.status === 'failed') {
      return NextResponse.json(
        {
          error: 'Test execution failed',
          details: result.error,
          testId: result.testId
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      testId: result.testId,
      status: result.status,
      responseCount: result.responses.length,
      failedCount: result.failedResponses.length,
      executionTimeMs: result.executionTimeMs,
      usage: result.totalUsage,
      pressureScore: result.aggregation?.analysis.pressure_score || null
    })
  } catch (error) {
    console.error('Error in POST /api/tests/[testId]/run:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
