import { createClient } from '@supabase/supabase-js'

// PPT schema name for this project's tables
export const PPT_SCHEMA = 'ppt'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: PPT_SCHEMA,
      },
    }
  )
}

// Admin client for auth operations (uses public schema)
export function createAdminAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
