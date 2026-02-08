import { NextResponse } from 'next/server'
import { loadArchetypesWithStats } from '@/lib/persona/archetype-loader'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/archetypes
 * List all persona archetypes with memory stats
 */
export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth.success) return auth.response

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
