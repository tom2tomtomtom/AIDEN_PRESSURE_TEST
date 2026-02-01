/**
 * Test script for the AI Moderator System
 * Run with: npx tsx scripts/test-moderator.ts
 */

// Load env BEFORE any other imports
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Now import modules that depend on env vars
import { analyzeBrief } from '../lib/moderator/brief-analyzer'

async function testBriefAnalyzer() {
  console.log('='.repeat(60))
  console.log('Testing Brief Analyzer')
  console.log('='.repeat(60))

  // Test case: Anti-marketing humorous brief (the problem case from the plan)
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

  console.log('\n📋 Stimulus:')
  console.log(stimulus.trim())
  console.log('\n📝 Brief:')
  console.log(brief.trim())

  try {
    console.log('\n🔍 Analyzing brief...\n')
    const startTime = Date.now()

    const { analysis, usage } = await analyzeBrief(stimulus, brief, 'ad_copy')

    const duration = Date.now() - startTime

    console.log('✅ Analysis Complete!\n')
    console.log(`⏱️  Duration: ${duration}ms`)
    console.log(`📊 Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out`)

    console.log('\n--- RESULTS ---\n')

    console.log(`🎯 Primary Tone: ${analysis.primaryTone}`)
    console.log(`🎭 Secondary Tones: ${analysis.secondaryTones.join(', ')}`)

    console.log(`\n🎨 Creative Devices:`)
    for (const device of analysis.creativeDevices) {
      console.log(`   - ${device}: ${analysis.deviceExplanations[device] || 'N/A'}`)
    }

    console.log(`\n✨ Intended Interpretation:`)
    console.log(`   ${analysis.intendedInterpretation}`)

    console.log(`\n⚠️  Literal Misreading Risk:`)
    console.log(`   ${analysis.literalMisreading}`)

    console.log(`\n🚩 Red Flags to Watch (${analysis.redFlags.length}):`)
    for (const flag of analysis.redFlags) {
      console.log(`   Pattern: "${flag.pattern}"`)
      console.log(`   Explanation: ${flag.explanation}`)
      console.log(`   Probe: "${flag.clarificationProbe}"`)
      console.log('')
    }

    console.log(`💬 Moderator Context Statement:`)
    console.log(`   "${analysis.contextStatement}"`)

    console.log(`\n🔍 Clarification Probes:`)
    for (const probe of analysis.clarificationProbes) {
      console.log(`   - ${probe}`)
    }

    console.log(`\n📊 Moderation Assessment:`)
    console.log(`   Needed: ${analysis.moderationNeeded ? 'YES' : 'NO'}`)
    console.log(`   Priority: ${analysis.moderationPriority}`)
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`)

    // Test the red flag detection
    console.log('\n' + '='.repeat(60))
    console.log('Testing Red Flag Detection')
    console.log('='.repeat(60))

    const testResponses = [
      "This is contradictory - they say they're anti-marketing but this IS marketing!",
      "I like the honesty and directness, it feels refreshing.",
      "I don't understand - why would a brand say they won't use buzzwords?",
      "The self-deprecating humor is clever, I appreciate the self-awareness."
    ]

    for (const response of testResponses) {
      console.log(`\n📝 Response: "${response.slice(0, 50)}..."`)

      const responseLower = response.toLowerCase()
      const triggered = analysis.redFlags.filter(flag => {
        const patternWords = flag.pattern.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        return patternWords.some(word => responseLower.includes(word))
      })

      if (triggered.length > 0) {
        console.log(`   🚩 LITERAL INTERPRETATION DETECTED`)
        console.log(`   Triggered: ${triggered.map(f => f.pattern).join(', ')}`)
        console.log(`   Suggested probe: "${triggered[0].clarificationProbe}"`)
      } else {
        console.log(`   ✅ No literal interpretation detected`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Test Complete!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the test
testBriefAnalyzer()
