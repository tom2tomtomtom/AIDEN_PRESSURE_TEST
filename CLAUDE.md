# CLAUDE.md - Project Intelligence

**See [`AIDEN_DEVELOPER_GUIDE.md`](./AIDEN_DEVELOPER_GUIDE.md)** — platform rules, architecture, and "never do this" list for Claude Code sessions.
**See [`AIDEN_NORTH_STAR.md`](./AIDEN_NORTH_STAR.md)** — full platform vision for presentations and onboarding.

## Auth Architecture

**See [`AIDEN_AUTH_GOLD_STANDARD.md`](./AIDEN_AUTH_GOLD_STANDARD.md)** for the definitive cross-platform auth reference. This app is "Pressure Test" in that doc. Key points for this app:
- 2-tier auth in `lib/supabase/middleware.ts` (Gateway JWT → Gateway session refresh → redirect to login)
- JWT verification in `lib/gateway-jwt.ts`
- Auth helpers in `lib/auth.ts` with direct JWT fallback
- Logout redirects to Gateway: `${GATEWAY_URL}/auth/logout`
- `GATEWAY_URL` must be `https://www.aiden.services` (never bare domain)

---

## MANDATORY: Read Before ANY Action

Before writing ANY code, you MUST:
1. Read `.claude/STATUS.md` - Know current state
2. Read `.claude/BLUEPRINT.md` - Understand architecture
3. Read `.claude/PATTERNS.md` - Use approved patterns
4. Check relevant task file in `.claude/tasks/`

## Project Identity

**Name:** AIDEN's Focus Group
**Type:** Full-stack SaaS - Synthetic Qualitative Research Tool
**Stage:** Foundation
**Core Innovation:** Phantom Consumer Memory™ - AI personas with accumulated category experiences

## Tech Stack (Quick Reference)

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 15.x |
| Styling | Tailwind CSS + shadcn/ui | 3.4.x |
| Backend | Supabase | 2.x |
| Database | PostgreSQL | 15 |
| Auth | Supabase Auth (Email/Password) | - |
| LLM | Claude Sonnet 4 | - |
| Deployment | Railway | - |

For complete stack details: `.claude/STACK.md`

## Critical Rules

### NEVER Do Without Checking
- [ ] Create new files without checking BLUEPRINT.md for location
- [ ] Add dependencies without checking STACK.md for approved versions
- [ ] Implement features without checking task files for requirements
- [ ] Change patterns without checking PATTERNS.md

### ALWAYS Do
- [ ] Update STATUS.md after completing any task
- [ ] Follow naming conventions in PATTERNS.md
- [ ] Use approved code patterns - copy, don't invent
- [ ] Mark task checkboxes when complete

## Current Focus

**Active Phase:** Phase 3 - Test Execution
**Active Task File:** `.claude/tasks/phase-3-features.md`
**Blockers:** None

## Session Startup Checklist

When starting ANY session:
```
1. Read STATUS.md → Know where we are
2. Read active task file → Know what's next
3. Check DECISIONS.md if architectural questions arise
4. Use PATTERNS.md for all implementations
```

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run typecheck        # TypeScript check

# Database
supabase start           # Local Supabase
supabase db push         # Push migrations
npm run db:generate-types # Generate TS types

# Testing
npm test                 # Run tests
```

## Documentation Updates

After completing work:
1. Update STATUS.md with completed items
2. Check off completed tasks in task files
3. Add any new decisions to DECISIONS.md
4. Add any new patterns to PATTERNS.md
