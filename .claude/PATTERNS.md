# Approved Code Patterns

**Rule: Copy these patterns exactly. Do not invent alternatives.**

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Database tables | snake_case | `pressure_tests`, `phantom_memories` |
| Database columns | snake_case | `created_at`, `user_id` |
| TypeScript variables | camelCase | `pressureTest`, `userId` |
| TypeScript types | PascalCase | `PressureTest`, `PersonaArchetype` |
| React components | PascalCase | `ProjectCard`, `TestWizard` |
| Component files | kebab-case | `project-card.tsx`, `test-wizard.tsx` |
| API routes | kebab-case | `/api/pressure-tests`, `/api/test-results` |
| CSS classes | kebab-case | `test-card`, `pressure-score` |
| Env variables | SCREAMING_SNAKE | `SUPABASE_URL`, `ANTHROPIC_API_KEY` |

## Supabase Patterns

### Server Client (Server Components, Route Handlers)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

### Browser Client (Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Service Role Client (API Routes needing admin)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

## Component Patterns

### Server Component (Default)

```tsx
// components/features/project-list.tsx
import { createClient } from '@/lib/supabase/server'

export async function ProjectList() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return <ErrorState message={error.message} />
  }
  
  if (!projects?.length) {
    return <EmptyState message="No projects yet" />
  }
  
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </ul>
  )
}
```

### Client Component (Interactive)

```tsx
// components/features/project-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProjectFormProps {
  initialData?: Project
  mode: 'create' | 'edit'
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      if (mode === 'create') {
        const { error } = await supabase
          .from('projects')
          .insert({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
          })
        
        if (error) throw error
      }
      
      router.push('/projects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}
      {/* form fields */}
    </form>
  )
}
```

## API Route Patterns

### Standard API Response Format

```typescript
// Success (single resource)
{ data: { id: string, ...attributes }, meta?: { timestamp: string } }

// Success (collection)
{ data: [...items], meta: { total: number, page: number } }

// Error
{ error: { code: string, message: string, details?: object } }
```

### API Route Handler

```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate
    if (!body.name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

## LLM Prompt Patterns

### Temperature Guidelines

| Task | Temperature | Reason |
|------|-------------|--------|
| Persona responses | 0.7 | Creative, varied voices |
| Group dynamics | 0.6 | Semi-structured simulation |
| JSON extraction | 0.3 | Consistent formatting |
| Analysis/scoring | 0.3 | Reliable outputs |

### Prompt Structure

```typescript
const personaPrompt = `
## Your Identity
You are ${persona.name}, a ${persona.archetype.name}.
${persona.demographics}
${persona.psychographics}

## Your Accumulated Experiences
${memoryNarrative}

## Your Current Skepticism Level
${skepticismLevel}/10 - ${skepticismDescription}

## The Stimulus
${stimulus}

## Your Task
Respond with your authentic reactions...

## Response Format (JSON)
{
  "gut_reaction": "...",
  "considered_view": "...",
  "social_response": "...",
  "private_thought": "...",
  "purchase_intent": 1-10,
  "triggered_memories": ["memory_id_1", "memory_id_2"]
}
`
```

## File Organization

```
# Component files
components/features/[feature-name].tsx    # Feature component
components/ui/[component-name].tsx        # Base UI component

# Utility files  
lib/utils/[util-name].ts                  # Utility function
lib/hooks/use-[hook-name].ts              # Custom hook

# Type files
types/[entity].ts                         # Entity types
types/api.ts                              # API types
types/database.ts                         # Generated DB types
```

## Testing Patterns

```typescript
// Unit test
describe('memoryRetrieval', () => {
  it('should return relevant memories for keywords', async () => {
    const memories = await retrieveMemories('natural yoghurt', archetypeId)
    expect(memories.length).toBeGreaterThan(0)
    expect(memories[0].relevanceScore).toBeGreaterThan(0.5)
  })
})
```
