# AIDEN — Developer North Star

**Version:** 2.0 — February 2026
**Purpose:** Orient developers and Claude Code sessions. Read this before touching any AIDEN repo.

---

## What AIDEN Is

Five interconnected tools covering the creative workflow: Think → Plan → Test → Create. They share one auth system, one database, one design language. Context flows downstream — each tool's output is the next tool's input.

```
AIDEN Chat → AIDEN Pitch → AIDEN Test → AIDEN Create
  (Think)      (Plan)        (Test)       (Create)
     ↑             ↓             ↓             ↓
     └─────────────┴─────────────┴─────────────┘
                 AIDEN Gateway (SSO Hub)
                www.aiden.services
```

---

## The Five Tools — Quick Reference

| Tool | URL | Stack | AI Routing | Purpose |
|------|-----|-------|------------|---------|
| **Gateway** | `www.aiden.services` | Next.js 15 + Supabase Auth | None | SSO hub, JWT signing |
| **Chat** | `chat.aiden.services` | React 18 + Vite + Three.js, FastAPI backend | Python AIDEN service (335 phantoms) → Claude | Brainstorming, strategic sparring |
| **Pitch** | `pitch.aiden.services` | Next.js 15 + React 19, Express.js proxy | Python AIDEN service (43 phantoms) → Claude | 7-step campaign builder |
| **Test** | `test.aiden.services` | Next.js 15 + TypeScript + shadcn/ui | Direct Claude calls (8 archetypes + 200 memories) | Synthetic consumer research |
| **Create** | `creative.aiden.services` | Next.js 16 + ReactFlow, Express.js worker | Direct AI calls (Gemini 3 Pro, Sora 2, Veo3) | Visual asset generation |

---

## Never Do This

These will break the platform. Non-negotiable.

1. **Never call Anthropic/OpenAI directly from Node.js backends for creative generation.** Chat and Pitch creative output MUST route through the Python AIDEN service (phantom system). The Node.js backends are proxies only.

2. **Never edit `database.ts` manually.** It's auto-generated. Use `custom.ts` for manual type definitions. Regenerate types when adding tables.

3. **Never use bare domain without `www`.** Gateway URL is always `https://www.aiden.services`. Never `https://aiden.services`.

4. **Never call `supabase.auth.getUser()` outside Gateway.** Only Gateway does this for login/session. All other apps verify JWT locally via `gateway-jwt.ts` / `verify_gateway_jwt()`.

5. **Never set `autoRefreshToken: true` on browser Supabase clients.** Always `false`.

6. **Never use `request.url` for redirects on Railway.** Use `request.nextUrl.href`.

7. **Never bypass the Phantom System for creative output.** If it's Chat or Pitch generating creative/strategic content, it goes through phantoms. Always.

8. **Never introduce rounded corners, pastels, or gradients.** AIDEN is brutalist: black backgrounds, white text, red/orange accents, sharp corners.

9. **Never swallow errors silently.** No blank screens, no infinite loops, no silent failures. Every failure state shows the user what happened and what to do.

10. **Never add `moment`, `lodash`, or `axios`.** Use `date-fns`, native JS, and native `fetch`.

---

## Authentication — The One Rule

All five apps share a single JWT-based auth system. If you get this wrong, everything breaks.

**How it works:**
- Gateway signs a JWT cookie (`aiden-gw`, HS256, 30min expiry)
- Cookie domain: `.aiden.services` (leading dot) in production
- Other apps verify this JWT locally — no network call (~2ms)
- `JWT_SECRET` must be identical across all 5 apps
- Logout always redirects to `${GATEWAY_URL}/auth/logout`

**Auth fallback:** 3-tier: JWT → Gateway session → Supabase direct. But tier-3 is being removed.

**Definitive reference:** `AIDEN_AUTH_GOLD_STANDARD.md` in each repo.

---

## Data Flow Between Tools

```
Chat                    Pitch                   Test                    Create
───────────            ───────────            ───────────            ───────────
Strategic boards  ───→  Brief input            Stimulus input  ←───  Brief deliverables
(Insights, Ideas,       Strategy output        Test results           Generated images
 Copy)                  Copy suite      ───→   Recommendations ───→  Videos, audio
                        Pitch deck                                    Gallery + assets
                            │
                            └───────→  ad_briefs table ───────────→  Brief → visual gen
```

**The principle:** Context flows downstream. A brief in Pitch informs copy. Copy feeds Test. Test results shape Create. Nothing should require re-entry.

---

## Shared Infrastructure

| Layer | Implementation | Notes |
|-------|---------------|-------|
| **Auth** | Gateway JWT (`aiden-gw` cookie, HS256) | See auth section above |
| **Database** | Supabase PostgreSQL | RLS on every table. Separate schemas per app. |
| **Design** | AIDEN brutalist (black/white, red/orange, sharp corners) | `design-system.ts` or equivalent per app |
| **AI** | Anthropic Claude (Sonnet/Haiku) + Phantom System | Chat + Pitch through phantoms. Test + Create direct. |
| **Deployment** | Railway | `npm run build` before deploy. `railway up --detach`. |
| **Domain** | `*.aiden.services` | All subdomains share auth cookie |

---

## AI Routing — Which App Calls What

This is the most common source of architectural mistakes. Memorize it.

```
Chat/Pitch (creative output):
  Frontend → Node.js Backend (PROXY ONLY) → Python AIDEN Service (phantoms) → Claude API

Test (consumer simulation):
  Frontend → Next.js API route → Claude API directly (personas carry their own memories)

Create (visual generation):
  Frontend → Express.js worker → Gemini 3 Pro / Sora 2 / Veo3 / ElevenLabs directly
```

**Why the split:** Chat and Pitch need the phantom system for creative conviction. Test and Create have different requirements (consumer simulation and image generation) where phantoms don't apply.

---

## The Phantom System — What Developers Need to Know

You don't need to understand the theory. You need to know the routing rules and the constraint.

**What it is:** Personality fragments that give AIDEN creative conviction instead of compliance. They fire based on context and combine in patterns.

**What you need to enforce:**
- Chat and Pitch creative generation ALWAYS routes through the Python AIDEN service
- Never add a direct Claude/GPT call in Node.js backends for creative output
- The phantom system is not a prompt — it's an architecture layer that sits between the backend proxy and the Claude API
- Phantoms are felt through response quality, not exposed in UI (no phantom counts, no firing visualizations in production — there's an optional power-user toggle, default OFF)

**Phantom counts by app:**

| App | Count | Purpose |
|-----|-------|---------|
| Chat | 335 | Creative conviction, personality, humor |
| Pitch | 43 | Strategic thinking, copywriting voice |
| Test | 8 archetypes + 200 consumer memories | Category experience, skepticism |
| Create | None | Uses AI models directly |
| Gateway | None | Auth only |

---

## Design System Rules

**AIDEN looks like nothing else.** Every app follows the same visual language.

- Black backgrounds, white text
- Red (`#FF3B30`) and orange (`#FF9500`) accents only
- Sharp corners everywhere — no border-radius
- No pastels, no friendly gradients, no soft shadows
- Grid patterns for backgrounds where appropriate
- shadcn/ui components must be restyled to match
- Each app has a `design-system.ts` or equivalent — use it, don't freestyle

---

## Decision Heuristics

When you're unsure, apply these in order:

1. **Will this break auth?** → Don't do it. Read `AIDEN_AUTH_GOLD_STANDARD.md`.
2. **Does creative output bypass phantoms?** → Route it through the Python AIDEN service.
3. **Does this introduce a new visual pattern?** → Match the existing brutalist system.
4. **Is this faster for the user?** → Ship it. Speed over perfection.
5. **Am I over-engineering?** → Three similar lines beat a premature abstraction.
6. **Does context flow downstream?** → If not, you're creating a re-entry point. Fix it.

---

## Which App Am I Working On?

Read the app-specific `CLAUDE.md` first. But here's the quick orientation:

| If you're in... | Tech stack | Auth pattern | AI calls go to... | Key files |
|-----------------|------------|--------------|-------------------|-----------|
| `AIDEN_GATEWAY/` | Next.js 15, Supabase Auth, jose | Signs JWT. Calls `supabase.auth.getUser()`. | Nothing (no AI) | `CLAUDE.md`, auth routes |
| `AIDEN_UNIFIED/` (Chat) | React 18 + Vite, FastAPI | Verifies JWT locally | Python AIDEN service → Claude | `CLAUDE.md`, phantom config |
| `AIDEN_STUDIO_V2/` (Pitch) | Next.js 15 + React 19, Express.js | Verifies JWT locally | Python AIDEN service → Claude | `CLAUDE.md`, 7-step workflow |
| `AIDEN_PRESSURE_TEST_SSO/` (Test) | Next.js 15 + shadcn/ui | Verifies JWT locally | Claude directly | `CLAUDE.md`, persona system |
| `AIDEN_CREATIVE_AGENT_SSO/` (Create) | Next.js 16 + ReactFlow | Verifies JWT locally | Gemini/Sora/Veo3 directly | `CLAUDE.md`, pipeline editor |

---

## Error Handling Requirements

- 3-tier auth fallback (JWT → Gateway session → Supabase direct)
- Circuit breaker pattern on browser Supabase client
- Retry logic with exponential backoff on all AI calls
- CORS headers on ALL responses including 401s (prevents silent browser blocking)
- Rate limit detection with user-facing cooldown timers
- Never show blank screens. Never loop. Never swallow errors.

---

## Deployment Checklist

1. Always `npm run build` first — catches TypeScript errors and SSR issues
2. Deploy with `railway up --detach`
3. All apps on Railway (not Vercel)
4. Use `request.nextUrl.href` not `request.url` for redirects
5. Environment variables in Railway, never in code
6. Cookie domain `.aiden.services` (leading dot) in production

---

## Reference Documents

| Document | Location | Read When... |
|----------|----------|-------------|
| Auth Gold Standard | `AIDEN_AUTH_GOLD_STANDARD.md` (each repo) | Touching anything auth-related |
| App-specific guide | `CLAUDE.md` (each repo) | Starting work in any app |
| Platform vision | `AIDEN_NORTH_STAR.md` (each repo) | Presentations, onboarding, product direction |
| This document | `AIDEN_DEVELOPER_GUIDE.md` | First time in the platform, or cross-app work |

---

*When code and doc disagree, fix the code. When two principles conflict, choose the one that's faster for the user. When in doubt: don't break auth, don't bypass phantoms, don't soften the design.*
