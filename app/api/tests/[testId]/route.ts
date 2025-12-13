import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get test with results
    const { data: test, error: testError } = await supabase
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
 * DELETE /api/tests/[testId]
 * Delete a test (only if draft or cancelled)
 */
export async function DELETE(
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

    // Check test exists and is deletable
    const { data: test, error: testError } = await supabase
      .from('pressure_tests')
      .select('id, status')
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
    const { error: deleteError } = await supabase
      .from('pressure_tests')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.error('Error deleting test:', deleteError)
      return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/tests/[testId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
