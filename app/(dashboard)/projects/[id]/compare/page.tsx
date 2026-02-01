import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TestComparisonSelector } from './test-comparison-selector'

interface ComparePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ testA?: string; testB?: string }>
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const { id } = await params
  const { testA: testAId, testB: testBId } = await searchParams

  // Get authenticated user
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
    redirect('/debug')
  }

  // Get project
  const { data: project } = await adminClient
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (!project) {
    notFound()
  }

  // Get all completed tests for this project
  const { data: tests } = await adminClient
    .from('pressure_tests')
    .select('id, name, status, created_at')
    .eq('project_id', id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // Get test results if tests are selected
  let testA = null
  let testB = null

  if (testAId) {
    const { data: testAResult } = await adminClient
      .from('test_results')
      .select(`
        *,
        test:pressure_tests(id, name, created_at)
      `)
      .eq('test_id', testAId)
      .single()

    if (testAResult?.test) {
      testA = {
        id: testAResult.test.id,
        name: testAResult.test.name,
        pressure_score: testAResult.pressure_score,
        gut_attraction_index: testAResult.gut_attraction_index,
        credibility_score: testAResult.credibility_score,
        one_line_verdict: testAResult.one_line_verdict,
        created_at: testAResult.test.created_at,
      }
    }
  }

  if (testBId) {
    const { data: testBResult } = await adminClient
      .from('test_results')
      .select(`
        *,
        test:pressure_tests(id, name, created_at)
      `)
      .eq('test_id', testBId)
      .single()

    if (testBResult?.test) {
      testB = {
        id: testBResult.test.id,
        name: testBResult.test.name,
        pressure_score: testBResult.pressure_score,
        gut_attraction_index: testBResult.gut_attraction_index,
        credibility_score: testBResult.credibility_score,
        one_line_verdict: testBResult.one_line_verdict,
        created_at: testBResult.test.created_at,
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/projects/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          {project.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">Compare Tests</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Compare Tests</h1>
        <p className="text-muted-foreground mt-1">
          Compare results between two tests to track improvements
        </p>
      </div>

      {/* Test Selector */}
      <TestComparisonSelector
        projectId={id}
        tests={tests || []}
        selectedTestA={testAId}
        selectedTestB={testBId}
        testA={testA}
        testB={testB}
      />
    </div>
  )
}
