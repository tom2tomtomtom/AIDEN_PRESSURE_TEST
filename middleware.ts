import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://aiden.services'

// Get the public URL from forwarded headers (for reverse proxy support like Railway)
function getPublicUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`
  }
  return request.nextUrl.href
}

export async function middleware(request: NextRequest) {
  // Check for SSO tokens in URL (from Gateway redirect)
  const accessToken = request.nextUrl.searchParams.get('studio_token')
  const refreshToken = request.nextUrl.searchParams.get('refresh_token')

  // SSO Token Flow: Convert URL tokens into Supabase session
  if (accessToken) {
    const cleanUrl = new URL(request.nextUrl.pathname, request.url)
    let response = NextResponse.redirect(cleanUrl)

    // Create Supabase client with cookie handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // CRITICAL: Set the session from SSO tokens
    // This creates proper Supabase auth cookies
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })

    if (error) {
      console.error('[SSO] setSession failed:', error.message)
    }

    return response
  }

  // Normal request flow: validate existing session
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Validate user (also refreshes tokens if needed)
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes that don't require auth
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/callback') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/'

  // No user and not public → redirect to Gateway login
  if (!user && !isPublicRoute) {
    const returnUrl = getPublicUrl(request)
    return NextResponse.redirect(
      `${GATEWAY_URL}/login?next=${encodeURIComponent(returnUrl)}`
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
