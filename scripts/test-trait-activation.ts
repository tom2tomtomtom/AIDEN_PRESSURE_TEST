/**
 * Test trait activation and two-layer prompts
 * Run with: npx tsx scripts/test-trait-activation.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { evaluateTraitActivation, buildEmotionalLayer, buildBehavioralLayer } from '../lib/persona/trait-activator'

async function testTraitActivation() {
  console.log('='.repeat(60))
  console.log('Testing Trait Activation System')
  console.log('='.repeat(60))

  // Test stimulus with "new improved formula" triggers
  const stimulus1 = `
    Introducing our NEW IMPROVED formula with clinically proven results!
    Now with 20% more cleaning power and a premium fresh scent.
    Our research shows 95% of users prefer the new formula.
  `

  console.log('\n📋 Test Stimulus:')
  console.log(stimulus1.trim())

  console.log('\n' + '='.repeat(60))
  console.log('Testing: SKEPTICAL SWITCHER')
  console.log('='.repeat(60))

  const result1 = await evaluateTraitActivation('skeptical-switcher', stimulus1, 'analytical')

  console.log(`\n✅ Activated ${result1.activatedTraits.length} traits (total score: ${result1.totalScore.toFixed(2)})`)

  for (const trait of result1.activatedTraits) {
    console.log(`\n🎯 ${trait.shorthand} (score: ${trait.activationScore.toFixed(2)})`)
    console.log(`   Word matches: ${trait.matchDetails.wordMatches.join(', ') || 'none'}`)
    console.log(`   Claim matches: ${trait.matchDetails.claimMatches.map(c => c.type).join(', ') || 'none'}`)
    console.log(`   Emotional boost: ${trait.matchDetails.emotionalBoost ? 'YES' : 'no'}`)
  }

  if (result1.primaryTrait) {
    console.log('\n--- EMOTIONAL LAYER ---')
    console.log(buildEmotionalLayer(result1.activatedTraits))

    console.log('\n--- BEHAVIORAL LAYER ---')
    console.log(buildBehavioralLayer(result1.activatedTraits, ['direct', 'questioning', 'detail-oriented']))
  }

  // Test with eco/sustainability triggers
  const stimulus2 = `
    Our sustainable, eco-friendly packaging is certified carbon neutral.
    We're committed to the planet with our green initiative.
    100% organic and natural ingredients.
  `

  console.log('\n\n' + '='.repeat(60))
  console.log('Testing: ECO WORRIER')
  console.log('='.repeat(60))

  console.log('\n📋 Test Stimulus:')
  console.log(stimulus2.trim())

  const result2 = await evaluateTraitActivation('eco-worrier', stimulus2, 'values-driven')

  console.log(`\n✅ Activated ${result2.activatedTraits.length} traits (total score: ${result2.totalScore.toFixed(2)})`)

  for (const trait of result2.activatedTraits) {
    console.log(`\n🎯 ${trait.shorthand} (score: ${trait.activationScore.toFixed(2)})`)
    console.log(`   Word matches: ${trait.matchDetails.wordMatches.join(', ') || 'none'}`)
  }

  if (result2.primaryTrait) {
    console.log('\n--- EMOTIONAL LAYER ---')
    console.log(buildEmotionalLayer(result2.activatedTraits))
  }

  // Test with value/deal triggers
  const stimulus3 = `
    SALE! Save 40% on our premium quality products.
    Luxury at an affordable price - you deserve the best.
    Limited time offer - best value on the market.
  `

  console.log('\n\n' + '='.repeat(60))
  console.log('Testing: VALUE HUNTER')
  console.log('='.repeat(60))

  console.log('\n📋 Test Stimulus:')
  console.log(stimulus3.trim())

  const result3 = await evaluateTraitActivation('value-hunter', stimulus3, 'calculating')

  console.log(`\n✅ Activated ${result3.activatedTraits.length} traits (total score: ${result3.totalScore.toFixed(2)})`)

  for (const trait of result3.activatedTraits) {
    console.log(`\n🎯 ${trait.shorthand} (score: ${trait.activationScore.toFixed(2)})`)
    console.log(`   Word matches: ${trait.matchDetails.wordMatches.join(', ') || 'none'}`)
  }

  if (result3.primaryTrait) {
    console.log('\n--- EMOTIONAL LAYER ---')
    console.log(buildEmotionalLayer(result3.activatedTraits))
  }

  console.log('\n' + '='.repeat(60))
  console.log('Test Complete!')
  console.log('='.repeat(60))
}

testTraitActivation().catch(console.error)
