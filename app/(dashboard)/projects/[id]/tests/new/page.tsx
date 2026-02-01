import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TestWizard } from '@/components/forms/test-wizard'

interface NewTestPageProps {
  params: Promise<{ id: string }>
}

export default async function NewTestPage({ params }: NewTestPageProps) {
  const { id } = await params

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

  // Verify project exists and user has access
  const { data: project, error } = await adminClient
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/projects/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          {project.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">New Test</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Pressure Test</h1>
        <p className="text-muted-foreground mt-2">
          Configure your test to validate concepts with phantom consumers
        </p>
      </div>

      <TestWizard projectId={id} />
    </div>
  )
}
