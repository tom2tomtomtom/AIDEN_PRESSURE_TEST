# CLAUDE.md - Phantom Pressure Test

> AI Development Guidance Document
> Last Updated: 2024-12-13
> Version: 1.0.0

## Project Overview

**Phantom Pressure Test** is a synthetic qualitative research tool that uses AI-powered consumer personas with accumulated category experiences ("phantom memories") to pressure-test marketing concepts before human research.

**Core Innovation:** Phantom Consumer Memory™ - personas carry experiential histories that shape their skepticism, trust levels, and response patterns.

## Quick Reference

```
Tech Stack:        Next.js 15 (App Router) + Supabase + Claude API + Railway
Primary Language:  TypeScript (strict mode)
Database:          PostgreSQL via Supabase
Auth:              Supabase Auth (magic links)
LLM:               Claude Sonnet 4 via Anthropic API
Deployment:        Railway
Styling:           Tailwind CSS + shadcn/ui
```

## Directory Structure

```
phantom-pressure-test/
├── CLAUDE.md                    # This file - AI development guidance
├── PROGRESS.md                  # Sprint progress tracking
├── blueprints/                  # Component blueprints
│   ├── 01-database.md
│   ├── 02-auth.md
│   ├── 03-persona-engine.md
│   ├── 04-test-execution.md
│   ├── 05-results-analysis.md
│   └── 06-frontend.md
├── docs/
│   ├── API.md                   # API documentation
│   ├── PROMPTS.md               # LLM prompt templates
│   └── DEPLOYMENT.md            # Deployment guide
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, register)
│   ├── (dashboard)/             # Protected dashboard routes
│   └── api/                     # API route handlers
├── lib/                         # Shared utilities
│   ├── supabase/               # Supabase client + helpers
│   ├── anthropic/              # Claude API integration
│   ├── prompts/                # Prompt templates
│   └── utils/                  # General utilities
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── forms/                  # Form components
│   ├── results/                # Results display components
│   └── layout/                 # Layout components
├── types/                       # TypeScript types
│   ├── database.ts             # Supabase generated types
│   ├── api.ts                  # API request/response types
│   └── domain.ts               # Domain model types
└── supabase/
    ├── migrations/             # Database migrations
    └── seed/                   # Seed data scripts
```

## Critical Patterns

### 1. Naming Conventions

```typescript
// Database (snake_case)
pressure_tests, persona_archetypes, phantom_memories
created_at, user_id, test_result_id

// TypeScript (camelCase for variables, PascalCase for types)
const pressureTest: PressureTest = ...
interface PersonaArchetype { ... }
type TestStatus = 'draft' | 'running' | 'completed' | 'failed'

// API Routes (kebab-case)
/api/pressure-tests
/api/pressure-tests/[testId]/run
/api/persona-archetypes

// Components (PascalCase)
PressureScoreCard, PersonaResponseCard, TestCreationWizard

// Files (kebab-case)
pressure-score-card.tsx, test-creation-wizard.tsx
```

### 2. API Response Format

```typescript
// Success (single resource)
{
  data: { id: string, ...attributes },
  meta?: { timestamp: string }
}

// Success (collection)
{
  data: Array<Resource>,
  meta: { total: number, page: number, perPage: number },
  links?: { self: string, next?: string, prev?: string }
}

// Error
{
  error: {
    code: string,        // Machine-readable: 'VALIDATION_ERROR'
    message: string,     // Human-readable
    details?: Array<{ field: string, message: string }>
  }
}
```

### 3. Error Handling

```typescript
// API routes must use try-catch with standardized errors
export async function POST(req: NextRequest) {
  try {
    // ... logic
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[API_NAME]', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json({
        error: { code: 'VALIDATION_ERROR', message: error.message, details: error.details }
      }, { status: 422 })
    }
    
    return NextResponse.json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
    }, { status: 500 })
  }
}
```

### 4. Supabase Client Usage

```typescript
// Server Components - use createServerComponentClient
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase.from('table').select()
}

// Route Handlers - use createRouteHandlerClient
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
}

// Client Components - use createClientComponentClient
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Component() {
  const supabase = createClientComponentClient()
}
```

### 5. LLM Prompt Pattern

```typescript
// All prompts follow this structure
interface PromptContext {
  role: string           // Who the LLM should act as
  context: object        // Background information
  task: string           // What to do
  constraints: string[]  // What NOT to do
  format: object         // Expected output schema
}

// Temperature guidelines for this project
const TEMPERATURES = {
  personaResponse: 0.7,      // Creative but consistent
  groupDynamics: 0.6,        // Moderate variation
  aggregatedAnalysis: 0.3,   // More deterministic
  jsonExtraction: 0.2        // Very deterministic
}
```

## State Management

### Test Execution States

```
draft → running → completed
              ↘ failed
```

**State Transitions:**
- `draft` → `running`: When `/api/tests/[testId]/run` is called
- `running` → `completed`: When all personas respond and analysis completes
- `running` → `failed`: On any unrecoverable error

### Database Transactions

```typescript
// Use Supabase RPC for atomic operations
const { data, error } = await supabase.rpc('execute_pressure_test', {
  test_id: testId,
  panel_config: config
})

// Or handle in application with proper error recovery
async function executeTest(testId: string) {
  // 1. Update status to running
  await supabase.from('pressure_tests')
    .update({ status: 'running', started_at: new Date() })
    .eq('id', testId)
  
  try {
    // 2. Execute test logic
    const results = await runTestLogic(testId)
    
    // 3. Store results
    await supabase.from('test_results').insert(results)
    
    // 4. Update status to completed
    await supabase.from('pressure_tests')
      .update({ status: 'completed', completed_at: new Date() })
      .eq('id', testId)
      
  } catch (error) {
    // Rollback: mark as failed
    await supabase.from('pressure_tests')
      .update({ status: 'failed' })
      .eq('id', testId)
    throw error
  }
}
```

## Common Tasks

### Adding a New Persona Archetype

1. Add to `supabase/seed/persona-archetypes.sql`
2. Create phantom memories in `supabase/seed/phantom-memories.sql`
3. Run migration: `supabase db push`
4. Update types: `supabase gen types typescript --project-id <id> > types/database.ts`

### Adding a New Category

1. Add category to `projects.category` enum in migration
2. Create memory bank: `INSERT INTO memory_banks (name, category, ...) VALUES (...)`
3. Seed phantom memories for each archetype in new category
4. Update category constants in `lib/constants.ts`

### Creating a New API Route

1. Create file: `app/api/[resource]/route.ts`
2. Implement with auth check, validation, error handling
3. Add types to `types/api.ts`
4. Update API documentation in `docs/API.md`

### Adding a New Component

1. Create file: `components/[category]/[component-name].tsx`
2. Use existing UI primitives from `components/ui/`
3. Add to barrel export if needed
4. Include loading and error states

## Testing Strategy

```typescript
// Unit tests: lib/ and utils/
// Location: __tests__/unit/

// Integration tests: API routes
// Location: __tests__/integration/

// E2E tests: Critical flows
// Location: e2e/

// Critical paths to test:
// 1. Auth flow (login, register, session refresh)
// 2. Test creation wizard
// 3. Test execution (mock LLM responses)
// 4. Results display
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Performance Budgets

```
Initial Load:        < 2s (LCP)
Test Execution:      < 60s (6 personas + analysis)
API Response:        < 200ms (non-LLM endpoints)
Bundle Size:         < 200KB (initial JS)
```

## Security Checklist

- [ ] All API routes check auth via `supabase.auth.getSession()`
- [ ] RLS enabled on all tables with appropriate policies
- [ ] Service role key only used server-side
- [ ] User input validated with Zod before processing
- [ ] LLM prompts sanitize user input to prevent injection
- [ ] Rate limiting on expensive endpoints (/api/tests/run)

## Current Sprint

See `PROGRESS.md` for detailed sprint tracking.

## Troubleshooting

### "RLS policy violation"
- Check user is authenticated
- Verify organization membership
- Review RLS policies in Supabase dashboard

### "LLM response parsing failed"
- Check prompt explicitly requests JSON
- Verify temperature setting (lower = more predictable)
- Add retry logic with exponential backoff

### "Test stuck in 'running' state"
- Check API logs for errors
- Verify Anthropic API key valid
- May need manual status reset via Supabase dashboard

## Contact

Project Owner: Tom Hyde
Repository: https://github.com/tom2tomtomtom/AIDEN_PRESSURE_TEST
