# CLAUDE.md - Project Intelligence

## MANDATORY: Read Before ANY Action

Before writing ANY code, you MUST:
1. Read `.claude/STATUS.md` - Know current state
2. Read `.claude/BLUEPRINT.md` - Understand architecture
3. Read `.claude/PATTERNS.md` - Use approved patterns
4. Check relevant task file in `.claude/tasks/`

## Project Identity

**Name:** Phantom Pressure Test
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
| Auth | Supabase Auth (Magic Links) | - |
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
**Active Task File:** `.claude/tasks/phase-3-execution.md`
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
