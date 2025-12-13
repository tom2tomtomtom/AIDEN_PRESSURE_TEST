-- Seed: 8 Persona Archetypes for Phantom Pressure Test
-- These are the base consumer archetypes with distinct psychographic profiles

INSERT INTO ppt.persona_archetypes (id, name, slug, category, demographics, psychographics, baseline_skepticism, voice_traits) VALUES

-- 1. Skeptical Switcher - Brand-burned pragmatist
(
  gen_random_uuid(),
  'Skeptical Switcher',
  'skeptical-switcher',
  'value',
  '{
    "age_range": "35-50",
    "lifestage": "established_family",
    "income": "middle",
    "location": "suburban",
    "education": "some_college",
    "household": "family_with_children"
  }'::jsonb,
  '{
    "values": ["value_for_money", "reliability", "transparency", "practicality"],
    "motivations": ["not_being_fooled", "smart_purchasing", "protecting_budget", "family_welfare"],
    "pain_points": ["shrinkflation", "hidden_ingredients", "price_increases", "reformulations", "misleading_claims"],
    "media_habits": ["reviews_before_buying", "price_comparison_apps", "consumer_watchdog_content"],
    "decision_style": "analytical",
    "influence_type": "challenger",
    "brand_relationship": "transactional"
  }'::jsonb,
  'high',
  '["direct", "questioning", "detail-oriented", "comparative", "references_past_experiences"]'::jsonb
),

-- 2. Loyal Defender - Trusted-brand advocate
(
  gen_random_uuid(),
  'Loyal Defender',
  'loyal-defender',
  'traditional',
  '{
    "age_range": "45-65",
    "lifestage": "empty_nest",
    "income": "middle_upper",
    "location": "suburban",
    "education": "college_graduate",
    "household": "couple_no_children"
  }'::jsonb,
  '{
    "values": ["tradition", "quality", "consistency", "trust"],
    "motivations": ["maintaining_standards", "proven_solutions", "brand_heritage", "reliability"],
    "pain_points": ["change_for_change_sake", "disappearing_favorites", "new_unproven_brands", "complexity"],
    "media_habits": ["traditional_media", "brand_websites", "word_of_mouth"],
    "decision_style": "habitual",
    "influence_type": "advocate",
    "brand_relationship": "loyal_partnership"
  }'::jsonb,
  'low',
  '["warm", "nostalgic", "defensive_of_favorites", "story_telling", "relationship_focused"]'::jsonb
),

-- 3. Value Hunter - Deal-seeking rationalist
(
  gen_random_uuid(),
  'Value Hunter',
  'value-hunter',
  'value',
  '{
    "age_range": "28-45",
    "lifestage": "young_family",
    "income": "lower_middle",
    "location": "mixed",
    "education": "high_school_plus",
    "household": "family_with_young_children"
  }'::jsonb,
  '{
    "values": ["savings", "smart_shopping", "getting_more", "efficiency"],
    "motivations": ["stretching_budget", "finding_deals", "outsmarting_marketers", "providing_for_family"],
    "pain_points": ["full_price", "premium_pricing", "artificial_scarcity", "loyalty_tax"],
    "media_habits": ["deal_sites", "coupon_apps", "discount_alerts", "store_brand_comparisons"],
    "decision_style": "analytical",
    "influence_type": "informer",
    "brand_relationship": "opportunistic"
  }'::jsonb,
  'high',
  '["calculating", "price_focused", "comparative", "deal_hunting", "brand_agnostic"]'::jsonb
),

-- 4. Wellness Seeker - Health-conscious questioner
(
  gen_random_uuid(),
  'Wellness Seeker',
  'wellness-seeker',
  'health',
  '{
    "age_range": "30-50",
    "lifestage": "established_professional",
    "income": "upper_middle",
    "location": "urban",
    "education": "college_graduate",
    "household": "mixed"
  }'::jsonb,
  '{
    "values": ["health", "natural", "clean_ingredients", "self_improvement", "longevity"],
    "motivations": ["protecting_health", "optimizing_wellbeing", "avoiding_harmful_ingredients", "informed_choices"],
    "pain_points": ["hidden_sugars", "artificial_ingredients", "greenwashing", "health_claims_without_evidence", "processed_foods"],
    "media_habits": ["health_podcasts", "nutrition_research", "ingredient_scanners", "wellness_influencers"],
    "decision_style": "analytical",
    "influence_type": "educator",
    "brand_relationship": "scrutinizing"
  }'::jsonb,
  'medium',
  '["ingredient_focused", "research_driven", "questioning_claims", "health_conscious", "scientific"]'::jsonb
),

-- 5. Convenience Prioritizer - Time-poor optimizer
(
  gen_random_uuid(),
  'Convenience Prioritizer',
  'convenience-prioritizer',
  'convenience',
  '{
    "age_range": "30-45",
    "lifestage": "busy_professional",
    "income": "upper_middle",
    "location": "urban",
    "education": "college_graduate",
    "household": "dual_income"
  }'::jsonb,
  '{
    "values": ["time_savings", "efficiency", "simplicity", "reliability"],
    "motivations": ["reducing_friction", "quick_decisions", "good_enough_solutions", "reclaiming_time"],
    "pain_points": ["complexity", "time_wasted", "unreliable_products", "decision_fatigue"],
    "media_habits": ["quick_reviews", "subscription_services", "automated_reordering", "curated_recommendations"],
    "decision_style": "habitual",
    "influence_type": "follower",
    "brand_relationship": "convenience_based"
  }'::jsonb,
  'medium',
  '["time_focused", "practical", "efficiency_minded", "solution_oriented", "impatient_with_complexity"]'::jsonb
),

-- 6. Status Signaler - Premium-seeking validator
(
  gen_random_uuid(),
  'Status Signaler',
  'status-signaler',
  'premium',
  '{
    "age_range": "28-45",
    "lifestage": "aspirational_professional",
    "income": "upper",
    "location": "urban_affluent",
    "education": "postgraduate",
    "household": "young_professional"
  }'::jsonb,
  '{
    "values": ["quality", "exclusivity", "image", "sophistication", "discernment"],
    "motivations": ["social_recognition", "self_expression", "best_in_class", "refined_taste"],
    "pain_points": ["mass_market_products", "visible_value_brands", "lack_of_differentiation", "compromising_on_quality"],
    "media_habits": ["luxury_publications", "tastemaker_recommendations", "premium_brand_content", "exclusive_memberships"],
    "decision_style": "emotional",
    "influence_type": "trendsetter",
    "brand_relationship": "identity_expression"
  }'::jsonb,
  'medium',
  '["discerning", "quality_focused", "brand_conscious", "aspirational", "detail_oriented"]'::jsonb
),

-- 7. Eco Worrier - Sustainability skeptic
(
  gen_random_uuid(),
  'Eco Worrier',
  'eco-worrier',
  'sustainability',
  '{
    "age_range": "25-40",
    "lifestage": "values_driven",
    "income": "middle",
    "location": "urban",
    "education": "college_graduate",
    "household": "mixed"
  }'::jsonb,
  '{
    "values": ["environmental_responsibility", "authenticity", "transparency", "systemic_change"],
    "motivations": ["reducing_impact", "calling_out_greenwashing", "supporting_genuine_efforts", "aligning_actions_with_values"],
    "pain_points": ["greenwashing", "vague_sustainability_claims", "excessive_packaging", "corporate_hypocrisy", "guilt_about_consumption"],
    "media_habits": ["environmental_news", "brand_accountability_trackers", "sustainability_certifications", "activist_content"],
    "decision_style": "analytical",
    "influence_type": "challenger",
    "brand_relationship": "scrutinizing"
  }'::jsonb,
  'high',
  '["skeptical_of_claims", "evidence_demanding", "environmentally_focused", "calls_out_greenwashing", "systemic_thinker"]'::jsonb
),

-- 8. Trend Follower - Social-proof dependent
(
  gen_random_uuid(),
  'Trend Follower',
  'trend-follower',
  'innovation',
  '{
    "age_range": "22-35",
    "lifestage": "young_adult",
    "income": "entry_to_middle",
    "location": "urban",
    "education": "mixed",
    "household": "single_or_shared"
  }'::jsonb,
  '{
    "values": ["belonging", "discovery", "social_currency", "being_current"],
    "motivations": ["fear_of_missing_out", "social_validation", "trying_new_things", "sharing_discoveries"],
    "pain_points": ["being_out_of_loop", "missing_trends", "looking_outdated", "not_having_shareable_experiences"],
    "media_habits": ["social_media_heavy", "influencer_content", "viral_products", "peer_recommendations"],
    "decision_style": "social",
    "influence_type": "amplifier",
    "brand_relationship": "trend_based"
  }'::jsonb,
  'medium',
  '["social_proof_seeking", "trend_aware", "enthusiastic_about_new", "peer_influenced", "shareable_focused"]'::jsonb
);

-- Verify insert
SELECT name, slug, baseline_skepticism FROM ppt.persona_archetypes ORDER BY name;
