import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const authSupabase = await createAuthClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get user's organization
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ data: [] })
    }

    const { data, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authSupabase = await createAuthClient()
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 400 }
      )
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Get user's organization membership (use admin client to bypass RLS)
    const adminClient = createAdminClient()
    const { data: membership, error: memberError } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: { code: 'NO_ORG', message: 'User does not belong to an organization. Please contact support.' } },
        { status: 403 }
      )
    }

    // Insert project with the user's organization_id
    const { data, error } = await adminClient
      .from('projects')
      .insert({
        name: body.name,
        description: body.description || null,
        category: body.category || 'other',
        organization_id: membership.organization_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    revalidatePath('/projects')
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
