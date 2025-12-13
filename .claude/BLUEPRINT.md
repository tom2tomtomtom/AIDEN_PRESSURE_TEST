# Project Blueprint

## System Overview

**Phantom Pressure Test** is a synthetic qualitative research platform that pressure-tests marketing concepts against AI-powered consumer personas enriched with "phantom memories" - accumulated category experiences that shape skepticism, trust, and response patterns.

The system enables marketing teams to pre-qualify concepts before expensive human research by simulating realistic consumer reactions from personas who carry experiential baggage from past brand interactions, disappointments, and discoveries.

**Target Users:** Brand strategists, innovation teams, creative agencies
**Core Value:** 10-minute concept validation at £150-300 vs £15,000+ traditional qual

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 Web App                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Auth    │  │ Projects │  │  Test    │  │ Results  │    │    │
│  │  │  Pages   │  │Dashboard │  │ Wizard   │  │  View    │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                         API LAYER                                    │
│  ┌────────────────────────────┴────────────────────────────────┐    │
│  │                   Next.js API Routes                         │    │
│  │  /api/projects  /api/tests  /api/tests/[id]/run             │    │
│  └──────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                      SERVICE LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Persona    │  │    Test      │  │   Results    │               │
│  │   Engine     │  │  Execution   │  │  Analysis    │               │
│  │              │  │              │  │              │               │
│  │ • Archetype  │  │ • Prompt     │  │ • Scoring    │               │
│  │   Loading    │  │   Assembly   │  │ • Aggregation│               │
│  │ • Memory     │  │ • LLM Calls  │  │ • Insights   │               │
│  │   Retrieval  │  │ • Response   │  │              │               │
│  │ • Context    │  │   Parsing    │  │              │               │
│  │   Building   │  │              │  │              │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────────────┐
│         │           EXTERNAL SERVICES       │                        │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐               │
│  │   Supabase   │  │  Claude API  │  │   Railway    │               │
│  │              │  │  (Anthropic) │  │              │               │
│  │ • Auth       │  │              │  │ • Hosting    │               │
│  │ • Database   │  │ • Sonnet 4   │  │ • Env Vars   │               │
│  │ • RLS        │  │ • JSON Mode  │  │ • Domains    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
AIDEN_PRESSURE_TEST/
├── CLAUDE.md                    # Gatekeeper - READ FIRST
├── .claude/
│   ├── BLUEPRINT.md             # This file - architecture truth
│   ├── STATUS.md                # Current state tracker
│   ├── DECISIONS.md             # ADRs - why we chose X
│   ├── PATTERNS.md              # Approved code patterns
│   ├── STACK.md                 # Tech stack with versions
│   └── tasks/
│       ├── phase-1-foundation.md
│       ├── phase-2-core.md
│       └── phase-3-features.md
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── callback/route.ts
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx             # Dashboard home
│   │   ├── projects/
│   │   │   ├── page.tsx         # Project list
│   │   │   ├── new/page.tsx     # Create project
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Project detail
│   │   │       └── tests/
│   │   │           ├── new/page.tsx
│   │   │           └── [testId]/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── projects/route.ts
│   │   ├── tests/
│   │   │   ├── route.ts
│   │   │   └── [testId]/
│   │   │       ├── route.ts
│   │   │       └── run/route.ts
│   │   └── archetypes/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── forms/                   # Form components
│   ├── layout/                  # Header, Sidebar, etc.
│   └── results/                 # Results display
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   ├── anthropic/
│   │   └── client.ts            # Claude API wrapper
│   ├── persona/
│   │   ├── archetype-loader.ts
│   │   ├── memory-retrieval.ts
│   │   ├── context-builder.ts
│   │   └── name-generator.ts
│   ├── prompts/
│   │   ├── persona-response.ts
│   │   ├── group-dynamics.ts
│   │   └── aggregated-analysis.ts
│   └── utils/
│       └── index.ts
├── types/
│   ├── database.ts              # Generated from Supabase
│   ├── api.ts                   # API request/response
│   └── domain.ts                # Domain models
├── supabase/
│   ├── migrations/
│   └── seed/
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Data Model

### Entity Relationship

```
┌──────────────────┐
│  organizations   │
├──────────────────┤
│ id (uuid) PK     │
│ name             │
│ slug             │
│ created_at       │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐     ┌──────────────────┐
│ org_members      │     │  projects        │
├──────────────────┤     ├──────────────────┤
│ org_id (fk)      │     │ id (uuid) PK     │
│ user_id (fk)     │     │ org_id (fk)      │
│ role             │     │ name             │
└──────────────────┘     │ category         │
                         │ brand_context    │
                         └────────┬─────────┘
                                  │
                                  │ 1:N
                                  ▼
┌──────────────────┐     ┌──────────────────┐
│ persona_         │     │ pressure_tests   │
│ archetypes       │     ├──────────────────┤
├──────────────────┤     │ id (uuid) PK     │
│ id (uuid) PK     │     │ project_id (fk)  │
│ name             │     │ name             │
│ demographics     │     │ stimulus         │
│ psychographics   │     │ panel_config     │
│ baseline_skept.  │     │ status           │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │ 1:N                    │ 1:N
         ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│ phantom_memories │     │ persona_responses│
├──────────────────┤     ├──────────────────┤
│ id (uuid) PK     │     │ id (uuid) PK     │
│ archetype_id(fk) │     │ test_id (fk)     │
│ category         │     │ archetype_id(fk) │
│ memory_text      │     │ persona_name     │
│ trigger_keywords │     │ gut_reaction     │
│ emotional_residue│     │ considered_view  │
│ trust_modifier   │     │ social_response  │
└──────────────────┘     │ private_thought  │
                         └──────────────────┘
```

## Feature Specifications

### F1: Authentication
- Magic link (passwordless) via Supabase Auth
- Auto-create organization on first login
- Protected routes via middleware
- Session persistence

### F2: Project Management
- Multi-tenant with organization isolation
- Categories: FMCG, Services, Premium, Tech, Finance
- Brand context capture (tone, competitors, history)
- Soft delete with archive

### F3: Persona Engine (Phantom Consumer Memory™)
- 8 base archetypes with distinct psychographics
- 200+ phantom memories per category
- Memory retrieval via keyword matching + claim detection
- Skepticism calibration (low/medium/high/extreme)

### F4: Test Execution
- Stimulus input with claim extraction
- Panel configuration (archetypes + skepticism)
- Parallel persona response generation
- Dual-track responses (gut vs considered, social vs private)

### F5: Results & Analysis
- Pressure Score (0-100 concept resilience)
- Gut Attraction Index
- Credibility Score
- Weakness identification with evidence
- Actionable refinement recommendations

## Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Test Execution | < 60s | End-to-end |
| Page Load | < 2s | LCP |
| API Response | < 200ms | p95 (non-LLM) |
| LLM Cost | < £0.50/test | Per execution |
| Uptime | 99.9% | Monthly |
