import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteProjectButton } from '@/components/features/delete-project-button'

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
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get tests for this project
  const { data: tests } = await supabase
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
          <Button asChild>
            <Link href={`/projects/${id}/tests/new`}>New Test</Link>
          </Button>
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
                <Link
                  key={test.id}
                  href={`/projects/${id}/tests/${test.id}`}
                  className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {test.stimulus_type} • {test.status}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(test.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
