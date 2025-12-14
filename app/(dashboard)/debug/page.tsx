import { createAuthClient, createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

async function createOrgAction() {
  'use server'

  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) return

  const adminSupabase = createAdminClient()

  // Create org
  const orgName = user.email ? `${user.email.split('@')[0]}'s Organization` : 'My Organization'
  const orgSlug = `org-${user.id.slice(0, 8)}-${Date.now()}`

  const { data: newOrg, error: orgError } = await adminSupabase
    .from('organizations')
    .insert({ name: orgName, slug: orgSlug })
    .select('id')
    .single()

  if (orgError || !newOrg) return

  // Add user as owner
  await adminSupabase
    .from('organization_members')
    .insert({
      organization_id: newOrg.id,
      user_id: user.id,
      role: 'owner',
    })

  revalidatePath('/debug')
}

export default async function DebugPage() {
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return <div className="p-8">Not authenticated</div>
  }

  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // Check org membership with admin client (bypasses RLS)
  const { data: membership, error: memberError } = await adminSupabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  // Try to get projects
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .limit(5)

  // Get archetypes count to test read access
  const { count: archetypeCount, error: archError } = await supabase
    .from('persona_archetypes')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Info</h1>

      <div className="bg-gray-900 p-4 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">User</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
        </pre>
      </div>

      <div className={`p-4 rounded-lg space-y-4 ${membership ? 'bg-green-900' : 'bg-red-900'}`}>
        <h2 className="text-xl font-semibold">Organization Membership</h2>
        {membership ? (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(membership, null, 2)}
          </pre>
        ) : (
          <div>
            <p className="text-red-300 mb-4">No organization found! Error: {memberError?.message}</p>
            <form action={createOrgAction}>
              <Button type="submit">Create Organization</Button>
            </form>
          </div>
        )}
      </div>

      <div className={`p-4 rounded-lg space-y-4 ${projects ? 'bg-green-900' : 'bg-yellow-900'}`}>
        <h2 className="text-xl font-semibold">Projects Access</h2>
        {projectError ? (
          <p className="text-red-300">Error: {projectError.message} (Code: {projectError.code})</p>
        ) : (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(projects, null, 2)}
          </pre>
        )}
      </div>

      <div className={`p-4 rounded-lg space-y-4 ${archetypeCount !== null ? 'bg-green-900' : 'bg-yellow-900'}`}>
        <h2 className="text-xl font-semibold">Archetypes Access</h2>
        {archError ? (
          <p className="text-red-300">Error: {archError.message}</p>
        ) : (
          <p>Found {archetypeCount} archetypes</p>
        )}
      </div>

      <div className="mt-8">
        <a href="/dashboard" className="text-blue-400 hover:underline">← Back to Dashboard</a>
      </div>
    </div>
  )
}
