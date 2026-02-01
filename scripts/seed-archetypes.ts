/**
 * Seed archetypes to the database via direct SQL
 * Run with: npx tsx scripts/seed-archetypes.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import postgres from 'postgres'

// Connection string for the remote database
// Format: postgres://[user]:[password]@[host]:[port]/[database]
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres.ghfpddycfrmaclalylfn:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

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
      pain_points: ['shrinkflation', 'hidden_ingredients', 'price_increases', 'misleading_claims'],
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
      pain_points: ['change_for_change_sake', 'disappearing_favorites', 'new_unproven_brands'],
      media_habits: ['traditional_media', 'brand_newsletters', 'word_of_mouth'],
      decision_style: 'habitual',
      influence_type: 'advocate',
      brand_relationship: 'loyal'
    },
    baseline_skepticism: 'low',
    voice_traits: ['measured', 'nostalgic', 'brand-referencing', 'quality-focused', 'heritage-conscious']
  },
  {
    name: 'Trend Seeker',
    slug: 'trend-seeker',
    category: 'innovation',
    demographics: {
      age_range: '22-35',
      lifestage: 'young_professional',
      income: 'middle',
      location: 'urban',
      education: 'college_graduate',
      household: 'single_or_roommates'
    },
    psychographics: {
      values: ['novelty', 'social_currency', 'self_expression', 'experience'],
      motivations: ['being_first', 'discovery', 'social_sharing', 'standing_out'],
      pain_points: ['missing_out', 'basic_options', 'outdated_products', 'boring_brands'],
      media_habits: ['social_media_heavy', 'influencer_content', 'trend_publications'],
      decision_style: 'impulsive',
      influence_type: 'early_adopter',
      brand_relationship: 'experimental'
    },
    baseline_skepticism: 'low',
    voice_traits: ['enthusiastic', 'social-media-influenced', 'trend-aware', 'fomo-driven', 'shareable-focused']
  },
  {
    name: 'Health Guardian',
    slug: 'health-guardian',
    category: 'health',
    demographics: {
      age_range: '30-45',
      lifestage: 'young_family',
      income: 'upper_middle',
      location: 'suburban',
      education: 'postgraduate',
      household: 'family_with_young_children'
    },
    psychographics: {
      values: ['health', 'safety', 'natural', 'transparency', 'family_protection'],
      motivations: ['protecting_family', 'informed_choices', 'clean_ingredients', 'long_term_wellness'],
      pain_points: ['hidden_additives', 'misleading_health_claims', 'unclear_sourcing', 'greenwashing'],
      media_habits: ['health_publications', 'medical_studies', 'parenting_forums', 'ingredient_apps'],
      decision_style: 'research_intensive',
      influence_type: 'gatekeeper',
      brand_relationship: 'conditional_trust'
    },
    baseline_skepticism: 'high',
    voice_traits: ['health-focused', 'ingredient-conscious', 'research-heavy', 'protective', 'evidence-demanding']
  }
]

async function seedArchetypes() {
  console.log('Note: This script requires DATABASE_URL or SUPABASE_DB_PASSWORD to be set')
  console.log('You may need to get the database password from Supabase dashboard\n')

  // Check if we have the password
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_PASSWORD) {
    console.log('Missing database credentials. You can:')
    console.log('1. Set DATABASE_URL in .env.local')
    console.log('2. Set SUPABASE_DB_PASSWORD in .env.local')
    console.log('3. Run the seed SQL file manually via Supabase dashboard SQL editor\n')

    console.log('Alternative: Run this SQL in Supabase dashboard SQL editor:')
    console.log('---')

    for (const arch of archetypes) {
      console.log(`
INSERT INTO ppt.persona_archetypes (name, slug, category, demographics, psychographics, baseline_skepticism, voice_traits)
VALUES (
  '${arch.name}',
  '${arch.slug}',
  '${arch.category}',
  '${JSON.stringify(arch.demographics)}'::jsonb,
  '${JSON.stringify(arch.psychographics)}'::jsonb,
  '${arch.baseline_skepticism}',
  '${JSON.stringify(arch.voice_traits)}'::jsonb
) ON CONFLICT (slug) DO NOTHING;
`)
    }
    console.log('---')
    return
  }

  try {
    const sql = postgres(connectionString)

    console.log('Checking existing archetypes...')
    const existing = await sql`SELECT slug FROM ppt.persona_archetypes`
    console.log(`Found ${existing.length} existing archetypes`)

    if (existing.length >= 4) {
      console.log('Archetypes already seeded!')
      const all = await sql`SELECT id, name, slug FROM ppt.persona_archetypes`
      console.log('\nExisting archetypes:')
      all.forEach((a: any) => console.log(`  - ${a.name} (${a.slug}): ${a.id}`))
      await sql.end()
      return
    }

    console.log('Seeding archetypes...')

    for (const arch of archetypes) {
      await sql`
        INSERT INTO ppt.persona_archetypes (name, slug, category, demographics, psychographics, baseline_skepticism, voice_traits)
        VALUES (
          ${arch.name},
          ${arch.slug},
          ${arch.category}::ppt.archetype_category,
          ${JSON.stringify(arch.demographics)}::jsonb,
          ${JSON.stringify(arch.psychographics)}::jsonb,
          ${arch.baseline_skepticism}::ppt.skepticism_level,
          ${JSON.stringify(arch.voice_traits)}::jsonb
        ) ON CONFLICT (slug) DO NOTHING
      `
      console.log(`✅ Seeded: ${arch.name}`)
    }

    console.log('\nDone! Verifying...')
    const final = await sql`SELECT id, name, slug FROM ppt.persona_archetypes`
    console.log(`\nTotal archetypes: ${final.length}`)
    final.forEach((a: any) => console.log(`  - ${a.name} (${a.slug}): ${a.id}`))

    await sql.end()
  } catch (error) {
    console.error('Error:', error)
  }
}

seedArchetypes()
