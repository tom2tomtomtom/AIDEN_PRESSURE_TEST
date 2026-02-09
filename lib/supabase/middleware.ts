import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyGatewayJWT, GW_COOKIE_NAME } from '@/lib/gateway-jwt'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.aiden.services' : undefined

function getPublicUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`
  }
  return request.nextUrl.href
}

async function refreshFromGateway(request: NextRequest): Promise<{ userId: string; email: string; response: NextResponse } | null> {
  try {
    const cookieHeader = request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-'))
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const res = await fetch(`${GATEWAY_URL}/api/auth/session`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    })
    if (!res.ok) return null

    const data = await res.json()
    const response = NextResponse.next({ request })

    if (data.jwt) {
      response.cookies.set(GW_COOKIE_NAME, data.jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: COOKIE_DOMAIN,
        path: '/',
        sameSite: 'lax',
        maxAge: 30 * 60,
      })
    }

    if (data.cookies) {
      for (const { name, value, options } of data.cookies) {
        response.cookies.set(name, value, {
          ...options,
          domain: COOKIE_DOMAIN,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }
    }

    return { userId: data.user.id, email: data.user.email, response }
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  // Public routes — skip auth
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/callback') ||
    request.nextUrl.pathname.startsWith('/error') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/'

  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(request.nextUrl.href)}`
    return NextResponse.redirect(gatewayLoginUrl)
  }

  // 1. Check Gateway JWT
  const gwToken = request.cookies.get(GW_COOKIE_NAME)?.value
  if (gwToken) {
    const payload = await verifyGatewayJWT(gwToken)
    if (payload) {
      const response = NextResponse.next({ request })
      response.headers.set('x-middleware-auth-verified', '1')
      response.headers.set('x-middleware-user-id', payload.sub)
      response.headers.set('x-middleware-user-email', payload.email)
      return response
    }
  }

  // 2. Refresh from Gateway
  const refreshResult = await refreshFromGateway(request)
  if (refreshResult) {
    refreshResult.response.headers.set('x-middleware-auth-verified', '1')
    refreshResult.response.headers.set('x-middleware-user-id', refreshResult.userId)
    refreshResult.response.headers.set('x-middleware-user-email', refreshResult.email)
    return refreshResult.response
  }

  // 3. Fallback: direct Supabase
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              domain: COOKIE_DOMAIN,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          )
        },
      },
    }
  )

  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data.user) {
      supabaseResponse.headers.set('x-middleware-auth-verified', '1')
      supabaseResponse.headers.set('x-middleware-user-id', data.user.id)
      return supabaseResponse
    }
  } catch {}

  const publicUrl = getPublicUrl(request)
  const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(publicUrl)}`
  return NextResponse.redirect(gatewayLoginUrl)
}
