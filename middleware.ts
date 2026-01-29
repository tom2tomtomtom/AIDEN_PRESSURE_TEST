import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://aiden.services'
const TOKEN_COOKIE = 'aiden_session'

export function middleware(request: NextRequest) {
  // Check for token in URL (from gateway redirect)
  const token = request.nextUrl.searchParams.get('studio_token') ||
                request.nextUrl.searchParams.get('access_token')

  if (token) {
    // Store token in cookie and clean URL
    const response = NextResponse.redirect(new URL(request.nextUrl.pathname, request.url))
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
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/callback') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/'

  // If no token and not public route, redirect to gateway
  if (!sessionToken && !isPublicRoute) {
    const returnUrl = request.nextUrl.href
    return NextResponse.redirect(`${GATEWAY_URL}/login?next=${encodeURIComponent(returnUrl)}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
