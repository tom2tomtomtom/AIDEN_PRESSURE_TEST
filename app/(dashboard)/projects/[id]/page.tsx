import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteProjectButton } from '@/components/features/delete-project-button'
import { DeleteTestButton } from '@/components/features/delete-test-button'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

const categoryLabels: Record<string, string> = {
  fmcg: 'FMCG',
  services: 'Services',
  premium: 'Premium',
  tech: 'Tech',
  finance: 'Finance',
  healthcare: 'Healthcare',
  retail: 'Retail',
  other: 'Other',
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

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

  const { data: project, error } = await adminClient
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get tests for this project
  const { data: tests } = await adminClient
    .from('pressure_tests')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const categoryLabel = categoryLabels[project.category] || project.category

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              Projects
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
              {categoryLabel}
            </span>
            <span className="text-sm text-muted-foreground">
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${id}/edit`}>Edit</Link>
          </Button>
          <DeleteProjectButton projectId={id} projectName={project.name} />
        </div>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pressure Tests</CardTitle>
            <CardDescription>Run tests to validate your concepts</CardDescription>
          </div>
          <div className="flex gap-2">
            {tests && tests.filter(t => t.status === 'completed').length >= 2 && (
              <Button asChild variant="outline">
                <Link href={`/projects/${id}/compare`}>Compare Tests</Link>
              </Button>
            )}
            <Button asChild>
              <Link href={`/projects/${id}/tests/new`}>New Test</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tests || tests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tests yet</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href={`/projects/${id}/tests/new`}>Create your first test</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tests.map((test) => (
                <div key={test.id} className="relative group">
                  <Link
                    href={`/projects/${id}/tests/${test.id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.stimulus_type.replace('_', ' ')} • <span className="capitalize">{test.status}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(test.created_at).toLocaleDateString()}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteTestButton testId={test.id} testName={test.name} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
