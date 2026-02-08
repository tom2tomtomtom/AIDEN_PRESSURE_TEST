import { createBrowserClient } from '@supabase/ssr'

export const PPT_SCHEMA = 'ppt'

let pptClient: ReturnType<typeof createBrowserClient> | null = null
let authClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (pptClient) return pptClient

  pptClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: PPT_SCHEMA },
      auth: { autoRefreshToken: false },
    }
  )

  return pptClient
}

export function createAuthClient() {
  if (authClient) return authClient

  authClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false },
    }
  )

  return authClient
}
