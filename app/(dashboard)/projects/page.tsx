import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/features/project-card'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your research projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">New Project</Link>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          Error loading projects: {error.message}
        </div>
      )}

      {!error && projects?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-muted-foreground mt-1">
            Get started by creating your first project.
          </p>
          <Button asChild className="mt-4">
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
