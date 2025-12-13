import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createAuthClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user has an organization, if not create one
      await ensureUserHasOrganization(data.user.id, data.user.email)

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/error?message=Could not authenticate user`)
}

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
    // User already has an org
    return
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
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: newOrg.id,
      user_id: userId,
      role: 'owner',
    })

  if (memberError) {
    console.error('Failed to add user to organization:', memberError)
  }
}
