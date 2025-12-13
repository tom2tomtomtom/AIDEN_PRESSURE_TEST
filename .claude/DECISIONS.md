# Architecture Decisions

This document records architectural decisions to prevent re-litigation.

---

## ADR-001: Next.js App Router over Pages Router

**Date:** 2024-12-13
**Status:** Accepted
**Context:** Choosing between Next.js routing approaches
**Decision:** Use App Router (app/ directory)
**Rationale:**
- Server Components by default (better performance)
- Nested layouts for dashboard structure
- Streaming and Suspense for LLM responses
- Future-proof (Pages Router is legacy)
**Consequences:**
- Some libraries may not fully support RSC yet
- Team needs familiarity with RSC patterns

---

## ADR-002: Supabase over Custom Backend

**Date:** 2024-12-13
**Status:** Accepted
**Context:** Backend architecture for MVP
**Decision:** Use Supabase as primary backend
**Rationale:**
- Built-in auth with magic links
- Row Level Security for multi-tenancy
- Real-time subscriptions (future: live test progress)
- Rapid development velocity for 6-week build
**Consequences:**
- PostgreSQL-specific (acceptable)
- Vendor consideration for scale (manageable)

---

## ADR-003: Claude Sonnet 4 for Persona Generation

**Date:** 2024-12-13
**Status:** Accepted
**Context:** LLM selection for persona responses
**Decision:** Use Claude Sonnet 4 via Anthropic API
**Rationale:**
- Best balance of quality vs cost vs speed
- Strong instruction following for JSON output
- Consistent persona voice maintenance
- ~£0.40 per full test execution
**Consequences:**
- Single vendor dependency
- Rate limits require parallel request management

---

## ADR-004: Phantom Memory Architecture

**Date:** 2024-12-13
**Status:** Accepted
**Context:** How to make AI personas feel "experienced"
**Decision:** Pre-seeded memory banks with trigger-based retrieval
**Rationale:**
- Memories stored in DB, not generated on-the-fly
- Keyword matching + claim detection for relevance
- Trust modifiers create realistic skepticism variation
- Scalable across categories without prompt bloat
**Consequences:**
- Requires upfront memory authoring effort
- Memory quality directly impacts output quality

---

## ADR-005: Dual-Track Response Model

**Date:** 2024-12-13
**Status:** Accepted
**Context:** Capturing authentic vs performative consumer responses
**Decision:** Each persona provides 4 response tracks:
1. Gut reaction (immediate, unfiltered)
2. Considered view (post-rationalization)
3. Social response (what they'd say publicly)
4. Private thought (what they actually think)
**Rationale:**
- Mirrors real qual research insight layers
- Reveals say/do gap
- Provides richer strategic insight
**Consequences:**
- 4x response content per persona
- Slightly higher token usage

---

## ADR-006: Multi-Tenant via Organizations

**Date:** 2024-12-13
**Status:** Accepted
**Context:** Supporting multiple clients/teams
**Decision:** Organization-based multi-tenancy with RLS
**Rationale:**
- Clean data isolation at database level
- Supports future team features
- Simple permission model (owner/admin/member)
**Consequences:**
- New users auto-create personal org
- Invitation flow needed for teams

---

## ADR-007: Railway for Deployment

**Date:** 2024-12-13
**Status:** Accepted
**Context:** Hosting platform selection
**Decision:** Railway for production deployment
**Rationale:**
- Simple Next.js deployment
- Environment variable management
- Health checks and auto-restart
- Reasonable pricing for MVP stage
**Consequences:**
- Less configuration than Vercel for some features
- Sufficient for current scale

---

## Decision Index

| ID | Decision | Status |
|----|----------|--------|
| ADR-001 | App Router over Pages | Accepted |
| ADR-002 | Supabase Backend | Accepted |
| ADR-003 | Claude Sonnet 4 | Accepted |
| ADR-004 | Phantom Memory Architecture | Accepted |
| ADR-005 | Dual-Track Responses | Accepted |
| ADR-006 | Organization Multi-Tenancy | Accepted |
| ADR-007 | Railway Deployment | Accepted |
