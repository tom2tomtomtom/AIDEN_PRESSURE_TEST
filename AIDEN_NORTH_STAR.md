# AIDEN — North Star & Guiding Principles

**Version:** 1.0 — February 2026
**Status:** Living Document — Update as the platform evolves
**Audience:** Every developer, designer, and decision-maker working on AIDEN

---

## 1. What AIDEN Is

AIDEN is an **AI-powered advertising and marketing platform** that covers the entire creative workflow — from first spark to finished asset. It replaces weeks of agency work with hours of AI-augmented collaboration, without replacing the human strategist. AIDEN has taste, conviction, and memory. It is not a generic AI wrapper.

**One sentence:** AIDEN is an opinionated creative partner that thinks, plans, tests, and builds campaigns alongside human teams.

---

## 2. The Vision

**A single platform where a marketing team can go from a blank brief to a tested, approved, production-ready campaign in one sitting.**

Today's creative workflow is fragmented across dozens of tools (Google Docs for briefs, Slack for brainstorming, Canva for mockups, SurveyMonkey for testing, PowerPoint for pitches). Each handoff loses context, dilutes strategy, and burns time.

AIDEN eliminates those handoffs. Every tool in the platform shares context — the brief, the strategy, the tone, the phantoms, the test results — so nothing gets lost between thinking and making.

---

## 3. The Five Tools

AIDEN is five interconnected applications, each with a clear role in the creative workflow. They share a single authentication system, a single database, and a single design language.

### The Workflow

```
  THINK          PLAN           TEST           CREATE
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  AIDEN   │  │  AIDEN   │  │  AIDEN   │  │  AIDEN   │
│  Chat    │→│  Pitch   │→│  Test    │→│  Create  │
│          │  │          │  │          │  │          │
│ Brainstorm│  │ 7-step   │  │ Pressure │  │ Visual   │
│ Strategize│  │ campaign │  │ test with│  │ assets & │
│ Explore  │  │ workflow │  │ AI panel │  │ video    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
       ↑              ↓              ↓              ↓
       └──────────────┴──────────────┴──────────────┘
                    AIDEN Gateway (SSO Hub)
                   www.aiden.services
```

### 3.1 AIDEN Chat — "Think"

**URL:** `chat.aiden.services`
**Purpose:** Creative AI collaboration — brainstorming, strategy, and sparring

**What it does:**
- Chat with AIDEN, powered by 335 phantom personalities that give it creative conviction, not compliance
- Watch phantoms fire in real-time on a 3D brain visualization
- Auto-extract strategic work product (Insights, Ideas, Copy) onto boards
- Upload documents (briefs, research) for contextual analysis
- Semantic search across workspaces and conversation history
- Evidence-backed fact validation via Perplexity search

**Tech:** React 18 + Vite + Three.js (frontend), FastAPI + Python (backend), Claude Sonnet 4, Gemini (vision), Perplexity (search)

**Why it matters:** This is where raw thinking happens. Unlike ChatGPT, AIDEN doesn't just answer — it pushes back, defends creative choices, and automatically organizes conversations into actionable strategy.

### 3.2 AIDEN Pitch — "Plan"

**URL:** `pitch.aiden.services`
**Purpose:** Structured campaign development from brief to pitch deck

**What it does:**
- 7-step guided workflow: Brief → Strategy → Territories → Big Idea → Copy Suite → Overview → Pitch
- Parse campaign briefs (PDF/text) with AI extraction
- Generate three creative variants: Normal (safe), Punchy (bold), Brave (unexpected)
- Complete copy suite across all platforms (social, email, press, TV, radio, OOH)
- Download professional PPTX pitch decks
- AIDEN Chat sidebar available at every step

**Tech:** Next.js 15 + React 19 (frontend), Express.js (backend), Python FastAPI (AIDEN service with 43 phantoms), Claude Haiku/Sonnet

**Why it matters:** This turns a messy brief into a structured campaign in 15 minutes. The three-variant system gives clients choice across the risk spectrum. The pitch deck is presentation-ready.

### 3.3 AIDEN Test — "Test"

**URL:** `test.aiden.services`
**Purpose:** Synthetic qualitative research — pressure-test concepts before they go live

**What it does:**
- 8 AI persona archetypes (The Pragmatist, The Innovator, The Skeptic, etc.)
- 200+ Phantom Consumer Memories per category — real experiential baggage from years of brand exposure
- Dual-track responses: what consumers say in polite company vs. what they actually think
- AI moderator for multi-turn conversations (follow-ups, probes, clarifications)
- Pressure Score (0-100) with strength/weakness analysis and recommendations
- PDF export of full research reports

**Tech:** Next.js 15 + TypeScript + Tailwind + shadcn/ui, Claude Sonnet 4, Supabase PostgreSQL

**Why it matters:** Human qualitative research costs £15,000+ and takes 2-4 weeks. AIDEN Test costs £300 and takes 10 minutes. The Phantom Consumer Memory system means personas don't just have opinions — they carry baggage from real category experiences.

### 3.4 AIDEN Create — "Create"

**URL:** `creative.aiden.services`
**Purpose:** AI-powered visual asset generation — images, video, and production-ready ads

**What it does:**
- Receive copy briefs from AIDEN Pitch and generate matching visuals
- 77-node visual pipeline editor (drag-drop workflow builder)
- AI image generation (Gemini 3 Pro), video generation (Sora 2, Veo3), audio (ElevenLabs)
- Design Chat — brainstorm with AI, then execute in one click
- Human review gates (approval/rejection nodes in pipelines)
- Gallery and unified asset library with tagging
- Background worker service for long-running generation jobs

**Tech:** Next.js 16 + ReactFlow (frontend), Express.js worker (background jobs), Gemini, GPT-5, Sora 2, Veo3, ElevenLabs

**Why it matters:** This closes the loop. Strategy and copy from Pitch become production-ready ads. The pipeline editor means non-technical users can build complex generation workflows. A single product image becomes 12 unique ad variations.

### 3.5 AIDEN Gateway — "Hub"

**URL:** `www.aiden.services`
**Purpose:** Single sign-on and tool discovery

**What it does:**
- One login for all AIDEN tools
- Dashboard with tool cards (Chat, Test, Create, Pitch)
- Comprehensive 30-chapter how-to guide
- About page with AIDEN philosophy and origin story
- Centralized authentication (JWT signing, session management, logout)

**Tech:** Next.js 15 + TypeScript, Supabase Auth, jose (HS256 JWT)

**Why it matters:** Users never re-authenticate when moving between tools. The Gateway signs a JWT cookie shared across all `.aiden.services` subdomains, enabling seamless cross-app navigation.

---

## 4. How the Tools Work Together

The tools are not isolated products — they form a **pipeline** where each tool's output is the next tool's input.

### Data Flow

```
AIDEN Chat              AIDEN Pitch             AIDEN Test             AIDEN Create
─────────────          ─────────────          ─────────────          ─────────────
Strategic boards  ───→  Brief input            Stimulus input  ←───  Brief deliverables
(Insights, Ideas,       Strategy output        Test results           Generated images
 Copy)                  Copy suite      ───→   Recommendations ───→  Videos, audio
                        Pitch deck                                    Gallery + assets
                            │
                            └───────→  ad_briefs table ───────────→  Brief → visual gen
```

### Shared Infrastructure

| Layer | Implementation | Shared Across |
|-------|---------------|---------------|
| **Authentication** | Gateway JWT (`aiden-gw` cookie, HS256, 30min, `.aiden.services`) | All 5 apps |
| **Database** | Supabase PostgreSQL | All 5 apps (separate schemas/tables) |
| **Design Language** | AIDEN brutalist (black/white, red/orange accents, sharp corners) | All 5 apps |
| **AI Backbone** | Anthropic Claude (Sonnet/Haiku) + Phantom System | Chat, Pitch, Test |
| **Deployment** | Railway | All 5 apps |
| **Domain** | `*.aiden.services` | All 5 apps |

### The Phantom System

AIDEN's distinctive voice comes from **phantoms** — personality fragments that fire based on context, intent, and emotion. They are not prompts; they are accumulated creative wisdom.

| App | Phantom Count | Purpose |
|-----|---------------|---------|
| Chat | 335 | Creative conviction, personality depth, conversational humor |
| Pitch | 43 | Strategic thinking, copywriting voice, campaign development |
| Test | 8 archetypes + 200+ memories | Consumer perspectives, category experience, skepticism |
| Create | — | Uses AI models directly (Gemini, GPT-5) for visual generation |
| Gateway | — | No phantoms (auth/navigation only) |

The Phantom System is what makes AIDEN different from every other AI wrapper. It's not a chatbot — it's a creative partner with opinions, preferences, and the willingness to push back.

---

## 5. Guiding Principles

These principles govern every decision — technical, design, and product. When in doubt, refer here.

### Principle 1: AIDEN Has Taste

AIDEN is not a blank canvas that reflects whatever the user asks for. It has aesthetic preferences, strategic opinions, and creative conviction. It will suggest the brave option. It will defend an idea it believes in. It will tell you when something is safe but forgettable.

**In practice:**
- The Phantom System must always be active. Never bypass it.
- Three-variant generation (Normal/Punchy/Brave) is non-negotiable in Pitch.
- Pressure Test personas carry real skepticism, not polite compliance.
- Chat's conviction mode means AIDEN will argue when it believes.

### Principle 2: Context Flows Downstream

Every tool should inherit context from upstream tools. A brief entered in Pitch should inform the copy. That copy should feed Test. Those test results should shape Create. Nothing should require re-entry.

**In practice:**
- The `ad_briefs` table bridges Pitch → Create.
- Copy suite output includes image prompts for each platform.
- Test stimulus should accept Pitch outputs directly.
- Board extractions in Chat should be importable into Pitch briefs.

### Principle 3: One Login, One Identity

A user logs in once and moves freely between all tools. Authentication is invisible after the first login. Logout is total — one click clears everything.

**In practice:**
- Only Gateway calls `supabase.auth.getUser()`. Every other app verifies the JWT locally.
- The `aiden-gw` cookie on `.aiden.services` is the single source of truth.
- All apps use `https://www.aiden.services` (never bare domain).
- See `AIDEN_AUTH_GOLD_STANDARD.md` for the definitive reference.

### Principle 4: Speed Over Perfection

AIDEN's value proposition is speed — campaigns in minutes, not weeks. Every architectural decision should prioritize response time. If a generation takes too long, it should stream. If auth takes too long, it should cache.

**In practice:**
- Tier-1 JWT verification: ~2ms (no network call).
- Copy suite generation: 2-4 minutes (stream progress to user).
- Test execution: 30-60 seconds for 5-8 personas.
- Pipeline editor: real-time node execution with SSE streaming.
- Never block the user waiting for AI — show progress, stream results.

### Principle 5: The Brutalist Aesthetic

AIDEN looks like nothing else. Black backgrounds. White text. Red and orange accents. Sharp corners. Grid patterns. No rounded corners, no pastels, no friendly gradients. The design communicates seriousness, precision, and creative authority.

**In practice:**
- Every app uses the shared design system (`design-system.ts` or equivalent).
- shadcn/ui components are restyled to match the AIDEN aesthetic.
- New features follow the existing visual language — don't introduce new colors or softness.
- The 3D brain visualization in Chat is a signature element.

### Principle 6: Fail Gracefully, Never Silently

When AI services fail, when auth expires, when databases time out — the user must know what happened and what to do. Never show a blank screen. Never loop endlessly. Never swallow errors.

**In practice:**
- 3-tier auth fallback (JWT → Gateway session → Supabase direct).
- Circuit breaker pattern on browser Supabase client.
- Retry logic with exponential backoff on all AI calls.
- CORS headers on ALL responses (including 401s) — prevents silent browser blocking.
- Rate limit detection and user-facing cooldown timers.

### Principle 7: The AI Never Bypasses the Phantom System

In Pitch and Chat, all AI generation routes through the Python AIDEN service, which applies the Phantom System. The Node.js backends are proxies only — they do not call Anthropic/OpenAI directly for creative generation.

**In practice:**
- Never add a direct Claude/GPT call in the Node.js backend for creative output.
- The pipeline: Frontend → Node.js Backend (proxy) → Python AIDEN Service (phantoms) → Claude API.
- Test and Create call AI directly because their use cases are different (consumer simulation and image generation).

### Principle 8: Keep It Simple

Don't over-engineer. Don't build abstractions for one-time operations. Don't add configurability nobody asked for. The right amount of complexity is the minimum needed for the current task.

**In practice:**
- Three similar lines of code is better than a premature abstraction.
- Don't add feature flags or backwards-compatibility shims — just change the code.
- Don't create helpers, utilities, or abstractions for one-time operations.
- Don't add error handling for scenarios that can't happen.

---

## 6. Architecture Invariants

These are non-negotiable technical constraints. Violating any of these will break the platform.

### Authentication
- `JWT_SECRET` must be identical across all 5 apps.
- `GATEWAY_URL` must be `https://www.aiden.services` (with `www`).
- Only Gateway calls `supabase.auth.getUser()` for login/session.
- Other apps verify JWT locally via `gateway-jwt.ts` / `verify_gateway_jwt()`.
- Browser Supabase clients have `autoRefreshToken: false`.
- Logout always redirects to `${GATEWAY_URL}/auth/logout`.
- Cookie domain is `.aiden.services` (leading dot) in production.

### Deployment
- All apps deploy on **Railway** (not Vercel).
- Use `request.nextUrl.href` (not `request.url`) for redirects on Railway.
- Always `npm run build` before deploying — catches TypeScript errors and SSR issues.
- `railway up --detach` to deploy.

### Database
- Supabase PostgreSQL with RLS (Row-Level Security) on every table.
- `database.ts` is auto-generated — never edit manually.
- `custom.ts` for manual type definitions.
- New tables require type regeneration before TypeScript will recognize them.

### AI Services
- Anthropic Claude is the primary reasoning model across the platform.
- Creative generation always flows through the Phantom System (Chat, Pitch).
- Image generation uses Gemini 3 Pro (primary) with fallbacks.
- Video generation uses Sora 2 / Veo3.
- All API calls have retry logic and circuit breakers.

---

## 7. What Success Looks Like

### For Users
- A marketing team uploads a brief and has a tested, approved campaign with visual assets in under an hour.
- A creative director brainstorms in Chat, refines in Pitch, validates in Test, and produces in Create — without re-entering context.
- A solo freelancer accesses agency-quality strategic thinking, consumer research, and asset production at a fraction of the cost.

### For the Platform
- All 5 tools share a single, seamless authentication experience.
- Context flows naturally between tools — no manual copy-pasting.
- AIDEN's voice is consistent across Chat and Pitch — the same creative conviction, the same phantom-driven personality.
- The platform handles failures gracefully — no login loops, no silent errors, no broken redirects.

### For the Codebase
- Every app follows the same patterns (auth middleware, design system, error handling).
- New developers can understand any app by reading its `CLAUDE.md` and `AIDEN_AUTH_GOLD_STANDARD.md`.
- Technical debt is tracked and resolved — not accumulated silently.
- Changes to one app don't break another.

---

## 8. The Competitive Moat

What makes AIDEN defensible:

1. **The Phantom System.** 335+ personality fragments trained on creative best practices. This is not a system prompt — it's accumulated wisdom with emotional, contextual, and conversational triggers. Nobody else has this.

2. **End-to-End Integration.** No competitor covers Think → Plan → Test → Create in a single platform with shared context. Jasper does copy. Canva does design. Nobody does both with strategy and testing.

3. **Phantom Consumer Memory.** Test personas carry real experiential baggage — brand failures they remember, claims they've heard before, category fatigue. This produces realistic resistance, not polite survey answers.

4. **Creative Conviction.** AIDEN pushes back. It defends ideas. It rates the brave option higher than the safe one. This is a feature, not a bug. Generic AI assistants are compliant; AIDEN is opinionated.

5. **Speed-to-Insight.** 15 minutes from brief to pitch deck. 10 minutes for synthetic consumer research. Hours from copy to production-ready visuals. This changes the economics of advertising.

---

## 9. Roadmap Priorities (Directional)

These are not commitments — they're the directions that serve the vision best.

### Near-Term
- [ ] Deepen Pitch → Create integration (auto-generate visuals for each copy deliverable)
- [ ] Chat board items → Pitch brief import (close the Think → Plan loop)
- [ ] Test results → Pitch refinement (close the Test → Plan feedback loop)
- [ ] Remove Tier-3 Supabase auth fallback (after 2 weeks stable)
- [ ] Remove legacy `aiden-auth-ts` cache cookie
- [ ] Phase 4 polish on Pressure Test (loading states, mobile, accessibility)

### Medium-Term
- [ ] Cross-app notifications (Test complete → Create ready → Pitch updated)
- [ ] Shared asset library across all tools
- [ ] Team collaboration (multi-user workspaces)
- [ ] Campaign versioning and history
- [ ] Mobile-responsive experience across all tools

### Long-Term
- [ ] API platform for external integrations
- [ ] White-label capabilities for agencies
- [ ] Multi-language campaign support
- [ ] Real-time collaboration (Google Docs-style)
- [ ] Analytics dashboard (campaign performance tracking)

---

## 10. How to Use This Document

1. **Before starting any feature work:** Re-read the Guiding Principles (Section 5) and Architecture Invariants (Section 6). If your change violates either, stop and reconsider.

2. **Before making cross-app changes:** Understand how the tools work together (Section 4). Changes to shared infrastructure (auth, database, design system) affect all 5 apps.

3. **When making design decisions:** The brutalist aesthetic is non-negotiable. The Phantom System is non-negotiable. Creative conviction is non-negotiable. Speed is non-negotiable.

4. **When onboarding new developers:** This document + the app-specific `CLAUDE.md` + `AIDEN_AUTH_GOLD_STANDARD.md` = everything you need to understand the platform.

5. **When prioritizing features:** Does it serve the vision of "brief to tested campaign in one sitting"? If yes, prioritize. If no, question why it exists.

---

## 11. Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Auth Gold Standard | `AIDEN_AUTH_GOLD_STANDARD.md` (in each repo) | Definitive auth architecture |
| Gateway CLAUDE.md | `AIDEN_GATEWAY/CLAUDE.md` | Gateway-specific patterns |
| Creative CLAUDE.md | `AIDEN_CREATIVE_AGENT_SSO/ad-creative-generator/CLAUDE.md` | Creative Agent patterns |
| Pitch CLAUDE.md | `AIDEN_STUDIO_V2/CLAUDE.md` | Studio/Pitch patterns |
| Test CLAUDE.md | `AIDEN_PRESSURE_TEST_SSO/CLAUDE.md` | Pressure Test patterns |
| Chat CLAUDE.md | `AIDEN_UNIFIED/CLAUDE.md` | Chat/Unified patterns |
| This Document | `AIDEN_NORTH_STAR.md` (home directory + each repo) | Platform vision and principles |

---

*This document is the single source of truth for what AIDEN is, why it exists, and how it should be built. When code and doc disagree, fix the code. When two principles conflict, choose the one that serves the user faster. When in doubt, ask: "Does this make AIDEN more opinionated, more integrated, or more useful?" If the answer is yes, ship it.*
