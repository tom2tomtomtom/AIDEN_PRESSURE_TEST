import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.success) return auth.response

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
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

async function updateProject(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.success) return auth.response
    const user = auth.user

    const body = await request.json()

    // Use admin client to verify user owns the project's organization
    const adminClient = createAdminClient()

    // Get the project's organization_id
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    // Verify user is a member of the project's organization
    const { data: membership, error: memberError } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', project.organization_id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have access to this project' } },
        { status: 403 }
      )
    }

    // Update the project
    const { data, error } = await adminClient
      .from('projects')
      .update({
        name: body.name,
        description: body.description,
        category: body.category,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    revalidatePath('/projects')
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteParams) {
  return updateProject(request, context)
}

export async function PUT(request: Request, context: RouteParams) {
  return updateProject(request, context)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.success) return auth.response
    const user = auth.user

    // Use admin client to verify user owns the project's organization
    const adminClient = createAdminClient()

    // Get the project's organization_id
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('organization_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    // Verify user is a member of the project's organization
    const { data: membership, error: memberError } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', project.organization_id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have access to this project' } },
        { status: 403 }
      )
    }

    // Soft delete using admin client
    const { error } = await adminClient
      .from('projects')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    revalidatePath('/projects')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
