/**
 * Test the full moderated conversation flow
 * Run with: npx tsx scripts/test-full-flow.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { analyzeBrief } from '../lib/moderator/brief-analyzer'
import { orchestrateConversation } from '../lib/moderator/conversation-orchestrator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testFullFlow() {
  console.log('='.repeat(60))
  console.log('Testing Full Moderated Conversation Flow')
  console.log('='.repeat(60))

  // Step 1: Check archetypes are seeded
  console.log('\n📊 Step 1: Checking archetypes...')

  // Query via RPC function that accesses ppt schema
  const { data: archetypes, error: archError } = await supabase
    .rpc('get_all_archetypes')

  if (archError) {
    // Try alternative - the function might not exist, let's create a simple check
    console.log('Note: get_all_archetypes RPC not found, checking via seed function...')

    const { data: seedResult, error: seedError } = await supabase
      .rpc('seed_persona_archetypes')

    if (seedError) {
      console.log('⚠️  Could not verify archetypes via RPC. Error:', seedError.message)
      console.log('Proceeding with test - archetypes may already be seeded.\n')
    } else {
      console.log('✅ Archetypes verified:', seedResult?.length || 'unknown count')
      if (seedResult) {
        seedResult.forEach((a: any) => console.log(`   - ${a.name} (${a.slug})`))
      }
    }
  } else {
    console.log(`✅ Found ${archetypes?.length} archetypes`)
    archetypes?.forEach((a: any) => console.log(`   - ${a.name}`))
  }

  // Step 2: Analyze a test brief
  console.log('\n📝 Step 2: Analyzing brief...')

  const stimulus = `
    We're not like other brands. We're not going to tell you our product
    will change your life. We won't promise miracles. We won't use
    buzzwords like "revolutionary" or "game-changing."

    Because honestly? It's just really good coffee.

    No BS. No hype. Just coffee that doesn't suck.

    Anti-Marketing Coffee Co. - We're calling out the industry.
  `

  const brief = `
    Client: Anti-Marketing Coffee Co.
    Objective: Launch campaign that satirizes typical coffee marketing
    Tone: Self-aware, tongue-in-cheek, deliberately anti-establishment
    Target: Millennial/Gen Z coffee drinkers tired of pretentious brands
    Creative Approach: Meta-commentary on advertising itself
  `

  const { analysis: briefAnalysis, usage: briefUsage } = await analyzeBrief(stimulus, brief, 'ad_copy')

  console.log(`✅ Brief analyzed (${briefUsage.totalTokens} tokens)`)
  console.log(`   Primary tone: ${briefAnalysis.primaryTone}`)
  console.log(`   Moderation needed: ${briefAnalysis.moderationNeeded ? 'YES' : 'NO'}`)
  console.log(`   Red flags: ${briefAnalysis.redFlags.length}`)

  // Step 3: Run moderated conversation
  console.log('\n🎭 Step 3: Running moderated conversation...')

  // Use actual archetype slugs from the database
  const archetypeIds = [
    'skeptical-switcher',
    'trend-follower',
    'loyal-defender'
  ]

  console.log(`   Testing with ${archetypeIds.length} archetypes:`)
  archetypeIds.forEach(id => console.log(`   - ${id}`))

  const startTime = Date.now()

  const conversationResult = await orchestrateConversation({
    testId: 'test-' + Date.now(),
    stimulus,
    brief,
    stimulusType: 'ad_copy',
    archetypeIds,
    calibration: 'standard',
    category: 'beverages',
    maxFollowUps: 3,
    enableModeration: true
  })

  const duration = Date.now() - startTime

  console.log(`\n✅ Conversation complete!`)
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`)
  console.log(`   Total turns: ${conversationResult.turns.length}`)
  console.log(`   Moderation interventions: ${conversationResult.moderationInterventions}`)
  console.log(`   Tokens used: ${conversationResult.usage.totalTokens}`)

  // Step 4: Display conversation transcript
  console.log('\n' + '='.repeat(60))
  console.log('CONVERSATION TRANSCRIPT')
  console.log('='.repeat(60))

  for (const turn of conversationResult.turns) {
    const speaker = turn.speakerType === 'moderator'
      ? '🎙️  MODERATOR'
      : `👤 ${turn.speakerName?.toUpperCase()}`

    console.log(`\n${speaker}:`)
    console.log(`   ${turn.content.substring(0, 200)}${turn.content.length > 200 ? '...' : ''}`)
  }

  // Step 5: Show moderation impact
  if (conversationResult.moderationImpact) {
    console.log('\n' + '='.repeat(60))
    console.log('MODERATION IMPACT')
    console.log('='.repeat(60))

    const impact = conversationResult.moderationImpact
    console.log(`\n📊 Sentiment shifts:`)
    console.log(`   Positive shifts: ${impact.positiveShifts}`)
    console.log(`   Negative shifts: ${impact.negativeShifts}`)
    console.log(`   No change: ${impact.noChange}`)

    if (impact.personaShifts?.length > 0) {
      console.log(`\n📈 Per-persona shifts:`)
      impact.personaShifts.forEach((shift: any) => {
        console.log(`   - ${shift.personaName}: ${shift.before} → ${shift.after}`)
      })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('TEST COMPLETE!')
  console.log('='.repeat(60))
}

testFullFlow().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
