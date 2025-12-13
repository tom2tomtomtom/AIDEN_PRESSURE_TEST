# Phase 2: Persona Engine (Phantom Consumer Memory™)

**Estimated Duration:** 1.5 weeks
**Dependencies:** Phase 1 complete
**Status:** 🔄 In Progress

## Phase Objectives

1. Create 8 base persona archetypes
2. Build phantom memory bank (200+ memories for FMCG)
3. Implement memory retrieval algorithm
4. Build persona context assembly system

## Prerequisites Checklist

- [x] Phase 1 signed off
- [x] Database schema deployed
- [x] Auth flow working
- [x] Project CRUD working

---

## Tasks

### 2.1 Persona Archetypes

**Status:** ✅ Complete
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
- [x] Demographics (age_range, lifestage, income)
- [x] Psychographics (values, motivations, pain_points)
- [x] Decision style (analytical/emotional/social/habitual)
- [x] Influence type in groups

#### Files Created
- `supabase/seed/archetypes.sql`
- `scripts/seed-archetypes.mjs`

#### Verification
- [x] All 8 archetypes in database
- [x] Demographics valid
- [x] Psychographics comprehensive

---

### 2.2 FMCG Phantom Memories

**Status:** ✅ Complete
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
- [x] memory_text (the experience narrative)
- [x] trigger_keywords[] (what activates it)
- [x] emotional_residue (anger/disappointment/skepticism/hope)
- [x] trust_modifier (-5 to +5 impact)
- [x] experience_type enum

#### Files Created
- `scripts/seed-memories-fmcg.mjs`

#### Verification
- [x] 201 memories seeded (25+ per archetype)
- [x] All 8 archetypes covered
- [x] Trigger keywords meaningful
- [x] Trust modifiers balanced (avg: 0.34)

---

### 2.3 Memory Retrieval Engine

**Status:** ✅ Complete
**Estimate:** 4 hours

#### Requirements
Build retrieval system that:
- [x] Extracts keywords from stimulus text
- [x] Detects claim types (natural, clinical, value, premium, etc.)
- [x] Scores memories by relevance
- [x] Returns top 5 most relevant memories
- [x] Falls back to random if no matches

Scoring algorithm:
- Exact keyword match: +3
- Partial keyword match: +1
- Claim type match: +2
- Emotional intensity factor

#### Files Created
- `lib/persona/memory-retrieval.ts`
- `lib/persona/keyword-extractor.ts`
- `lib/persona/claim-detector.ts`

#### Verification
- [x] Returns relevant memories for test stimulus
- [x] Scoring produces sensible ranking
- [x] Handles no-match gracefully (fallback retrieval)

---

### 2.4 Archetype Loader

**Status:** ✅ Complete
**Estimate:** 2 hours

#### Requirements
- [x] Load archetype by ID from database
- [x] Include full demographics/psychographics
- [x] Cache archetypes for session (5 min TTL)
- [x] Type-safe return

#### Files Created
- `lib/persona/archetype-loader.ts`

#### Verification
- [x] Loads archetype correctly
- [x] Includes all fields
- [x] Handles not-found

---

### 2.5 Persona Context Builder

**Status:** ✅ Complete
**Estimate:** 3 hours

#### Requirements
Assemble full persona context for prompt:
- [x] Load archetype
- [x] Generate persona name (demographic-appropriate)
- [x] Retrieve relevant memories
- [x] Calculate calibrated skepticism level
- [x] Build memory narrative string
- [x] Return complete PersonaContext object

Skepticism calibration:
- Start with archetype baseline
- Apply test's calibration modifier (low -2, medium 0, high +1, extreme +3)
- Apply triggered memory trust modifiers
- Clamp to 1-10

#### Files Created
- `lib/persona/context-builder.ts`
- `lib/persona/name-generator.ts`
- `lib/persona/skepticism-calculator.ts`

#### Verification
- [x] Generates complete context
- [x] Names appropriate for demographics
- [x] Skepticism calculation correct
- [x] Memory narrative readable

---

### 2.6 Persona API Endpoint

**Status:** ✅ Complete
**Estimate:** 2 hours

#### Requirements
- [x] GET /api/archetypes - list all archetypes
- [x] GET /api/archetypes/[id] - get single with details
- [x] Include summary stats (memory count, etc.)

#### Files Created
- `app/api/archetypes/route.ts`
- `app/api/archetypes/[id]/route.ts`

#### Verification
- [x] Returns all archetypes with stats
- [x] Includes memory counts and distribution
- [x] Handles errors and auth

---

## Phase Completion Criteria

- [x] All tasks marked complete
- [x] Memory retrieval tested with sample stimuli
- [x] Context builder produces valid prompts
- [x] 201 memories seeded
- [x] STATUS.md updated

## Phase Sign-off

**Completed:** 2024-12-13
**Signed off by:** Claude
**Notes:** Phase 2 complete. Persona Engine with 8 archetypes, 201 FMCG memories, memory retrieval with keyword/claim scoring, and context builder ready for test execution.
