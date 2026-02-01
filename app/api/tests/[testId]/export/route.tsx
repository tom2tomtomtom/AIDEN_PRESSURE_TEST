import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PressureTestReport } from '@/lib/export/pdf-generator'
import type { TestData, ProjectData, TestResultData, PersonaResponseData } from '@/lib/export/pdf-generator'

interface RouteParams {
  params: Promise<{ testId: string }>
}

/**
 * GET /api/tests/[testId]/export
 * Generate and download PDF report for a test
 */
export async function GET(
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

    // Check for options in query params
    const searchParams = request.nextUrl.searchParams
    const includeAppendix = searchParams.get('appendix') !== 'false'

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

    // Check if test is completed
    if (test.status !== 'completed') {
      return NextResponse.json(
        { error: 'Cannot export a test that is not completed' },
        { status: 400 }
      )
    }

    // Get persona responses
    const { data: rawResponses } = await adminClient
      .from('persona_responses')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: true })

    // Get archetypes for the responses
    let archetypeMap = new Map<string, { id: string; name: string; slug: string; category: string; baseline_skepticism: string }>()

    if (rawResponses && rawResponses.length > 0) {
      const archetypeIds = [...new Set(rawResponses.map(r => r.archetype_id).filter(Boolean))]

      if (archetypeIds.length > 0) {
        const { data: archetypes } = await adminClient
          .from('archetypes')
          .select('id, name, slug, category, baseline_skepticism')
          .in('id', archetypeIds)

        archetypeMap = new Map(archetypes?.map(a => [a.id, a]) || [])
      }
    }

    // Transform data for PDF
    const testData: TestData = {
      id: test.id,
      name: test.name,
      stimulus_type: test.stimulus_type,
      stimulus_content: test.stimulus_content,
      stimulus_claims: test.stimulus_claims,
      status: test.status,
      created_at: test.created_at,
      started_at: test.started_at,
      completed_at: test.completed_at,
    }

    const projectData: ProjectData = {
      id: test.projects.id,
      name: test.projects.name,
      category: test.projects.category,
    }

    const resultData = test.test_results?.[0]
    if (!resultData) {
      return NextResponse.json({ error: 'No results found for this test' }, { status: 404 })
    }

    const testResultData: TestResultData = {
      pressure_score: resultData.pressure_score || 0,
      gut_attraction_index: resultData.gut_attraction_index || 0,
      credibility_score: resultData.credibility_score || 0,
      purchase_intent_avg: resultData.purchase_intent_avg,
      purchase_intent_distribution: resultData.purchase_intent_distribution,
      one_line_verdict: resultData.one_line_verdict,
      key_strengths: resultData.key_strengths || [],
      key_weaknesses: resultData.key_weaknesses || [],
      recommendations: resultData.recommendations || [],
      verbatim_highlights: resultData.verbatim_highlights || [],
      total_responses: resultData.total_responses,
      execution_time_ms: resultData.execution_time_ms,
    }

    // Transform persona responses
    const responses: PersonaResponseData[] = (rawResponses || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      archetype_id: r.archetype_id as string,
      archetype: archetypeMap.get(r.archetype_id as string) || {
        id: (r.archetype_id as string) || 'unknown',
        name: ((r.persona_context as Record<string, unknown>)?.archetype as string) || (r.archetype_id as string) || 'Unknown',
        slug: (r.archetype_id as string) || 'unknown',
        category: 'unknown',
        baseline_skepticism: ((r.persona_context as Record<string, unknown>)?.skepticism as string) || 'medium'
      },
      generated_name: (r.persona_name as string) || 'Unknown Persona',
      response_data: {
        gut_reaction: (r.gut_reaction as string) || '',
        considered_view: (r.considered_view as string) || '',
        social_response: (r.social_response as string) || '',
        private_thought: (r.private_thought as string) || '',
        purchase_intent: (r.purchase_intent as number) || 0,
        credibility_rating: (r.credibility_rating as number) || 0,
        emotional_response: (r.emotional_response as string) || 'neutral',
        key_concerns: (r.key_concerns as string[]) || [],
        what_would_convince: Array.isArray(r.what_would_convince)
          ? r.what_would_convince as string[]
          : r.what_would_convince
            ? [r.what_would_convince as string]
            : [],
        what_works: (r.what_works as string[]) || []
      },
      memories_used: (r.triggered_memories as string[]) || [],
      created_at: r.created_at as string,
    }))

    // Generate PDF using JSX
    const pdfBuffer = await renderToBuffer(
      <PressureTestReport
        test={testData}
        project={projectData}
        result={testResultData}
        responses={responses}
        options={{ includeAppendix }}
      />
    )

    // Create filename
    const sanitizedName = test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const date = new Date().toISOString().split('T')[0]
    const filename = `${sanitizedName}_pressure_test_${date}.pdf`

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)

    // Return PDF as download
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
