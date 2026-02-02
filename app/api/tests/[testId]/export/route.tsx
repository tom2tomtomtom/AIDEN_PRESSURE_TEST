import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePDF } from '@/lib/export/jspdf-generator'

interface RouteParams {
  params: Promise<{ testId: string }>
}

/**
 * GET /api/tests/[testId]/export
 * Generate and download PDF report for a test
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

    const resultData = test.test_results?.[0]
    if (!resultData) {
      return NextResponse.json({ error: 'No results found for this test' }, { status: 404 })
    }

    // Generate PDF using jsPDF (no React dependency)
    console.log('[PDF Export] Generating PDF with jsPDF...')

    const pdfArrayBuffer = generatePDF(
      {
        name: test.name,
        stimulus_type: test.stimulus_type,
        created_at: test.created_at,
        completed_at: test.completed_at
      },
      {
        name: test.projects.name
      },
      {
        pressure_score: resultData.pressure_score || 0,
        gut_attraction_index: resultData.gut_attraction_index || 0,
        credibility_score: resultData.credibility_score || 0,
        purchase_intent_avg: resultData.purchase_intent_avg,
        one_line_verdict: resultData.one_line_verdict,
        key_strengths: resultData.key_strengths,
        key_weaknesses: resultData.key_weaknesses,
        recommendations: resultData.recommendations,
        verbatim_highlights: resultData.verbatim_highlights
      }
    )

    console.log('[PDF Export] PDF generated, size:', pdfArrayBuffer.byteLength)
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

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
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      {
        error: 'Failed to generate PDF report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Force Node.js runtime (not Edge) for PDF generation
export const runtime = 'nodejs'
