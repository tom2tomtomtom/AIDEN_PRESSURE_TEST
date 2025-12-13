import { NextResponse } from 'next/server'
import { loadArchetypesWithStats } from '@/lib/persona/archetype-loader'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/archetypes
 * List all persona archetypes with memory stats
 */
export async function GET() {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Load archetypes with stats
    const archetypes = await loadArchetypesWithStats()

    return NextResponse.json({
      archetypes,
      total: archetypes.length
    })
  } catch (error) {
    console.error('Error fetching archetypes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archetypes' },
      { status: 500 }
    )
  }
}
