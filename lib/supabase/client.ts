import { createBrowserClient } from '@supabase/ssr'

// PPT schema name for this project's tables
export const PPT_SCHEMA = 'ppt'

// Cookie options for cross-subdomain SSO across .aiden.services
const COOKIE_OPTIONS = {
  domain: '.aiden.services',
  path: '/',
  sameSite: 'lax' as const,
  secure: true,
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: PPT_SCHEMA,
      },
      cookieOptions: COOKIE_OPTIONS,
    }
  )
}

// Create a client for auth operations (uses public schema)
export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: COOKIE_OPTIONS,
    }
  )
}

