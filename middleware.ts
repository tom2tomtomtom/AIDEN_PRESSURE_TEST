import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://aiden.services'
const TOKEN_COOKIE = 'aiden_session'

// Get the public URL from forwarded headers (for reverse proxy support like Railway)
function getPublicUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`
  }

  return request.nextUrl.href
}

export function middleware(request: NextRequest) {
  // Check for token in URL (from gateway redirect)
  const token = request.nextUrl.searchParams.get('studio_token') ||
                request.nextUrl.searchParams.get('access_token')

  if (token) {
    // Store token in cookie and clean URL
    const cleanUrl = new URL(request.nextUrl.pathname, request.url)
    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  }

  // Check for existing session cookie
  const sessionToken = request.cookies.get(TOKEN_COOKIE)?.value

  // Public routes
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/callback') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/'

  // If no token and not public route, redirect to gateway
  if (!sessionToken && !isPublicRoute) {
    const returnUrl = getPublicUrl(request)
    return NextResponse.redirect(`${GATEWAY_URL}/login?next=${encodeURIComponent(returnUrl)}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
