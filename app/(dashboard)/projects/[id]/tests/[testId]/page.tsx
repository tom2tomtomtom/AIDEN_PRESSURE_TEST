import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestActions } from '@/components/features/test-actions'
import { TestResults } from '@/components/features/test-results'
import { HeadlineResults } from '@/components/features/headline-results'
import { TestExecutionView } from '@/components/features/test-execution-view'
import { ArchetypeQuotes } from '@/components/results/archetype-quotes'
import { HiddenConcerns } from '@/components/results/hidden-concerns'
import { ReactionSpectrum } from '@/components/results/reaction-spectrum'
import { ConversationTranscript } from '@/components/results/conversation-transcript'
import { PersonaResponsesEnhanced } from '@/components/features/persona-responses-enhanced'

interface TestPageProps {
  params: Promise<{ id: string; testId: string }>
}

const statusColors: Record<string, string> = {
  draft: 'border-border bg-secondary text-secondary-foreground',
  running: 'border-primary bg-primary/20 text-primary',
  completed: 'border-green-500 bg-green-500/20 text-green-400',
  failed: 'border-primary bg-primary/20 text-primary',
  cancelled: 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
}

const stimulusLabels: Record<string, string> = {
  concept: 'Concept Test',
  claim: 'Claim Validation',
  product: 'Product Test',
  ad: 'Ad Test'
}

export default async function TestPage({ params }: TestPageProps) {
  const { id, testId } = await params

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

  // Get test with results
  const { data: test, error } = await adminClient
    .from('pressure_tests')
    .select('*')
    .eq('id', testId)
    .eq('project_id', id)
    .single()

  if (error || !test) {
    notFound()
  }

  // Get test results if completed
  const { data: results } = await adminClient
    .from('test_results')
    .select('*')
    .eq('test_id', testId)
    .single()

  // Get persona responses
  const { data: responses, error: responsesError } = await adminClient
    .from('persona_responses')
    .select(`
      *,
      archetype:archetypes(id, name, slug, category, baseline_skepticism)
    `)
    .eq('test_id', testId)
    .order('created_at', { ascending: true })

  // Debug logging
  console.log('[Test Page] responses count:', responses?.length || 0)
  console.log('[Test Page] responses error:', responsesError)
  if (responses?.length) {
    console.log('[Test Page] first response:', JSON.stringify(responses[0], null, 2))
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
        <span className="text-sm">{test.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{test.name}</h1>
            <Badge className={statusColors[test.status] || statusColors.draft}>
              {test.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {stimulusLabels[test.stimulus_type] || test.stimulus_type} • Created {new Date(test.created_at).toLocaleDateString()}
          </p>
        </div>
        <TestActions test={test} projectId={id} />
      </div>

      {/* Stimulus Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stimulus</CardTitle>
          <CardDescription>What&apos;s being tested</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm">{test.stimulus_content}</div>
          {test.stimulus_context && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-1">Additional Context</p>
              <p className="text-sm">{test.stimulus_context}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {test.status === 'completed' && results && (
        <div id="test-results" className="space-y-6">
          {/* Check if this is a headline test */}
          {results.raw_analysis?.type === 'headline_test' ? (
            <HeadlineResults
              data={results.raw_analysis}
              totalResponses={results.total_responses || 0}
            />
          ) : (
            <>
              <TestResults results={results} />

              {/* New insight components */}
              {responses && responses.length > 0 && (
                <>
                  {/* Reaction spectrum visualization */}
                  <ReactionSpectrum responses={responses} />

                  {/* Notable voices - strongest supporters and critics */}
                  <ArchetypeQuotes responses={responses} />

                  {/* Hidden concerns - social vs private tension */}
                  <HiddenConcerns responses={responses} />

                  {/* Enhanced persona responses with view modes */}
                  <PersonaResponsesEnhanced responses={responses} />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Running Status - with real-time progress tracking */}
      {test.status === 'running' && (
        <TestExecutionView
          testId={testId}
          initialStatus={test.status}
        />
      )}

      {/* Draft State */}
      {test.status === 'draft' && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="font-medium mb-2">Ready to run</p>
              <p className="text-sm text-muted-foreground mb-4">
                Click &quot;Run Test&quot; to start generating responses from your phantom consumer panel
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Transcripts */}
      {responses && responses.length > 0 && (
        <ConversationTranscript
          responses={responses}
          stimulus={test.stimulus_content}
          stimulusType={stimulusLabels[test.stimulus_type] || test.stimulus_type}
        />
      )}
    </div>
  )
}
