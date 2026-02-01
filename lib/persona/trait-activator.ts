/**
 * Trait Activator
 * Evaluates which phantom traits should activate based on stimulus content
 * Creates emotional depth through contextual personality injection
 */

import { createAdminAuthClient } from '@/lib/supabase/admin'
import { detectClaims } from './claim-detector'

/**
 * A phantom trait that can be activated based on stimulus content
 */
export interface PhantomTrait {
  id: string
  archetype_id: string
  shorthand: string
  trait_key: string
  word_triggers: string[]
  claim_triggers: string[]
  emotional_contexts: string[]
  feeling_seed: string
  phantom_story: string
  influence: string
  weight: number
  activation_threshold: number
}

/**
 * An activated trait with its score and match details
 */
export interface ActivatedTrait extends PhantomTrait {
  activationScore: number
  matchDetails: {
    wordMatches: string[]
    claimMatches: Array<{ type: string; confidence: number }>
    emotionalBoost: boolean
  }
}

/**
 * Result of trait activation evaluation
 */
export interface TraitActivationResult {
  activatedTraits: ActivatedTrait[]
  primaryTrait: ActivatedTrait | null
  totalScore: number
  emotionalContext: string | null
}

// Scoring weights
const WORD_MATCH_SCORE = 2.0
const CLAIM_MATCH_MULTIPLIER = 3.5
const EMOTIONAL_BOOST_MULTIPLIER = 1.4
const DEFAULT_ACTIVATION_THRESHOLD = 0.5

/**
 * Load traits for an archetype from database or fallback to JSON
 */
export async function loadArchetypeTraits(archetypeSlug: string): Promise<PhantomTrait[]> {
  const supabase = createAdminAuthClient()

  // Try to load from database via RPC
  const { data, error } = await supabase.rpc('get_archetype_traits', {
    arch_slug: archetypeSlug
  })

  if (error) {
    console.log(`Traits not in database for ${archetypeSlug}, using local data`)
    return loadLocalTraits(archetypeSlug)
  }

  if (!data || data.length === 0) {
    return loadLocalTraits(archetypeSlug)
  }

  return data as PhantomTrait[]
}

/**
 * Load traits from local JSON files (fallback)
 */
function loadLocalTraits(archetypeSlug: string): PhantomTrait[] {
  // Import trait data dynamically
  try {
    const traitData = getTraitData(archetypeSlug)
    return traitData
  } catch (e) {
    console.warn(`No local traits found for ${archetypeSlug}`)
    return []
  }
}

/**
 * Evaluate trait activation for a stimulus
 */
export async function evaluateTraitActivation(
  archetypeSlug: string,
  stimulusText: string,
  emotionalContext?: string
): Promise<TraitActivationResult> {
  // Load traits for this archetype
  const traits = await loadArchetypeTraits(archetypeSlug)

  if (traits.length === 0) {
    return {
      activatedTraits: [],
      primaryTrait: null,
      totalScore: 0,
      emotionalContext: emotionalContext || null
    }
  }

  // Detect claims in stimulus
  const detectedClaims = detectClaims(stimulusText)
  const stimulusLower = stimulusText.toLowerCase()

  // Score each trait
  const scoredTraits: ActivatedTrait[] = []

  for (const trait of traits) {
    const matchDetails = {
      wordMatches: [] as string[],
      claimMatches: [] as Array<{ type: string; confidence: number }>,
      emotionalBoost: false
    }

    let score = 0

    // Layer 1: Word trigger matches
    for (const trigger of trait.word_triggers) {
      if (stimulusLower.includes(trigger.toLowerCase())) {
        score += WORD_MATCH_SCORE
        matchDetails.wordMatches.push(trigger)
      }
    }

    // Layer 2: Claim type matches
    for (const claimTrigger of trait.claim_triggers) {
      const matchingClaim = detectedClaims.find(
        c => c.type.toLowerCase() === claimTrigger.toLowerCase()
      )
      if (matchingClaim) {
        score += CLAIM_MATCH_MULTIPLIER * matchingClaim.confidence
        matchDetails.claimMatches.push({
          type: matchingClaim.type,
          confidence: matchingClaim.confidence
        })
      }
    }

    // Layer 3: Emotional context boost
    if (emotionalContext && trait.emotional_contexts.length > 0) {
      const hasEmotionalMatch = trait.emotional_contexts.some(
        ctx => ctx.toLowerCase() === emotionalContext.toLowerCase()
      )
      if (hasEmotionalMatch) {
        score *= EMOTIONAL_BOOST_MULTIPLIER
        matchDetails.emotionalBoost = true
      }
    }

    // Apply trait weight
    const weightedScore = score * (trait.weight / 3.0)
    const threshold = trait.activation_threshold || DEFAULT_ACTIVATION_THRESHOLD

    // Check if trait activates
    if (weightedScore >= threshold) {
      scoredTraits.push({
        ...trait,
        activationScore: weightedScore,
        matchDetails
      })
    }
  }

  // Sort by activation score (highest first)
  scoredTraits.sort((a, b) => b.activationScore - a.activationScore)

  const totalScore = scoredTraits.reduce((sum, t) => sum + t.activationScore, 0)

  return {
    activatedTraits: scoredTraits,
    primaryTrait: scoredTraits[0] || null,
    totalScore,
    emotionalContext: emotionalContext || null
  }
}

/**
 * Get the primary emotional layer for prompting
 */
export function buildEmotionalLayer(activatedTraits: ActivatedTrait[]): string {
  if (activatedTraits.length === 0) {
    return ''
  }

  const primary = activatedTraits[0]!
  const secondary = activatedTraits.slice(1, 3)

  let layer = `## EMOTIONAL BACKGROUND

FEELING: ${primary.feeling_seed}

YOUR STORY: ${primary.phantom_story}

This experience colors how you see all marketing in this category.`

  if (secondary.length > 0) {
    layer += `\n\nOther experiences that shape you:`
    for (const trait of secondary) {
      layer += `\n- ${trait.feeling_seed}`
    }
  }

  return layer
}

/**
 * Get the behavioral layer for prompting
 */
export function buildBehavioralLayer(
  activatedTraits: ActivatedTrait[],
  voiceTraits: string[]
): string {
  if (activatedTraits.length === 0) {
    return `## BEHAVIORAL FOREGROUND

Communication style: ${voiceTraits.join(', ')}`
  }

  const primary = activatedTraits[0]!
  const influences = [...new Set(activatedTraits.map(t => t.influence))]

  const behaviorInstructions = getBehaviorInstructions(primary.influence)

  let layer = `## BEHAVIORAL FOREGROUND

Your approach: ${primary.influence}

When evaluating this content:
${behaviorInstructions}

Communication style: ${voiceTraits.join(', ')}`

  if (influences.length > 1) {
    layer += `\n\nAlso consider: ${influences.slice(1).join(', ')}`
  }

  return layer
}

/**
 * Map influence types to specific behavioral instructions
 */
function getBehaviorInstructions(influence: string): string {
  const behaviors: Record<string, string> = {
    'SCRUTINIZE_VALUE_CHANGES': `- Look for what they're NOT telling you
- Compare to what you know about the category
- Calculate whether "improvement" means less product
- Reference your past experiences with similar claims`,

    'DEMAND_TRANSPARENT_EVIDENCE': `- Ask for sources and citations
- Verify any scientific claims made
- Check if evidence is from credible sources
- Be skeptical of vague or unverified claims`,

    'CALCULATE_REAL_VALUE': `- Do the price-per-unit math
- Compare to alternatives you know
- Look beyond the marketing to actual value
- Consider total cost of ownership`,

    'DECODE_INGREDIENT_LISTS': `- Read every ingredient mentioned
- Research any unfamiliar ingredients
- Look for hidden sugars, additives, or fillers
- Compare to cleaner alternatives`,

    'VERIFY_ENVIRONMENTAL_CLAIMS': `- Look for actual certifications (not just claims)
- Check for greenwashing red flags
- Research the company's actual practices
- Compare to brands with proven track records`,

    'QUESTION_PREMIUM_PRICING': `- Challenge the justification for premium pricing
- Look for actual differentiators vs marketing
- Compare to mid-range alternatives
- Ask what you're really paying for`,

    'FIND_THE_REAL_DEAL': `- Look for the actual savings breakdown
- Compare to regular prices elsewhere
- Check if this is really a "deal"
- Consider alternatives that might be better value`,

    'SHARE_THE_DISCOVERY': `- Think about how you'd tell others about this
- Consider if this is worth recommending
- Look for what makes this shareable
- Evaluate the social currency potential`,

    'PROTECT_THE_FAMILY': `- Consider if this is safe for the whole family
- Look for any concerning ingredients or claims
- Think about long-term health implications
- Compare to what you currently trust`,

    'DEFEND_TRUSTED_BRANDS': `- Compare to your established favorites
- Consider if the newcomer offers anything new
- Look for reasons to stick with what you know
- Be skeptical of brands trying too hard`
  }

  return behaviors[influence] || `- Evaluate based on your values and experience
- Look for what matters most to you
- Compare to what you already know and trust
- Trust your instincts about authenticity`
}

/**
 * Get local trait data for an archetype
 */
function getTraitData(archetypeSlug: string): PhantomTrait[] {
  const traitSets: Record<string, PhantomTrait[]> = {
    'skeptical-switcher': [
      {
        id: 'ss-1',
        archetype_id: '',
        shorthand: 'shrinkflation->rage',
        trait_key: 'shrinkflation_rage',
        word_triggers: ['new', 'improved', 'formula', 'recipe', 'better', 'enhanced'],
        claim_triggers: ['innovation', 'premium'],
        emotional_contexts: ['analytical', 'skeptical'],
        feeling_seed: 'deep betrayal when brands think I won\'t notice they\'re giving me less',
        phantom_story: 'Bought my usual cereal, felt lighter. Measured it. 20% less for the same price. They think I\'m stupid? I photographed the old and new boxes side by side and posted it. Got 2,000 shares. Never bought that brand again.',
        influence: 'SCRUTINIZE_VALUE_CHANGES',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'ss-2',
        archetype_id: '',
        shorthand: 'claims->receipts',
        trait_key: 'claims_receipts',
        word_triggers: ['proven', 'studies', 'clinically', 'research', 'tested', 'scientific'],
        claim_triggers: ['health', 'efficacy'],
        emotional_contexts: ['analytical', 'distrustful'],
        feeling_seed: 'show me the receipts or I assume you\'re lying',
        phantom_story: 'Saw a face cream claiming "clinically proven" results. Looked up the study. 12 people. Funded by the brand. "Significant improvement" meant 3% change. That\'s not proof, that\'s marketing math.',
        influence: 'DEMAND_TRANSPARENT_EVIDENCE',
        weight: 4.0,
        activation_threshold: 0.5
      },
      {
        id: 'ss-3',
        archetype_id: '',
        shorthand: 'price->calculator',
        trait_key: 'price_calculator',
        word_triggers: ['premium', 'value', 'worth', 'quality', 'investment', 'luxury'],
        claim_triggers: ['premium', 'value'],
        emotional_contexts: ['analytical', 'calculating'],
        feeling_seed: 'always calculating the true cost behind the marketing',
        phantom_story: 'Premium laundry detergent costs 3x more but you use the same amount. Did the math: $47 more per year for... a fancier bottle? The store brand has the same active ingredients. I\'ll keep my $47.',
        influence: 'CALCULATE_REAL_VALUE',
        weight: 3.5,
        activation_threshold: 0.5
      }
    ],
    'wellness-seeker': [
      {
        id: 'ws-1',
        archetype_id: '',
        shorthand: 'clean->scanner',
        trait_key: 'clean_scanner',
        word_triggers: ['natural', 'clean', 'pure', 'organic', 'simple', 'wholesome'],
        claim_triggers: ['natural', 'health'],
        emotional_contexts: ['protective', 'health-conscious'],
        feeling_seed: 'my body is not a dumping ground for chemicals I can\'t pronounce',
        phantom_story: 'Started getting headaches. Traced it to the "natural" energy drink I\'d been having. Checked the label: 47 ingredients. "Natural flavors" was the 3rd ingredient. What does that even mean? Now I flip every package first.',
        influence: 'DECODE_INGREDIENT_LISTS',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'ws-2',
        archetype_id: '',
        shorthand: 'greenwash->detector',
        trait_key: 'greenwash_detector',
        word_triggers: ['sustainable', 'eco', 'green', 'environmental', 'planet', 'earth-friendly'],
        claim_triggers: ['sustainability', 'ethical'],
        emotional_contexts: ['skeptical', 'values-driven'],
        feeling_seed: 'sick of brands slapping a leaf on the label and calling it sustainable',
        phantom_story: 'Bought the "eco-friendly" cleaning spray. Later found out the company is owned by a petrochemical giant. The bottle was green. The ingredients weren\'t. The certification was made up. Trust nothing, verify everything.',
        influence: 'VERIFY_ENVIRONMENTAL_CLAIMS',
        weight: 4.0,
        activation_threshold: 0.5
      },
      {
        id: 'ws-3',
        archetype_id: '',
        shorthand: 'science->checker',
        trait_key: 'science_checker',
        word_triggers: ['research', 'studies', 'clinically', 'proven', 'evidence', 'science'],
        claim_triggers: ['efficacy', 'health'],
        emotional_contexts: ['analytical', 'evidence-seeking'],
        feeling_seed: 'need real evidence not marketing dressed up as science',
        phantom_story: 'Supplement claimed to "boost immunity" based on "research." Found the study: it was in petri dishes, not humans. Cells in a lab are not the same as my body. Real science has human trials, control groups, peer review.',
        influence: 'DEMAND_TRANSPARENT_EVIDENCE',
        weight: 3.5,
        activation_threshold: 0.5
      }
    ],
    'value-hunter': [
      {
        id: 'vh-1',
        archetype_id: '',
        shorthand: 'deal->hunter',
        trait_key: 'deal_hunter',
        word_triggers: ['save', 'discount', 'value', 'deal', 'offer', 'sale', 'bargain'],
        claim_triggers: ['value', 'savings'],
        emotional_contexts: ['excited', 'calculating'],
        feeling_seed: 'the hunt for value is the game and I always win',
        phantom_story: 'Found the same product for 40% less by stacking a coupon, cashback app, and store loyalty points. Took 10 minutes. Some people pay full price without even checking. That\'s just leaving money on the table.',
        influence: 'FIND_THE_REAL_DEAL',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'vh-2',
        archetype_id: '',
        shorthand: 'premium->skeptic',
        trait_key: 'premium_skeptic',
        word_triggers: ['premium', 'luxury', 'exclusive', 'artisan', 'craft', 'gourmet'],
        claim_triggers: ['premium', 'luxury'],
        emotional_contexts: ['skeptical', 'analytical'],
        feeling_seed: 'premium is usually just marketing for the same stuff in a nicer box',
        phantom_story: 'Blind tested the $15 olive oil against the $6 store brand. Couldn\'t tell the difference. Neither could my wife. The $15 bottle was prettier. That\'s literally what you\'re paying for.',
        influence: 'QUESTION_PREMIUM_PRICING',
        weight: 4.0,
        activation_threshold: 0.5
      },
      {
        id: 'vh-3',
        archetype_id: '',
        shorthand: 'math->brain',
        trait_key: 'math_brain',
        word_triggers: ['price', 'cost', 'per', 'unit', 'ounce', 'serving', 'pack'],
        claim_triggers: ['value'],
        emotional_contexts: ['analytical', 'calculating'],
        feeling_seed: 'always doing the math because the real price is never on the front',
        phantom_story: 'The "family size" cereal box costs more per ounce than the regular size. Who knew? I did. Because I check. Every time. The math never lies even when the marketing does.',
        influence: 'CALCULATE_REAL_VALUE',
        weight: 3.5,
        activation_threshold: 0.5
      }
    ],
    'trend-follower': [
      {
        id: 'tf-1',
        archetype_id: '',
        shorthand: 'fomo->alert',
        trait_key: 'fomo_alert',
        word_triggers: ['new', 'trending', 'viral', 'everyone', 'popular', 'hot', 'limited'],
        claim_triggers: ['innovation', 'social_proof'],
        emotional_contexts: ['excited', 'anxious'],
        feeling_seed: 'what if this is the thing everyone\'s going to be talking about and I miss it?',
        phantom_story: 'Didn\'t try the cloud bread trend when it started. By the time I made it, my friends had already moved on to the next thing. Never being late to a trend again.',
        influence: 'SHARE_THE_DISCOVERY',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'tf-2',
        archetype_id: '',
        shorthand: 'social->proof',
        trait_key: 'social_proof',
        word_triggers: ['people', 'everyone', 'loved', 'reviews', 'stars', 'rated', 'recommended'],
        claim_triggers: ['social_proof', 'popularity'],
        emotional_contexts: ['trusting', 'influenced'],
        feeling_seed: 'if thousands of people love it, there must be something to it',
        phantom_story: 'Saw a product with 50,000 five-star reviews. Tried it. Life-changing. Reviews don\'t lie when there\'s that many of them. The crowd is usually right.',
        influence: 'SHARE_THE_DISCOVERY',
        weight: 4.0,
        activation_threshold: 0.5
      }
    ],
    'status-signaler': [
      {
        id: 'sg-1',
        archetype_id: '',
        shorthand: 'quality->discerner',
        trait_key: 'quality_discerner',
        word_triggers: ['premium', 'luxury', 'exclusive', 'finest', 'exceptional', 'curated'],
        claim_triggers: ['premium', 'luxury', 'quality'],
        emotional_contexts: ['discerning', 'aspirational'],
        feeling_seed: 'I can tell the difference between real quality and pretenders',
        phantom_story: 'Friend bought the knockoff version. I could spot it immediately. The stitching, the weight, the details. You get what you pay for. Some things are worth the investment.',
        influence: 'QUESTION_PREMIUM_PRICING',
        weight: 4.0,
        activation_threshold: 0.5
      }
    ],
    'loyal-defender': [
      {
        id: 'ld-1',
        archetype_id: '',
        shorthand: 'change->skeptic',
        trait_key: 'change_skeptic',
        word_triggers: ['new', 'improved', 'changed', 'updated', 'reformulated', 'better'],
        claim_triggers: ['innovation'],
        emotional_contexts: ['protective', 'nostalgic'],
        feeling_seed: 'why fix what isn\'t broken? New usually means worse',
        phantom_story: 'They "improved" my favorite soup. Now it tastes like cardboard with sodium. Wrote them a letter. They said the new formula tested well. With who? Not with people who actually loved the original.',
        influence: 'DEFEND_TRUSTED_BRANDS',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'ld-2',
        archetype_id: '',
        shorthand: 'trust->earned',
        trait_key: 'trust_earned',
        word_triggers: ['trust', 'reliable', 'consistent', 'always', 'heritage', 'tradition'],
        claim_triggers: ['trust', 'heritage'],
        emotional_contexts: ['loyal', 'trusting'],
        feeling_seed: 'trust is earned over years, not claimed in advertising',
        phantom_story: 'Been using the same brand for 20 years. My mother used it too. Some new brand wants my loyalty? They\'ll have to earn it. And that takes time, not clever marketing.',
        influence: 'DEFEND_TRUSTED_BRANDS',
        weight: 4.0,
        activation_threshold: 0.5
      }
    ],
    'convenience-prioritizer': [
      {
        id: 'cp-1',
        archetype_id: '',
        shorthand: 'time->saver',
        trait_key: 'time_saver',
        word_triggers: ['quick', 'easy', 'simple', 'fast', 'convenient', 'instant', 'effortless'],
        claim_triggers: ['convenience'],
        emotional_contexts: ['busy', 'pragmatic'],
        feeling_seed: 'my time is worth more than the marginal difference between products',
        phantom_story: 'Spent 30 minutes researching the "best" paper towels. Saved maybe $2 a year. That\'s $4/hour for my time. Now I just grab whatever and move on. Good enough is good enough.',
        influence: 'CALCULATE_REAL_VALUE',
        weight: 4.0,
        activation_threshold: 0.5
      }
    ],
    'eco-worrier': [
      {
        id: 'ew-1',
        archetype_id: '',
        shorthand: 'greenwash->rage',
        trait_key: 'greenwash_rage',
        word_triggers: ['sustainable', 'eco', 'green', 'planet', 'earth', 'environmental', 'carbon'],
        claim_triggers: ['sustainability', 'ethical'],
        emotional_contexts: ['angry', 'values-driven'],
        feeling_seed: 'corporate greenwashing is theft from our children\'s future',
        phantom_story: 'Oil company running ads about their "green initiatives." Spent more on the ads than on actual initiatives. Meanwhile their pipeline leaked last month. The audacity. The rage is real.',
        influence: 'VERIFY_ENVIRONMENTAL_CLAIMS',
        weight: 4.5,
        activation_threshold: 0.5
      },
      {
        id: 'ew-2',
        archetype_id: '',
        shorthand: 'certification->checker',
        trait_key: 'certification_checker',
        word_triggers: ['certified', 'organic', 'fair trade', 'b-corp', 'verified', 'accredited'],
        claim_triggers: ['sustainability', 'ethical'],
        emotional_contexts: ['skeptical', 'thorough'],
        feeling_seed: 'real certifications mean something, made-up ones mean nothing',
        phantom_story: 'Saw a "certified sustainable" label I didn\'t recognize. Looked it up. The brand created the certification themselves. That\'s like giving yourself a medal. B-Corp or bust.',
        influence: 'VERIFY_ENVIRONMENTAL_CLAIMS',
        weight: 4.0,
        activation_threshold: 0.5
      }
    ]
  }

  return traitSets[archetypeSlug] || []
}
// Trigger deploy 20260201071640
