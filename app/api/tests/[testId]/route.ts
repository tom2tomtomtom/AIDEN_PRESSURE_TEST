import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface RouteParams {
  params: Promise<{ testId: string }>
}

/**
 * GET /api/tests/[testId]
 * Get a single test with full results
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { testId } = await params
    const authSupabase = await createAuthClient()

    // Verify authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Get test with results
    const { data: test, error: testError } = await adminClient
      .from('pressure_tests')
      .select(`
        *,
        projects (
          id,
          name,
          category
        ),
        test_results (
          *
        ),
        persona_responses (
          *
        )
      `)
      .eq('id', testId)
      .single()

    if (testError) {
      if (testError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      }
      console.error('Error fetching test:', testError)
      return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 })
    }

    // Format response
    const result = test.test_results?.[0] || null
    const responses = test.persona_responses || []

    return NextResponse.json({
      test: {
        id: test.id,
        name: test.name,
        stimulus_type: test.stimulus_type,
        stimulus_content: test.stimulus_content,
        stimulus_claims: test.stimulus_claims,
        panel_config: test.panel_config,
        status: test.status,
        created_at: test.created_at,
        started_at: test.started_at,
        completed_at: test.completed_at
      },
      project: test.projects,
      result: result ? {
        pressure_score: result.pressure_score,
        gut_attraction_index: result.gut_attraction_index,
        credibility_score: result.credibility_score,
        purchase_intent_avg: result.purchase_intent_avg,
        key_strengths: result.key_strengths,
        key_weaknesses: result.key_weaknesses,
        recommendations: result.recommendations,
        verbatim_highlights: result.verbatim_highlights,
        total_responses: result.total_responses,
        execution_time_ms: result.execution_time_ms
      } : null,
      responses: responses.map((r: Record<string, unknown>) => ({
        id: r.id,
        archetype_id: r.archetype_id,
        persona_name: r.persona_name,
        persona_context: r.persona_context,
        gut_reaction: r.gut_reaction,
        considered_view: r.considered_view,
        social_response: r.social_response,
        private_thought: r.private_thought,
        purchase_intent: r.purchase_intent,
        credibility_rating: r.credibility_rating,
        emotional_response: r.emotional_response,
        triggered_memories: r.triggered_memories,
        memory_influence_summary: r.memory_influence_summary
      }))
    })
  } catch (error) {
    console.error('Error in GET /api/tests/[testId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tests/[testId]
 * Update test status (e.g., cancel a running test)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { testId } = await params
    const authSupabase = await createAuthClient()

    // Verify authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Only allow cancellation for now
    if (status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Only cancellation is supported' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Check test exists and is running
    const { data: test, error: testError } = await adminClient
      .from('pressure_tests')
      .select('id, status, project_id')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (test.status !== 'running') {
      return NextResponse.json(
        { error: 'Can only cancel a running test' },
        { status: 400 }
      )
    }

    // Update test status to cancelled
    const { error: updateError } = await adminClient
      .from('pressure_tests')
      .update({ status: 'cancelled' })
      .eq('id', testId)

    if (updateError) {
      console.error('Error cancelling test:', updateError)
      return NextResponse.json({ error: 'Failed to cancel test' }, { status: 500 })
    }

    revalidatePath(`/projects/${test.project_id}`)
    revalidatePath(`/projects/${test.project_id}/tests/${testId}`)
    return NextResponse.json({ success: true, status: 'cancelled' })
  } catch (error) {
    console.error('Error in PATCH /api/tests/[testId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/tests/[testId]
 * Delete a test (only if draft or cancelled)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { testId } = await params
    const authSupabase = await createAuthClient()

    // Verify authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Check test exists and is deletable
    const { data: test, error: testError } = await adminClient
      .from('pressure_tests')
      .select('id, status, project_id')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (!['draft', 'cancelled', 'failed'].includes(test.status)) {
      return NextResponse.json(
        { error: 'Cannot delete a running or completed test' },
        { status: 400 }
      )
    }

    // Delete test
    const { error: deleteError } = await adminClient
      .from('pressure_tests')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.error('Error deleting test:', deleteError)
      return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
    }

    revalidatePath(`/projects/${test.project_id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/tests/[testId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
