import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

async function ensureUserHasOrganization(userId: string, email: string | undefined) {
  const supabase = createAdminClient()

  // Check if user already has an organization membership
  const { data: existingMembership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single()

  if (existingMembership) {
    return // User already has an org
  }

  // Create a new organization for the user
  const orgName = email ? `${email.split('@')[0]}'s Organization` : 'My Organization'
  const orgSlug = `org-${userId.slice(0, 8)}-${Date.now()}`

  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName,
      slug: orgSlug,
    })
    .select('id')
    .single()

  if (orgError || !newOrg) {
    console.error('Failed to create organization:', orgError)
    return
  }

  // Add user as owner of the new organization
  await supabase
    .from('organization_members')
    .insert({
      organization_id: newOrg.id,
      user_id: userId,
      role: 'owner',
    })
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure user has an organization (auto-provision if needed)
  await ensureUserHasOrganization(user.id, user.email)

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <Sidebar />
      <main className="md:pl-64 pt-14">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
