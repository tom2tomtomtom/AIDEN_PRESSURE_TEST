import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Gateway URL for SSO
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "https://aiden.services";

// How long to cache auth verification (in seconds)
const AUTH_CACHE_TTL = 30;

// Cookie domain: share across all *.aiden.services subdomains in production
const COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aiden.services" : undefined;

// Clear all auth-related cookies on both bare hostname and .aiden.services domain
function clearAllAuthCookies(request: NextRequest, response: NextResponse) {
  // Clear aiden-specific cookies
  for (const name of ["aiden-auth-ts", "aiden-session-type"]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
    if (COOKIE_DOMAIN) {
      response.cookies.set(name, "", { domain: COOKIE_DOMAIN, path: "/", maxAge: 0 });
    }
  }

  // Clear all sb-* Supabase cookies (on both domains to handle duplicates)
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
      if (COOKIE_DOMAIN) {
        response.cookies.set(cookie.name, "", { domain: COOKIE_DOMAIN, path: "/", maxAge: 0 });
      }
    }
  }
}

// Get the public URL from forwarded headers (for reverse proxy support like Railway)
function getPublicUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`;
  }

  // Fallback to nextUrl.href
  return request.nextUrl.href;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Define public routes that don't require authentication
  // IMPORTANT: Check this BEFORE creating Supabase client to avoid errors when env vars are missing
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/callback") ||
    request.nextUrl.pathname.startsWith("/error") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/";

  // For public routes, skip Supabase auth entirely
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Check if Supabase env vars are available before creating client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[PPT Middleware] Supabase env vars not available");
    const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(request.nextUrl.href)}`;
    return NextResponse.redirect(gatewayLoginUrl);
  }

  // Check if we have a recent auth verification to skip redundant getUser() calls
  const authTimestamp = request.cookies.get('aiden-auth-ts')?.value;
  const hasSessionCookies = request.cookies.getAll().some(c => c.name.startsWith('sb-'));

  if (authTimestamp && hasSessionCookies) {
    const lastVerified = parseInt(authTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - lastVerified < AUTH_CACHE_TTL) {
      // Recently verified, skip getUser() API call
      // Set header so downstream Server Components / API routes know auth is verified
      const headers = new Headers(request.headers);
      headers.set('x-middleware-auth-verified', '1');
      return NextResponse.next({
        request: { headers },
      });
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            // Cross-subdomain SSO enabled via .aiden.services domain
            supabaseResponse.cookies.set(name, value, {
              ...options,
              domain: COOKIE_DOMAIN,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser() instead of getSession() for security
  // getSession() reads from storage which could be tampered with
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // Rate limited - redirect to gateway login with rate_limited flag
      // DON'T clear cookies - that forces re-auth which makes it worse
      if (error.code === 'over_request_rate_limit' || error.status === 429) {
        console.log('[PPT Middleware] Auth rate limited, backing off:', error.code);
        const nextPath = request.nextUrl.pathname + request.nextUrl.search;
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('rate_limited', '1');
        loginUrl.searchParams.set('redirect', nextPath);
        return NextResponse.redirect(loginUrl);
      }

      // Refresh token issues - clear ALL cookies and redirect to gateway
      if (error.code === 'refresh_token_already_used' || error.status === 400) {
        console.log('[PPT Middleware] Auth error, clearing ALL auth cookies:', error.code);
        const publicUrl = getPublicUrl(request);
        const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(publicUrl)}&auth_error=session_expired`;
        const response = NextResponse.redirect(gatewayLoginUrl);
        clearAllAuthCookies(request, response);
        return response;
      }
    }
    user = data.user;
  } catch (err) {
    console.error('[PPT Middleware] Unexpected auth error:', err);
    const publicUrl = getPublicUrl(request);
    const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(publicUrl)}`;
    return NextResponse.redirect(gatewayLoginUrl);
  }

  // Redirect unauthenticated users to Gateway for SSO
  if (!user) {
    const publicUrl = getPublicUrl(request);
    const gatewayLoginUrl = `${GATEWAY_URL}/login?next=${encodeURIComponent(publicUrl)}`;
    const response = NextResponse.redirect(gatewayLoginUrl);
    // Clear stale cookies to prevent Gateway auto-redirect loop
    clearAllAuthCookies(request, response);
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Auth verified successfully - set cache timestamp to reduce future API calls
  const now = Math.floor(Date.now() / 1000).toString();
  supabaseResponse.cookies.set('aiden-auth-ts', now, {
    domain: COOKIE_DOMAIN,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_CACHE_TTL,
    httpOnly: true,
  });

  // Tell downstream Server Components / API routes that middleware already verified auth
  // This prevents a second getUser() call which would race on the refresh token
  supabaseResponse.headers.set('x-middleware-auth-verified', '1');
  supabaseResponse.headers.set('x-middleware-user-id', user.id);

  return supabaseResponse;
}
