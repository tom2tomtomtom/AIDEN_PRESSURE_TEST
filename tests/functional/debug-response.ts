/**
 * Debug test for persona response generation
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugResponseGeneration() {
  console.log('=== Debug Persona Response Generation ===\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Step 1: Get an archetype
  console.log('1. Loading archetype...')
  const { data: archetypes, error: archError } = await supabase
    .schema('ppt')
    .from('persona_archetypes')
    .select('*')
    .limit(1)

  if (archError || !archetypes?.length) {
    console.error('❌ Failed to load archetype:', archError?.message)
    return
  }

  const archetype = archetypes[0]
  console.log('   ✅ Loaded:', archetype.name)
  console.log('   Archetype ID:', archetype.id)

  // Step 2: Test context builder
  console.log('\n2. Building persona context...')
  try {
    const { buildPersonaContext } = await import('../../lib/persona/context-builder')

    const context = await buildPersonaContext({
      archetypeId: archetype.id,
      stimulusText: 'Premium yogurt test',
      category: 'fmcg',
      calibration: 'medium'
    })

    console.log('   ✅ Context built:')
    console.log('      Name:', context.name?.fullName)
    console.log('      Age:', context.age)
    console.log('      Skepticism:', context.skepticism?.level)
    console.log('      Memories:', context.memories?.length || 0)
  } catch (error: any) {
    console.error('   ❌ Context build failed:', error.message)
    console.error('      Stack:', error.stack)
    return
  }

  // Step 3: Test prompt builder
  console.log('\n3. Building prompt...')
  try {
    const { buildPersonaContext } = await import('../../lib/persona/context-builder')
    const {
      buildPersonaResponsePrompt,
      buildPersonaSystemPrompt
    } = await import('../../lib/prompts/persona-response')

    const context = await buildPersonaContext({
      archetypeId: archetype.id,
      stimulusText: 'Premium yogurt test',
      category: 'fmcg',
      calibration: 'medium'
    })

    const prompt = buildPersonaResponsePrompt(context, 'Premium yogurt concept', 'concept')
    const systemPrompt = buildPersonaSystemPrompt()

    console.log('   ✅ Prompt built')
    console.log('      Prompt length:', prompt.length, 'chars')
    console.log('      System prompt length:', systemPrompt.length, 'chars')
    console.log('      Prompt preview:', prompt.slice(0, 200) + '...')
  } catch (error: any) {
    console.error('   ❌ Prompt build failed:', error.message)
    return
  }

  // Step 4: Test full response generation
  console.log('\n4. Generating persona response (calling Claude API)...')
  try {
    const { generatePersonaResponse } = await import('../../lib/test-execution/response-generator')

    const response = await generatePersonaResponse(
      archetype.id,
      'Premium yogurt made with organic ingredients and probiotics. Price: $6.99',
      'concept',
      'fmcg',
      'medium'
    )

    console.log('   ✅ Response generated!')
    console.log('      Generation time:', response.generationTimeMs, 'ms')
    console.log('      Tokens used:', response.usage.totalTokens)
    console.log('      Gut reaction:', response.response.gut_reaction?.slice(0, 100) + '...')
    console.log('      Purchase intent:', response.response.purchase_intent)
    console.log('      Credibility:', response.response.credibility_rating)
  } catch (error: any) {
    console.error('   ❌ Generation failed:', error.message)
    console.error('      Stack:', error.stack?.split('\n').slice(0, 5).join('\n'))
  }

  console.log('\n=== Debug Complete ===')
}

debugResponseGeneration()
