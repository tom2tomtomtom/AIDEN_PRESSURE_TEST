import { createBrowserClient } from '@supabase/ssr'

// PPT schema name for this project's tables
export const PPT_SCHEMA = 'ppt'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: PPT_SCHEMA,
      },
    }
  )
}

// Create a client for auth operations (uses public schema)
export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
