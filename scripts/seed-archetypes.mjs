// Seed script for persona archetypes including the AIDEN Standard Panel
// Run with: node scripts/seed-archetypes.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Try to read .env.local if it exists
const envPath = resolve(__dirname, '../.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { db: { schema: 'ppt' } }
)

const archetypes = [
  // --- AIDEN Standard Panel (12 Phantoms) ---
  {
    name: 'Sarah Chen (Progressive Achiever)',
    slug: 'sarah-chen',
    category: 'innovation',
    demographics: {
      age_range: '32',
      lifestage: 'career_focused',
      income: '$95K',
      location: 'Melbourne CBD',
      education: 'College Graduate',
      household: 'Partnered, no kids'
    },
    psychographics: {
      values: ['Sustainability', 'Innovation', 'Social Justice', 'Career Growth'],
      motivations: ['Personal growth', 'Authenticity', 'Social proof'],
      pain_points: ['Greenwashing', 'Poor ethics', 'Outdated tech'],
      media_habits: ['Instagram', 'LinkedIn', 'Guardian', 'Podcasts'],
      decision_style: 'Research-heavy',
      influence_type: 'Early adopter',
      brand_relationship: 'Vocal advocate or critic'
    },
    baseline_skepticism: 'high',
    voice_traits: ['Articulate', 'References trends', 'Name-drops brands', 'Values-driven']
  },
  {
    name: 'Graham Foster (Conservative Skeptic)',
    slug: 'graham-foster',
    category: 'traditional',
    demographics: {
      age_range: '58',
      lifestage: 'mature_family',
      income: '$78K',
      location: 'Mornington Peninsula',
      education: 'Trade background',
      household: 'Married, adult kids'
    },
    psychographics: {
      values: ['Tradition', 'Value for money', 'Reliability', 'Local community'],
      motivations: ['Proven solutions', 'Reliability', 'Familiarity'],
      pain_points: ['Overcomplicated', 'Expensive', 'Woke marketing'],
      media_habits: ['Herald Sun', 'Radio 3AW', 'Facebook'],
      decision_style: 'Experience-based',
      influence_type: 'Skeptic',
      brand_relationship: 'Loyal once convinced'
    },
    baseline_skepticism: 'extreme',
    voice_traits: ['Brief', 'Skeptical', 'Direct', 'Experience-based']
  },
  {
    name: 'Zara Martinez (Adventurous Maximalist)',
    slug: 'zara-martinez',
    category: 'innovation',
    demographics: {
      age_range: '28',
      lifestage: 'young_adult',
      income: '$52K',
      location: 'Fitzroy',
      education: 'Creative Arts',
      household: 'Single'
    },
    psychographics: {
      values: ['Experience', 'Novelty', 'Self-expression', 'Authenticity'],
      motivations: ['Self-expression', 'Novelty', 'FOMO'],
      pain_points: ['Boring', 'Corporate', 'Commonplace'],
      media_habits: ['TikTok', 'Instagram', 'Substack', 'Spotify'],
      decision_style: 'Impulse + aesthetic',
      influence_type: 'Trendseeker',
      brand_relationship: 'Intense then moves on'
    },
    baseline_skepticism: 'low',
    voice_traits: ['Enthusiastic', 'Storytelling', 'Hyperbolic', 'Visual-focused']
  },
  {
    name: 'Jennifer Park (Practical Homebody)',
    slug: 'jennifer-park',
    category: 'convenience',
    demographics: {
      age_range: '41',
      lifestage: 'established_family',
      income: '$140K Household',
      location: 'Box Hill',
      education: 'CPA/Accountant',
      household: 'Married, 2 kids'
    },
    psychographics: {
      values: ['Family', 'Efficiency', 'Quality', 'Peace of mind'],
      motivations: ['Efficiency', 'Family wellbeing', 'Reliability'],
      pain_points: ['Complexity', 'Time-intensive', 'Kid-unfriendly'],
      media_habits: ['ABC News', 'Parenting blogs', 'Facebook groups'],
      decision_style: 'Calculated value',
      influence_type: 'Informed buyer',
      brand_relationship: 'Convenience-focused'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['Measured', 'Practical', 'Time-conscious', 'Systematic']
  },
  {
    name: 'Marcus Thompson (Outdoorsy Believer)',
    slug: 'marcus-thompson',
    category: 'traditional',
    demographics: {
      age_range: '45',
      lifestage: 'established_family',
      income: '$88K',
      location: 'Geelong',
      education: 'Master of Education',
      household: 'Married, 3 kids'
    },
    psychographics: {
      values: ['Nature', 'Health', 'Family time', 'Heritage brands'],
      motivations: ['Heritage', 'Durability', 'Environmental impact'],
      pain_points: ['Fast fashion', 'Greenwashing', 'Planned obsolescence'],
      media_habits: ['Outdoor magazines', 'ABC'],
      decision_style: 'Heritage-driven',
      influence_type: 'Brand evangelist',
      brand_relationship: 'Tribal loyalty'
    },
    baseline_skepticism: 'high',
    voice_traits: ['Passionate', 'Story-driven', 'Energetic', 'Authenticity-seeking']
  },
  {
    name: 'Olivia Brennan (Anxious Aspirer)',
    slug: 'olivia-brennan',
    category: 'premium',
    demographics: {
      age_range: '29',
      lifestage: 'young_professional',
      income: '$68K',
      location: 'South Yarra',
      education: 'Legal Assistant',
      household: 'Single'
    },
    psychographics: {
      values: ['Status', 'Belonging', 'Self-improvement', 'Perception'],
      motivations: ['Status', 'Belonging', 'Validation'],
      pain_points: ['Social failure', 'Looking poor', 'Waste of money'],
      media_habits: ['Instagram', 'LinkedIn', 'Vogue', 'Self-help podcasts'],
      decision_style: 'Social comparison',
      influence_type: 'Follower',
      brand_relationship: 'Aspirational'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['Agreeable', 'Insecure', 'Approval-seeking', 'Status-conscious']
  },
  {
    name: 'David Nguyen (Tech Expert Cynic)',
    slug: 'david-nguyen',
    category: 'innovation',
    demographics: {
      age_range: '36',
      lifestage: 'established_professional',
      income: '$135K',
      location: 'Inner West Sydney',
      education: 'Software Engineer',
      household: 'Partnered'
    },
    psychographics: {
      values: ['Privacy', 'Efficiency', 'Open source', 'Evidence-based'],
      motivations: ['Technical superiority', 'Privacy', 'Control'],
      pain_points: ['Vendor lock-in', 'Data harvesting', 'Marketing fluff'],
      media_habits: ['HackerNews', 'Reddit', 'Tech blogs'],
      decision_style: 'Specs-driven',
      influence_type: 'Challenger',
      brand_relationship: 'Anti-brand'
    },
    baseline_skepticism: 'extreme',
    voice_traits: ['Pedantic', 'Correcting', 'Highly skeptical', 'Evidence-demanding']
  },
  {
    name: 'Linda Morrison (Traditional Homebody)',
    slug: 'linda-morrison',
    category: 'traditional',
    demographics: {
      age_range: '62',
      lifestage: 'retired',
      income: '$48K',
      location: 'Ballarat',
      education: 'Nursing Degree',
      household: 'Widowed, grandkids'
    },
    psychographics: {
      values: ['Family', 'Comfort', 'Familiarity', 'Community'],
      motivations: ['Comfort', 'Familiarity', 'Family connection'],
      pain_points: ['Complexity', 'No phone support', 'Subscriptions'],
      media_habits: ['Channel 7', 'Woman\'s Day', 'Facebook'],
      decision_style: 'Habitual',
      influence_type: 'Deferential',
      brand_relationship: 'Decades-long loyalty'
    },
    baseline_skepticism: 'low',
    voice_traits: ['Warm', 'Nostalgic', 'Trusting', 'Simple']
  },
  {
    name: 'Jake Sullivan (Chaos Agent)',
    slug: 'jake-sullivan',
    category: 'innovation',
    demographics: {
      age_range: '31',
      lifestage: 'lifestyle_first',
      income: '$45K',
      location: 'Byron Bay',
      education: 'Mixed/Self-taught',
      household: 'Single'
    },
    psychographics: {
      values: ['Freedom', 'Experience', 'Authenticity', 'Creativity'],
      motivations: ['Vibes', 'Irony', 'Freedom'],
      pain_points: ['Corporate cringe', 'Taking things too seriously', 'Boredom'],
      media_habits: ['TikTok', 'Instagram', 'Niche subreddits'],
      decision_style: 'Vibe-based',
      influence_type: 'Disruptor',
      brand_relationship: 'Ironic consumer'
    },
    baseline_skepticism: 'high',
    voice_traits: ['Unpredictable', 'Humorous', 'Tangent-prone', 'Irreverent']
  },
  {
    name: 'Rebecca Walsh (Overachieving Pleaser)',
    slug: 'rebecca-walsh',
    category: 'mainstream',
    demographics: {
      age_range: '38',
      lifestage: 'established_family',
      income: '$105K',
      location: 'Canberra',
      education: 'Senior Analyst',
      household: 'Married, 1 child'
    },
    psychographics: {
      values: ['Achievement', 'Approval', 'Competence', 'Authority'],
      motivations: ['Approval', 'Achievement', 'Correctness'],
      pain_points: ['Being wrong', 'Suboptimal choices', 'Wasting money'],
      media_habits: ['ABC', 'SMH', 'Professional podcasts'],
      decision_style: 'Exhaustive research',
      influence_type: 'Validator',
      brand_relationship: 'Expert-driven'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['Over-prepared', 'Affirmation-seeking', 'Research-heavy', 'Competent']
  },
  {
    name: 'Tom Bradley (Silent Observer)',
    slug: 'tom-bradley',
    category: 'value',
    demographics: {
      age_range: '51',
      lifestage: 'middle_age_single',
      income: '$82K',
      location: 'Hobart',
      education: 'Electrician',
      household: 'Divorced'
    },
    psychographics: {
      values: ['Privacy', 'Independence', 'Practicality', 'Peace'],
      motivations: ['Independence', 'Privacy', 'Functional proof'],
      pain_points: ['Pushy sales', 'Complexity', 'Marketing speak'],
      media_habits: ['sporadic news', 'YouTube tutorials'],
      decision_style: 'Function over form',
      influence_type: 'Quiet observer',
      brand_relationship: 'Functional only'
    },
    baseline_skepticism: 'high',
    voice_traits: ['Laconic', 'Direct', 'Technically-focused', 'Reserved']
  },
  {
    name: 'Amy Chung (Balanced Moderator)',
    slug: 'amy-chung',
    category: 'mainstream',
    demographics: {
      age_range: '43',
      lifestage: 'established_family',
      income: '$92K',
      location: 'Perth',
      education: 'HR Manager',
      household: 'Married, 2 kids'
    },
    psychographics: {
      values: ['Fairness', 'Practicality', 'Family', 'Balance'],
      motivations: ['Balance', 'Fairness', 'Family needs'],
      pain_points: ['Extreme positions', 'Impracticality', 'Overpricing'],
      media_habits: ['ABC', 'Commercial TV', 'Social media'],
      decision_style: 'Balanced consideration',
      influence_type: 'Moderator',
      brand_relationship: 'Pragmatic loyalty'
    },
    baseline_skepticism: 'medium',
    voice_traits: ['Diplomatic', 'Balanced', 'Even-keeled', 'Fair']
  },
  // --- Original Broad Archetypes ---
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
