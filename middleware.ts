import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple pass-through middleware
// Auth is handled client-side via useAuth hook (SSO tokens from URL params)
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
