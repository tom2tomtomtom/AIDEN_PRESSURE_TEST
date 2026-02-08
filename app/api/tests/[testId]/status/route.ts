import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ testId: string }>
}

/**
 * GET /api/tests/[testId]/status
 * Get test execution status
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { testId } = await params
    const auth = await requireAuth()
    if (!auth.success) return auth.response

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Get test status with basic results
    const { data: test, error: testError } = await adminClient
      .from('pressure_tests')
      .select(`
        id,
        name,
        status,
        started_at,
        completed_at,
        test_results (
          pressure_score,
          total_responses,
          execution_time_ms
        )
      `)
      .eq('id', testId)
      .single()

    if (testError) {
      if (testError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      }
      console.error('Error fetching test status:', testError)
      return NextResponse.json({ error: 'Failed to fetch test status' }, { status: 500 })
    }

    const result = test.test_results?.[0]

    return NextResponse.json({
      testId: test.id,
      name: test.name,
      status: test.status,
      startedAt: test.started_at,
      completedAt: test.completed_at,
      result: result ? {
        pressureScore: result.pressure_score,
        totalResponses: result.total_responses,
        executionTimeMs: result.execution_time_ms
      } : null
    })
  } catch (error) {
    console.error('Error in GET /api/tests/[testId]/status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
