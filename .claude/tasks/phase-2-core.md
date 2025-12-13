# Phase 2: Persona Engine (Phantom Consumer Memory™)

**Estimated Duration:** 1.5 weeks
**Dependencies:** Phase 1 complete
**Status:** ⏳ Pending

## Phase Objectives

1. Create 8 base persona archetypes
2. Build phantom memory bank (200+ memories for FMCG)
3. Implement memory retrieval algorithm
4. Build persona context assembly system

## Prerequisites Checklist

- [ ] Phase 1 signed off
- [ ] Database schema deployed
- [ ] Auth flow working
- [ ] Project CRUD working

---

## Tasks

### 2.1 Persona Archetypes

**Status:** ⏳ Pending
**Estimate:** 3 hours

#### Requirements
Create 8 archetypes with distinct profiles:

| Archetype | Core Trait | Skepticism |
|-----------|------------|------------|
| Skeptical Switcher | Brand-burned pragmatist | 8 |
| Loyal Defender | Trusted-brand advocate | 4 |
| Value Hunter | Deal-seeking rationalist | 7 |
| Wellness Seeker | Health-conscious questioner | 6 |
| Convenience Prioritizer | Time-poor optimizer | 5 |
| Status Signaler | Premium-seeking validator | 6 |
| Eco Worrier | Sustainability skeptic | 7 |
| Trend Follower | Social-proof dependent | 5 |

Each needs:
- [ ] Demographics (age_range, lifestage, income)
- [ ] Psychographics (values, motivations, pain_points)
- [ ] Decision style (analytical/emotional/social/habitual)
- [ ] Influence type in groups

#### Files to Create
- `supabase/seed/archetypes.sql`

#### Verification
- [ ] All 8 archetypes in database
- [ ] Demographics valid
- [ ] Psychographics comprehensive

---

### 2.2 FMCG Phantom Memories

**Status:** ⏳ Pending
**Estimate:** 8 hours

#### Requirements
Create 25+ memories per archetype (200+ total) for FMCG category:

Memory types:
- Brand betrayal (reformulation, shrinkflation, quality drop)
- Trust erosion (misleading claims, greenwashing)
- Price shock (unexpected increases, subscription traps)
- Positive discovery (store brand wins, new favorite)
- Category disappointment (whole segment failures)
- Social influence (recommendations, warnings)

Each memory needs:
- [ ] memory_text (the experience narrative)
- [ ] trigger_keywords[] (what activates it)
- [ ] emotional_residue (anger/disappointment/skepticism/hope)
- [ ] trust_modifier (-5 to +5 impact)
- [ ] memory_type enum

#### Files to Create
- `supabase/seed/memories-fmcg.sql`

#### Verification
- [ ] 200+ memories seeded
- [ ] All archetypes covered
- [ ] Trigger keywords meaningful
- [ ] Trust modifiers balanced

---

### 2.3 Memory Retrieval Engine

**Status:** ⏳ Pending
**Estimate:** 4 hours

#### Requirements
Build retrieval system that:
- [ ] Extracts keywords from stimulus text
- [ ] Detects claim types (natural, clinical, value, premium, etc.)
- [ ] Scores memories by relevance
- [ ] Returns top 5 most relevant memories
- [ ] Falls back to random if no matches

Scoring algorithm:
- Exact keyword match: +3
- Partial keyword match: +1
- Claim type match: +2
- Recency weight factor
- Emotional intensity factor

#### Files to Create
- `lib/persona/memory-retrieval.ts`
- `lib/persona/keyword-extractor.ts`
- `lib/persona/claim-detector.ts`

#### Verification
- [ ] Returns relevant memories for test stimulus
- [ ] Scoring produces sensible ranking
- [ ] Performance < 100ms
- [ ] Handles no-match gracefully

---

### 2.4 Archetype Loader

**Status:** ⏳ Pending
**Estimate:** 2 hours

#### Requirements
- [ ] Load archetype by ID from database
- [ ] Include full demographics/psychographics
- [ ] Cache archetypes for session
- [ ] Type-safe return

#### Files to Create
- `lib/persona/archetype-loader.ts`

#### Verification
- [ ] Loads archetype correctly
- [ ] Includes all fields
- [ ] Handles not-found

---

### 2.5 Persona Context Builder

**Status:** ⏳ Pending
**Estimate:** 3 hours

#### Requirements
Assemble full persona context for prompt:
- [ ] Load archetype
- [ ] Generate persona name (demographic-appropriate)
- [ ] Retrieve relevant memories
- [ ] Calculate calibrated skepticism level
- [ ] Build memory narrative string
- [ ] Return complete PersonaContext object

Skepticism calibration:
- Start with archetype baseline
- Apply test's calibration modifier (low -2, medium 0, high +1, extreme +3)
- Apply triggered memory trust modifiers
- Clamp to 1-10

#### Files to Create
- `lib/persona/context-builder.ts`
- `lib/persona/name-generator.ts`
- `lib/persona/skepticism-calculator.ts`

#### Verification
- [ ] Generates complete context
- [ ] Names appropriate for demographics
- [ ] Skepticism calculation correct
- [ ] Memory narrative readable

---

### 2.6 Persona API Endpoint

**Status:** ⏳ Pending
**Estimate:** 2 hours

#### Requirements
- [ ] GET /api/archetypes - list all archetypes
- [ ] GET /api/archetypes/[id] - get single with details
- [ ] Include summary stats (memory count, etc.)

#### Files to Create
- `app/api/archetypes/route.ts`
- `app/api/archetypes/[id]/route.ts`

#### Verification
- [ ] Returns all archetypes
- [ ] Includes memory counts
- [ ] Handles errors

---

## Phase Completion Criteria

- [ ] All tasks marked complete
- [ ] Memory retrieval tested with sample stimuli
- [ ] Context builder produces valid prompts
- [ ] 200+ memories seeded
- [ ] STATUS.md updated

## Phase Sign-off

**Completed:** [Date]
**Signed off by:** [Name]
**Notes:** [Carry-forward items]
