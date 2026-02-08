import { createBrowserClient } from '@supabase/ssr'

// PPT schema name for this project's tables
export const PPT_SCHEMA = 'ppt'

// Gateway URL for redirect on persistent auth failure
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://aiden.services'

// Singleton pattern
let pptClient: ReturnType<typeof createBrowserClient> | null = null
let authClient: ReturnType<typeof createBrowserClient> | null = null

// Circuit breaker: prevent infinite token refresh loop on 429
let rateLimitedUntil = 0
const RATE_LIMIT_BACKOFF_MS = 60_000

// Circuit breaker: prevent infinite token refresh loop on 400
let authErrorUntil = 0
const AUTH_ERROR_BACKOFF_MS = 30_000

let tokenRefreshFailCount = 0
const TOKEN_REFRESH_FAIL_THRESHOLD = 2

let redirecting = false

// Shared circuit breaker fetch for both clients
function createCircuitBreakerFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

    if (Date.now() < rateLimitedUntil && url.includes('/auth/v1/token')) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'Backing off' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (Date.now() < authErrorUntil && url.includes('/auth/v1/token')) {
      return new Response(JSON.stringify({ error: 'auth_error', message: 'Token refresh blocked — session expired' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch(input, init)

    if (response.status === 429 && url.includes('/auth/v1/')) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS
      console.warn('[PPT Supabase Client] Auth rate limited — backing off 60s')
    }

    if (response.status === 400 && url.includes('/auth/v1/token')) {
      tokenRefreshFailCount++
      console.warn(`[PPT Supabase Client] Token refresh failed (400) — count: ${tokenRefreshFailCount}`)

      if (tokenRefreshFailCount >= TOKEN_REFRESH_FAIL_THRESHOLD) {
        authErrorUntil = Date.now() + AUTH_ERROR_BACKOFF_MS
        console.warn('[PPT Supabase Client] Session expired — circuit breaker active')

        if (!redirecting && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          redirecting = true
          const currentUrl = window.location.href
          window.location.href = `${GATEWAY_URL}/login?next=${encodeURIComponent(currentUrl)}&session_expired=1`
        }
      }
    }

    if (response.ok && url.includes('/auth/v1/token')) {
      tokenRefreshFailCount = 0
      rateLimitedUntil = 0
      authErrorUntil = 0
      redirecting = false
    }

    return response
  }
}

export function createClient() {
  if (pptClient) return pptClient

  pptClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: PPT_SCHEMA,
      },
      global: {
        fetch: createCircuitBreakerFetch(),
      },
    }
  )

  return pptClient
}

// Create a client for auth operations (uses public schema)
export function createAuthClient() {
  if (authClient) return authClient

  authClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createCircuitBreakerFetch(),
      },
    }
  )

  return authClient
}
