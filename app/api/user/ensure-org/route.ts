import { NextResponse } from 'next/server'
import { createAuthClient, createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    // Get current user
    const authSupabase = await createAuthClient()
    const { data: { user }, error: userError } = await authSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Check if user has an organization
    const { data: existingMembership } = await adminSupabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        message: 'User already has an organization',
        organizationId: existingMembership.organization_id
      })
    }

    // Create a new organization for the user
    const orgName = user.email ? `${user.email.split('@')[0]}'s Organization` : 'My Organization'
    const orgSlug = `org-${user.id.slice(0, 8)}-${Date.now()}`

    const { data: newOrg, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: orgName,
        slug: orgSlug,
      })
      .select('id')
      .single()

    if (orgError || !newOrg) {
      console.error('Failed to create organization:', orgError)
      return NextResponse.json({ error: 'Failed to create organization', details: orgError }, { status: 500 })
    }

    // Add user as owner of the new organization
    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Failed to add user to organization:', memberError)
      return NextResponse.json({ error: 'Failed to add user to organization', details: memberError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Organization created',
      organizationId: newOrg.id
    })
  } catch (error: any) {
    console.error('Error ensuring org:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get current user
    const authSupabase = await createAuthClient()
    const { data: { user }, error: userError } = await authSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated', authenticated: false }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if user has an organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(name, slug)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      email: user.email,
      hasOrganization: !!membership,
      organization: membership || null,
      error: memberError?.message
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
