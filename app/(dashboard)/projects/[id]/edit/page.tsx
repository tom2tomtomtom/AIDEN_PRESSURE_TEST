import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectForm } from '@/components/forms/project-form'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground">
          Update your project details.
        </p>
      </div>
      <ProjectForm mode="edit" initialData={project} />
    </div>
  )
}
