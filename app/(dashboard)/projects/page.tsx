import Link from 'next/link'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/features/project-card'

export default async function ProjectsPage() {
  // Get authenticated user
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Please log in to view projects.</p>
      </div>
    )
  }

  // Use admin client to bypass RLS issues, but verify org membership
  const adminClient = createAdminClient()

  // Get user's organization
  const { data: membership } = await adminClient
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return (
      <div className="p-8 text-center">
        <p>No organization found. Please visit <a href="/debug" className="underline">/debug</a> to set up your organization.</p>
      </div>
    )
  }

  // Fetch projects for user's organization
  const { data: projects, error } = await adminClient
    .from('projects')
    .select('*')
    .eq('organization_id', membership.organization_id)
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
