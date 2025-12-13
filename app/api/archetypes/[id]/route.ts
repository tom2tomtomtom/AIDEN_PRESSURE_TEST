import { NextRequest, NextResponse } from 'next/server'
import { loadArchetypeById, loadArchetypeBySlug } from '@/lib/persona/archetype-loader'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/archetypes/[id]
 * Get a single archetype by ID or slug with full details
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try loading by ID first, then by slug
    let archetype = await loadArchetypeById(id)
    if (!archetype) {
      archetype = await loadArchetypeBySlug(id)
    }

    if (!archetype) {
      return NextResponse.json(
        { error: 'Archetype not found' },
        { status: 404 }
      )
    }

    // Get memory count for this archetype
    const { count: memoryCount } = await supabase
      .from('phantom_memories')
      .select('*', { count: 'exact', head: true })
      .eq('archetype_id', archetype.id)

    // Get memory distribution by emotional residue
    const { data: memories } = await supabase
      .from('phantom_memories')
      .select('emotional_residue, trust_modifier')
      .eq('archetype_id', archetype.id)

    const memoryStats = {
      total: memoryCount || 0,
      distribution: {
        positive: 0,
        negative: 0,
        mixed: 0,
        neutral: 0
      },
      averageTrustModifier: 0
    }

    if (memories && memories.length > 0) {
      for (const m of memories) {
        const residue = m.emotional_residue as keyof typeof memoryStats.distribution
        if (residue in memoryStats.distribution) {
          memoryStats.distribution[residue]++
        }
        memoryStats.averageTrustModifier += m.trust_modifier
      }
      memoryStats.averageTrustModifier = Number(
        (memoryStats.averageTrustModifier / memories.length).toFixed(2)
      )
    }

    return NextResponse.json({
      archetype,
      memoryStats
    })
  } catch (error) {
    console.error('Error fetching archetype:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archetype' },
      { status: 500 }
    )
  }
}
