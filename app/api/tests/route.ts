import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for creating a test
const createTestSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  stimulus_type: z.enum(['concept', 'claim', 'ad_copy', 'product_description', 'tagline', 'headline_test']),
  stimulus_content: z.string().min(10),
  stimulus_context: z.string().optional(),  // Brief/context field
  stimulus_claims: z.array(z.string()).optional(),
  panel_config: z.object({
    archetypes: z.array(z.string().uuid()),
    skepticism_override: z.enum(['low', 'medium', 'high', 'extreme']).optional(),
    panel_size: z.number().min(1).max(16).optional(),
    headlines: z.array(z.string()).optional()  // For headline tests
  })
})

/**
 * POST /api/tests
 * Create a new pressure test
 */
export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createAuthClient()

    // Verify authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Get user's organization
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createTestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { project_id, name, stimulus_type, stimulus_content, stimulus_context, stimulus_claims, panel_config } = validationResult.data

    // Verify user has access to project
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id, organization_id')
      .eq('id', project_id)
      .eq('organization_id', membership.organization_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create test
    const { data: test, error: createError } = await adminClient
      .from('pressure_tests')
      .insert({
        project_id,
        name,
        stimulus_type,
        stimulus_content,
        stimulus_context: stimulus_context || null,
        stimulus_claims: stimulus_claims || [],
        panel_config,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating test:', createError)
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
    }

    revalidatePath(`/projects/${project_id}`)
    return NextResponse.json({ test }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/tests
 * List tests for a project
 */
export async function GET(request: NextRequest) {
  try {
    const authSupabase = await createAuthClient()

    // Verify authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS issues
    const adminClient = createAdminClient()

    // Get user's organization
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 })
    }

    // Get project_id from query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    }

    // Verify user has access to project
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('organization_id', membership.organization_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get tests with basic result info
    const { data: tests, error: testsError } = await adminClient
      .from('pressure_tests')
      .select(`
        id,
        name,
        stimulus_type,
        status,
        created_at,
        started_at,
        completed_at,
        test_results (
          pressure_score,
          gut_attraction_index,
          credibility_score
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (testsError) {
      console.error('Error fetching tests:', testsError)
      return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
    }

    // Format response
    const formattedTests = tests?.map(test => ({
      ...test,
      scores: test.test_results?.[0] || null,
      test_results: undefined
    }))

    return NextResponse.json({ tests: formattedTests })
  } catch (error) {
    console.error('Error in GET /api/tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
