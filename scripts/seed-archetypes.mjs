// Seed script for persona archetypes
// Run with: node scripts/seed-archetypes.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local manually
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'ppt' } }
)

const archetypes = [
  {
    name: 'Skeptical Switcher',
    slug: 'skeptical-switcher',
    category: 'value',
    demographics: {
      age_range: '35-50',
      lifestage: 'established_family',
      income: 'middle',
      location: 'suburban',
      education: 'some_college',
      household: 'family_with_children'
    },
    psychographics: {
      values: ['value_for_money', 'reliability', 'transparency', 'practicality'],
      motivations: ['not_being_fooled', 'smart_purchasing', 'protecting_budget', 'family_welfare'],
      pain_points: ['shrinkflation', 'hidden_ingredients', 'price_increases', 'reformulations', 'misleading_claims'],
      media_habits: ['reviews_before_buying', 'price_comparison_apps', 'consumer_watchdog_content'],
      decision_style: 'analytical',
      influence_type: 'challenger',
      brand_relationship: 'transactional'
    },
    baseline_skepticism: 'high',
    voice_traits: ['direct', 'questioning', 'detail-oriented', 'comparative', 'references_past_experiences']
  },
  {
    name: 'Loyal Defender',
    slug: 'loyal-defender',
    category: 'traditional',
    demographics: {
      age_range: '45-65',
      lifestage: 'empty_nest',
      income: 'middle_upper',
      location: 'suburban',
      education: 'college_graduate',
      household: 'couple_no_children'
    },
    psychographics: {
      values: ['tradition', 'quality', 'consistency', 'trust'],
      motivations: ['maintaining_standards', 'proven_solutions', 'brand_heritage', 'reliability'],
      pain_points: ['change_for_change_sake', 'disappearing_favorites', 'new_unproven_brands', 'complexity'],
      media_habits: ['traditional_media', 'brand_websites', 'word_of_mouth'],
      decision_style: 'habitual',
      influence_type: 'advocate',
      brand_relationship: 'loyal_partnership'
    },
    baseline_skepticism: 'low',
    voice_traits: ['warm', 'nostalgic', 'defensive_of_favorites', 'story_telling', 'relationship_focused']
  },
  {
    name: 'Value Hunter',
    slug: 'value-hunter',
    category: 'value',
    demographics: {
      age_range: '28-45',
      lifestage: 'young_family',
      income: 'lower_middle',
      location: 'mixed',
      education: 'high_school_plus',
      household: 'family_with_young_children'
    },
    psychographics: {
      values: ['savings', 'smart_shopping', 'getting_more', 'efficiency'],
      motivations: ['stretching_budget', 'finding_deals', 'outsmarting_marketers', 'providing_for_family'],
      pain_points: ['full_price', 'premium_pricing', 'artificial_scarcity', 'loyalty_tax'],
      media_habits: ['deal_sites', 'coupon_apps', 'discount_alerts', 'store_brand_comparisons'],
      decision_style: 'analytical',
      influence_type: 'informer',
      brand_relationship: 'opportunistic'
    },
    baseline_skepticism: 'high',
    voice_traits: ['calculating', 'price_focused', 'comparative', 'deal_hunting', 'brand_agnostic']
  },
  {
    name: 'Wellness Seeker',
    slug: 'wellness-seeker',
    category: 'health',
    demographics: {
      age_range: '30-50',
      lifestage: 'established_professional',
      income: 'upper_middle',
      location: 'urban',
      education: 'college_graduate',
      household: 'mixed'
    },
    psychographics: {
      values: ['health', 'natural', 'clean_ingredients', 'self_improvement', 'longevity'],
      motivations: ['protecting_health', 'optimizing_wellbeing', 'avoiding_harmful_ingredients', 'informed_choices'],
      pain_points: ['hidden_sugars', 'artificial_ingredients', 'greenwashing', 'health_claims_without_evidence', 'processed_foods'],
      media_habits: ['health_podcasts', 'nutrition_research', 'ingredient_scanners', 'wellness_influencers'],
      decision_style: 'analytical',
      influence_type: 'educator',
      brand_relationship: 'scrutinizing'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['ingredient_focused', 'research_driven', 'questioning_claims', 'health_conscious', 'scientific']
  },
  {
    name: 'Convenience Prioritizer',
    slug: 'convenience-prioritizer',
    category: 'convenience',
    demographics: {
      age_range: '30-45',
      lifestage: 'busy_professional',
      income: 'upper_middle',
      location: 'urban',
      education: 'college_graduate',
      household: 'dual_income'
    },
    psychographics: {
      values: ['time_savings', 'efficiency', 'simplicity', 'reliability'],
      motivations: ['reducing_friction', 'quick_decisions', 'good_enough_solutions', 'reclaiming_time'],
      pain_points: ['complexity', 'time_wasted', 'unreliable_products', 'decision_fatigue'],
      media_habits: ['quick_reviews', 'subscription_services', 'automated_reordering', 'curated_recommendations'],
      decision_style: 'habitual',
      influence_type: 'follower',
      brand_relationship: 'convenience_based'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['time_focused', 'practical', 'efficiency_minded', 'solution_oriented', 'impatient_with_complexity']
  },
  {
    name: 'Status Signaler',
    slug: 'status-signaler',
    category: 'premium',
    demographics: {
      age_range: '28-45',
      lifestage: 'aspirational_professional',
      income: 'upper',
      location: 'urban_affluent',
      education: 'postgraduate',
      household: 'young_professional'
    },
    psychographics: {
      values: ['quality', 'exclusivity', 'image', 'sophistication', 'discernment'],
      motivations: ['social_recognition', 'self_expression', 'best_in_class', 'refined_taste'],
      pain_points: ['mass_market_products', 'visible_value_brands', 'lack_of_differentiation', 'compromising_on_quality'],
      media_habits: ['luxury_publications', 'tastemaker_recommendations', 'premium_brand_content', 'exclusive_memberships'],
      decision_style: 'emotional',
      influence_type: 'trendsetter',
      brand_relationship: 'identity_expression'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['discerning', 'quality_focused', 'brand_conscious', 'aspirational', 'detail_oriented']
  },
  {
    name: 'Eco Worrier',
    slug: 'eco-worrier',
    category: 'sustainability',
    demographics: {
      age_range: '25-40',
      lifestage: 'values_driven',
      income: 'middle',
      location: 'urban',
      education: 'college_graduate',
      household: 'mixed'
    },
    psychographics: {
      values: ['environmental_responsibility', 'authenticity', 'transparency', 'systemic_change'],
      motivations: ['reducing_impact', 'calling_out_greenwashing', 'supporting_genuine_efforts', 'aligning_actions_with_values'],
      pain_points: ['greenwashing', 'vague_sustainability_claims', 'excessive_packaging', 'corporate_hypocrisy', 'guilt_about_consumption'],
      media_habits: ['environmental_news', 'brand_accountability_trackers', 'sustainability_certifications', 'activist_content'],
      decision_style: 'analytical',
      influence_type: 'challenger',
      brand_relationship: 'scrutinizing'
    },
    baseline_skepticism: 'high',
    voice_traits: ['skeptical_of_claims', 'evidence_demanding', 'environmentally_focused', 'calls_out_greenwashing', 'systemic_thinker']
  },
  {
    name: 'Trend Follower',
    slug: 'trend-follower',
    category: 'innovation',
    demographics: {
      age_range: '22-35',
      lifestage: 'young_adult',
      income: 'entry_to_middle',
      location: 'urban',
      education: 'mixed',
      household: 'single_or_shared'
    },
    psychographics: {
      values: ['belonging', 'discovery', 'social_currency', 'being_current'],
      motivations: ['fear_of_missing_out', 'social_validation', 'trying_new_things', 'sharing_discoveries'],
      pain_points: ['being_out_of_loop', 'missing_trends', 'looking_outdated', 'not_having_shareable_experiences'],
      media_habits: ['social_media_heavy', 'influencer_content', 'viral_products', 'peer_recommendations'],
      decision_style: 'social',
      influence_type: 'amplifier',
      brand_relationship: 'trend_based'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['social_proof_seeking', 'trend_aware', 'enthusiastic_about_new', 'peer_influenced', 'shareable_focused']
  }
]

async function seed() {
  console.log('Seeding persona archetypes...')

  // Check if archetypes already exist
  const { data: existing, error: checkError } = await supabase
    .from('persona_archetypes')
    .select('id')
    .limit(1)

  if (checkError) {
    console.error('Error checking existing archetypes:', checkError)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log('Archetypes already exist. Clearing and re-seeding...')
    const { error: deleteError } = await supabase
      .from('persona_archetypes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Error clearing archetypes:', deleteError)
      process.exit(1)
    }
  }

  // Insert archetypes
  const { data, error } = await supabase
    .from('persona_archetypes')
    .insert(archetypes)
    .select('id, name, baseline_skepticism')

  if (error) {
    console.error('Error seeding archetypes:', error)
    process.exit(1)
  }

  console.log(`Successfully seeded ${data.length} archetypes:`)
  data.forEach(a => console.log(`  - ${a.name} (${a.baseline_skepticism})`))
}

seed()
