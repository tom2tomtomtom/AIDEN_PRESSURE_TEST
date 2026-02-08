import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestActions } from '@/components/features/test-actions'
import { ExportButton } from '@/components/features/export-button'
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
  const user = await getUser()

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

  // Get persona responses (without archetype join - relationship not set up)
  const { data: rawResponses } = await adminClient
    .from('persona_responses')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: true })

  // Transform flat DB structure to nested structure expected by components
  let responses: Array<{
    id: string
    archetype_id: string
    archetype: {
      id: string
      name: string
      slug: string
      category: string
      baseline_skepticism: string
    }
    generated_name: string
    response_data: {
      gut_reaction: string
      considered_view: string
      social_response: string
      private_thought: string
      purchase_intent: number
      credibility_rating: number
      emotional_response: string
      key_concerns: string[]
      what_would_convince: string[]
      what_works?: string[]
    }
    memories_used: string[]
    created_at: string
  }> | null = null

  if (rawResponses && rawResponses.length > 0) {
    // Get archetypes separately
    const archetypeIds = [...new Set(rawResponses.map(r => r.archetype_id).filter(Boolean))]
    let archetypeMap = new Map<string, { id: string; name: string; slug: string; category: string; baseline_skepticism: string }>()

    if (archetypeIds.length > 0) {
      const { data: archetypes } = await adminClient
        .from('archetypes')
        .select('id, name, slug, category, baseline_skepticism')
        .in('id', archetypeIds)

      archetypeMap = new Map(archetypes?.map(a => [a.id, a]) || [])
    }

    // Transform responses to expected structure
    responses = rawResponses.map(r => ({
      id: r.id,
      archetype_id: r.archetype_id,
      archetype: archetypeMap.get(r.archetype_id) || {
        id: r.archetype_id || 'unknown',
        name: r.persona_context?.archetype || r.archetype_id || 'Unknown',
        slug: r.archetype_id || 'unknown',
        category: 'unknown',
        baseline_skepticism: r.persona_context?.skepticism || 'medium'
      },
      generated_name: r.persona_name || 'Unknown Persona',
      response_data: {
        gut_reaction: r.gut_reaction || '',
        considered_view: r.considered_view || '',
        social_response: r.social_response || '',
        private_thought: r.private_thought || '',
        purchase_intent: r.purchase_intent || 0,
        credibility_rating: r.credibility_rating || 0,
        emotional_response: r.emotional_response || 'neutral',
        key_concerns: r.key_concerns || [],
        what_would_convince: Array.isArray(r.what_would_convince)
          ? r.what_would_convince
          : r.what_would_convince
            ? [r.what_would_convince]
            : [],
        what_works: r.what_works || []
      },
      memories_used: r.triggered_memories || [],
      created_at: r.created_at
    }))
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
        <div className="flex gap-2">
          {test.status === 'completed' && (
            <ExportButton testId={testId} testName={test.name} />
          )}
          <TestActions test={test} projectId={id} />
        </div>
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
