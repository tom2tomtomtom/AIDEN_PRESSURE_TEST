import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { executeTest, loadTestConfig } from '@/lib/test-execution/runner'
import { executeHeadlineTest, loadHeadlineTestConfig } from '@/lib/test-execution/headline-runner'

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
    const auth = await requireAuth()
    if (!auth.success) return auth.response

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Check test exists and is in draft status
    const { data: test, error: testError } = await adminClient
      .from('pressure_tests')
      .select('id, status, project_id, stimulus_type')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // If already running or completed, return success early
    if (test.status === 'running' || test.status === 'completed') {
      return NextResponse.json({
        testId: test.id,
        status: test.status,
        message: `Test is already ${test.status}`
      })
    }

    if (test.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot run test with status: ${test.status}` },
        { status: 400 }
      )
    }

    // Set status to running immediately before backgrounding
    const { error: updateError } = await adminClient
      .from('pressure_tests')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', testId)

    if (updateError) {
      console.error('Failed to update test status to running:', updateError)
      return NextResponse.json({ error: 'Failed to start test' }, { status: 500 })
    }

    // Check if this is a headline test
    const isHeadlineTest = test.stimulus_type === 'headline_test'

    if (isHeadlineTest) {
      // Load headline test config
      const headlineConfig = await loadHeadlineTestConfig(testId)
      if (!headlineConfig) {
        return NextResponse.json({ error: 'Failed to load headline test configuration' }, { status: 500 })
      }

      if (!headlineConfig.headlines || headlineConfig.headlines.length < 3) {
        return NextResponse.json(
          { error: 'Headline test must have at least 3 headlines' },
          { status: 400 }
        )
      }

      if (!headlineConfig.archetypeIds || headlineConfig.archetypeIds.length === 0) {
        return NextResponse.json(
          { error: 'Test panel must have at least one archetype' },
          { status: 400 }
        )
      }

      // Execute in background
      after(async () => {
        try {
          await executeHeadlineTest(headlineConfig)
        } catch (error) {
          console.error(`Background headline test execution failed for ${testId}:`, error)
        }
      })

      return NextResponse.json({
        testId,
        status: 'running',
        message: 'Headline test started in background'
      })
    }

    // Standard test execution
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

    // Execute in background
    after(async () => {
      try {
        await executeTest(config)
      } catch (error) {
        console.error(`Background test execution failed for ${testId}:`, error)
      }
    })

    return NextResponse.json({
      testId,
      status: 'running',
      message: 'Test started in background'
    })
  } catch (error) {
    console.error('Error in POST /api/tests/[testId]/run:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
