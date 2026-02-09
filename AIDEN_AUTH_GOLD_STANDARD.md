# AIDEN Platform — Auth Gold Standard

**Last Updated:** February 2026
**Status:** Definitive reference for all AIDEN platform authentication
**Scope:** 5 apps — Gateway, Creative Agent, Pressure Test, Studio V2 (Pitch), Chat/Unified

---

## 1. Architecture Overview

### Single Auth Authority

The **AIDEN Gateway** (`www.aiden.services`) is the sole authentication authority. It is the only app that touches Supabase Auth directly for login, registration, and session management. All other apps verify identity via a Gateway-signed JWT cookie.

```
                        ┌─────────────────────────┐
                        │   AIDEN Gateway          │
                        │   www.aiden.services     │
                        │                          │
                        │   - Supabase Auth owner  │
                        │   - Signs aiden-gw JWT   │
                        │   - /api/auth/session    │
                        │   - /auth/logout         │
                        └────────────┬────────────┘
                                     │
                          aiden-gw cookie
                         (.aiden.services)
                                     │
              ┌──────────┬───────────┼───────────┬──────────┐
              │          │           │           │          │
         Creative    Pressure    Studio V2    Chat      (Future
          Agent       Test       (Pitch)    (Unified)    Apps)
         creative.   test.      pitch.      chat.
```

### 3-Tier Auth Flow (Next.js Apps)

Every protected request goes through this cascade in middleware:

```
Request arrives
    │
    ├─ Tier 1: Verify aiden-gw JWT locally (~2ms)
    │   └─ Uses JWT_SECRET (HS256) — NO network call
    │   └─ If valid → pass through, set request headers
    │
    ├─ Tier 2: Refresh from Gateway
    │   └─ POST www.aiden.services/api/auth/session
    │   └─ Forwards sb-* cookies from request
    │   └─ Gateway returns { user, jwt, cookies }
    │   └─ Sets fresh aiden-gw cookie (30min)
    │
    ├─ Tier 3: Direct Supabase getUser() (Phase 2 safety net)
    │   └─ Uses sb-* cookies directly
    │   └─ TEMPORARY — remove after 2 weeks stable
    │
    └─ All failed → Redirect to Gateway login
        └─ ${GATEWAY_URL}/login?next=${encodeURIComponent(currentUrl)}
```

### Vite SPA Flow (Chat/Unified)

Chat is a Vite SPA, not Next.js. It cannot run middleware. Instead:

```
App mounts
    │
    ├─ POST ${GATEWAY_URL}/api/auth/session (credentials: include)
    │   └─ Gateway reads aiden-gw cookie → returns user JSON
    │
    ├─ Success → render app, store user in Zustand
    │
    └─ Failure → redirect to ${GATEWAY_URL}/login?next=${APP_URL}
```

---

## 2. Cookie Specification

### Required Cookies

| Cookie | Domain | HttpOnly | Secure | SameSite | MaxAge | Set By | Purpose |
|--------|--------|----------|--------|----------|--------|--------|---------|
| `aiden-gw` | `.aiden.services` | Yes | Yes (prod) | lax | 30 min | Gateway | Gateway-signed JWT (HS256) |
| `sb-*` (multiple) | `.aiden.services` | Yes | Yes (prod) | lax | session | Supabase | Supabase session tokens |

### Legacy Cookies (Being Phased Out)

| Cookie | Status | Notes |
|--------|--------|-------|
| `aiden-auth-ts` | Active on Gateway only | 30-second auth cache timestamp. Optimization. |
| `aiden-session` | DEAD | Was used by old Studio V2 root app. Remove all references. |
| `aiden_session` | DEAD | Variant spelling. Remove all references. |
| `aiden-session-type` | DEAD | Legacy. Cleared on logout for safety. |

### Cookie Domain Rules

- **Production:** Always `.aiden.services` (leading dot, covers all subdomains)
- **Development:** `undefined` (localhost, no domain restriction)
- **NEVER** set cookies on bare `aiden.services` without the leading dot

```typescript
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.aiden.services' : undefined
```

---

## 3. JWT Specification

### Gateway JWT (`aiden-gw`)

| Field | Value | Notes |
|-------|-------|-------|
| Algorithm | HS256 | HMAC-SHA256 via `jose` library |
| Secret | `JWT_SECRET` env var | Must be identical across ALL 5 apps |
| Issuer | `aiden-gateway` | Hardcoded, verified on decode |
| Expiration | 30 minutes | Set via `setExpirationTime('30m')` |
| Claims | `{ sub, email, iss, iat, exp }` | `sub` = user ID, `email` = user email |

### Signing (Gateway Only)

```typescript
import { SignJWT } from 'jose'

const jwt = await new SignJWT({ sub: user.id, email: user.email })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setIssuer('aiden-gateway')
  .setExpirationTime('30m')
  .sign(new TextEncoder().encode(process.env.JWT_SECRET))
```

### Verification (All Apps)

```typescript
import { jwtVerify } from 'jose'

export async function verifyGatewayJWT(token: string): Promise<GatewayJWTPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: 'aiden-gateway',
    })
    if (!payload.sub || !payload.email) return null
    return payload as GatewayJWTPayload
  } catch {
    return null // Silent fail — triggers next auth tier
  }
}
```

---

## 4. Environment Variables

### Required Across ALL Apps

| Variable | Example | Notes |
|----------|---------|-------|
| `JWT_SECRET` | `a63EX74d/EDKOHt+...` | **MUST be identical** across all 5 apps. Base64 32-byte key. |
| `NEXT_PUBLIC_SUPABASE_URL` / `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Same Supabase project for all apps |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Public anon key |

### Required Per App

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GATEWAY_URL` / `VITE_GATEWAY_URL` | `https://www.aiden.services` | **ALWAYS use `www.`** — bare domain resolves to different server |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-side only, for admin operations |

### Critical Rule: `www.aiden.services` vs `aiden.services`

```
aiden.services      → 15.197.225.128 / 3.33.251.168  (NOT Railway, returns 404)
www.aiden.services  → Railway (r3mj5bzc.up.railway.app) (THE REAL GATEWAY)
```

**The bare domain `aiden.services` is NOT the Gateway.** It only has a basic redirect at `/` but returns 404 for all sub-routes like `/login`, `/api/auth/session`, etc. Every reference to the Gateway MUST use `www.aiden.services`.

**Default fallback in code MUST be `https://www.aiden.services`:**
```typescript
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'
```

**Railway env vars MUST be set to `https://www.aiden.services`** — `NEXT_PUBLIC_*` vars are baked into Next.js at build time. If Railway has the wrong value, the code fallback is never used.

---

## 5. Gold Standard: Next.js App Middleware

Every Next.js app (Creative, Pressure Test, Studio V2) MUST implement this middleware pattern.

### File: `middleware.ts` (root)

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### File: `lib/gateway-jwt.ts`

Standard JWT verification utility. Identical across all apps.

```typescript
import { jwtVerify, type JWTPayload } from 'jose'

export const GW_COOKIE_NAME = 'aiden-gw'

export interface GatewayJWTPayload extends JWTPayload {
  sub: string
  email: string
  iss: string
}

export async function verifyGatewayJWT(token: string): Promise<GatewayJWTPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: 'aiden-gateway',
    })
    if (!payload.sub || !payload.email) return null
    return payload as GatewayJWTPayload
  } catch {
    return null
  }
}
```

### File: `lib/supabase/middleware.ts`

3-tier auth with proper **request header** propagation:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyGatewayJWT, GW_COOKIE_NAME } from '@/lib/gateway-jwt'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.aiden.services' : undefined

// Helper: create response with auth info as REQUEST headers
// (not response headers — route handlers read request headers via headers())
function createAuthResponse(request: NextRequest, userId: string, email: string): NextResponse {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-auth-verified', '1')
  requestHeaders.set('x-middleware-user-id', userId)
  requestHeaders.set('x-middleware-user-email', email)
  return NextResponse.next({ request: { headers: requestHeaders } })
}
```

**Key rule: Use `request: { headers }` not `response.headers.set()`.**

Next.js middleware can set response headers OR request headers. Route handlers (API routes, Server Components) read **request headers** via `headers()`. If you set auth info on response headers, downstream code will never see it.

```typescript
// WRONG — route handlers can't see this
const response = NextResponse.next({ request })
response.headers.set('x-middleware-auth-verified', '1')

// CORRECT — route handlers see this via headers()
const requestHeaders = new Headers(request.headers)
requestHeaders.set('x-middleware-auth-verified', '1')
const response = NextResponse.next({ request: { headers: requestHeaders } })
```

### File: `lib/auth.ts`

Auth helpers for API routes. Checks middleware headers first, then Gateway JWT directly, then Supabase as last resort.

```typescript
import { cookies, headers } from 'next/headers'
import { verifyGatewayJWT, GW_COOKIE_NAME } from '@/lib/gateway-jwt'

// Direct JWT check — belt-and-suspenders for when middleware headers
// don't propagate (e.g., some Next.js versions or edge cases)
async function getUserFromGatewayJWT(): Promise<User | null> {
  const cookieStore = await cookies()
  const gwToken = cookieStore.get(GW_COOKIE_NAME)?.value
  if (!gwToken) return null
  const payload = await verifyGatewayJWT(gwToken)
  if (!payload) return null
  return { id: payload.sub, email: payload.email } as User
}

export async function getUser(): Promise<User | null> {
  // 1. Check middleware headers (fastest)
  const headerStore = await headers()
  if (headerStore.get('x-middleware-auth-verified') === '1') {
    // Try Supabase session first (has full user object)
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) return session.user

    // Construct from middleware headers
    const userId = headerStore.get('x-middleware-user-id')
    const userEmail = headerStore.get('x-middleware-user-email')
    if (userId && userEmail) return { id: userId, email: userEmail } as User
  }

  // 2. Direct JWT verification (handles header propagation edge cases)
  const gwUser = await getUserFromGatewayJWT()
  if (gwUser) return gwUser

  // 3. Direct Supabase (Phase 2 safety net)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## 6. Gold Standard: Logout

### Centralized Logout Route (Gateway)

**File:** `AIDEN_GATEWAY/app/auth/logout/route.ts`

This is the single source of truth for logout. It:
1. Calls `supabase.auth.signOut()`
2. Clears `aiden-gw` cookie
3. Clears `aiden-auth-ts` cookie
4. Clears all `sb-*` Supabase cookies
5. Redirects to `/login`

### Per-App Logout Pattern

Every app MUST redirect to the Gateway logout route. **Never** call `supabase.auth.signOut()` directly in non-Gateway apps.

```typescript
// CORRECT — all apps
window.location.href = `${GATEWAY_URL}/auth/logout`

// WRONG — only Gateway should do this
await supabase.auth.signOut()
```

### Per-App Logout Route (Optional)

Apps may have their own `/auth/logout` route that clears local cookies before redirecting to Gateway:

```typescript
// app/auth/logout/route.ts
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL(`${GATEWAY_URL}/auth/logout`))

  // Clear local cookies
  for (const name of ['aiden-gw', 'aiden-auth-ts', 'aiden-session-type']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 })
    if (COOKIE_DOMAIN) {
      response.cookies.set(name, '', { domain: COOKIE_DOMAIN, path: '/', maxAge: 0 })
    }
  }

  // Clear Supabase cookies
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', { path: '/', maxAge: 0 })
      if (COOKIE_DOMAIN) {
        response.cookies.set(cookie.name, '', { domain: COOKIE_DOMAIN, path: '/', maxAge: 0 })
      }
    }
  }

  return response
}
```

### Logout Button Component

```typescript
// CORRECT — simple redirect
export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = '/auth/logout' // local route that clears + redirects
    // OR directly: window.location.href = `${GATEWAY_URL}/auth/logout`
  }
  return <button onClick={handleLogout}>Sign Out</button>
}

// WRONG — client-side signOut
export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut() // WRONG: doesn't clear aiden-gw
    router.push('/login')         // WRONG: should redirect to Gateway
  }
}
```

---

## 7. Gold Standard: Gateway Session Endpoint

### `POST /api/auth/session`

This is the endpoint all apps call for Tier 2 auth refresh.

**Request:**
- Method: POST
- Cookies: `sb-*` Supabase cookies (forwarded from original request)
- No body required

**Response (200):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "jwt": "eyJ...",
  "cookies": [
    { "name": "sb-xxx-auth-token", "value": "...", "options": { ... } }
  ]
}
```

**Response (401):** No valid session — **MUST include CORS headers** (see below)

**CORS:**
- Allows origins matching `*.aiden.services` or `https://aiden.services`
- `Access-Control-Allow-Credentials: true`
- Supports OPTIONS preflight
- **CRITICAL: CORS headers must be set on ALL responses, including 401 errors.** If a 401 response lacks `Access-Control-Allow-Origin`, the browser blocks the entire response for cross-origin requests. The calling app can't distinguish "auth failed" from "network error", causing login loops where the app redirects to Gateway login → Gateway sees existing session → redirects back → app can't read 401 → redirects again.

```typescript
// WRONG — browser blocks this for cross-origin callers
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// CORRECT — browser can read the 401 and handle it
if (!user) {
  const corsHeaders = getCorsHeaders(request)
  const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  for (const [key, value] of Object.entries(corsHeaders)) {
    errorResponse.headers.set(key, value)
  }
  return errorResponse
}
```

---

## 8. Gold Standard: Supabase Client Configuration

### Server-Side (All Next.js Apps)

```typescript
// lib/supabase/server.ts
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.aiden.services' : undefined

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                domain: COOKIE_DOMAIN,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            )
          } catch { /* Ignored in Server Components */ }
        },
      },
    }
  )
}
```

### Browser-Side (All Apps)

```typescript
// lib/supabase/client.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,  // CRITICAL: Gateway handles refresh
      },
    }
  )
}
```

**`autoRefreshToken: false` is mandatory.** The Gateway JWT system handles session lifecycle. Supabase auto-refresh would cause conflicts, duplicate calls, and circuit-breaker loops.

---

## 9. Gold Standard: Python/FastAPI Auth (Chat Backend)

The Chat backend is a FastAPI app that receives requests with cookies (not Bearer tokens) from the Vite SPA. It must verify the `aiden-gw` cookie directly.

### Auth Middleware Pattern

```python
import jwt  # PyJWT
from fastapi import Depends, HTTPException, Request

GW_COOKIE_NAME = "aiden-gw"
JWT_SECRET = os.getenv("JWT_SECRET", "")

def verify_gateway_jwt(token: str) -> Optional[User]:
    """Verify aiden-gw JWT locally (~1ms)."""
    if not JWT_SECRET:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer="aiden-gateway")
        user_id = payload.get("sub")
        email = payload.get("email")
        if user_id and email:
            return User(id=user_id, email=email)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        pass
    return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> User:
    # 1. Try Bearer token (for API clients)
    if credentials:
        try:
            return await auth_service.verify_token(credentials.credentials)
        except ValueError:
            pass
    # 2. Try Gateway JWT cookie (for browser clients)
    gw_token = request.cookies.get(GW_COOKIE_NAME)
    if gw_token:
        user = verify_gateway_jwt(gw_token)
        if user:
            return user
    raise HTTPException(status_code=401, detail="Authentication required")
```

**Key requirement:** The `Request` object must be a parameter so the dependency can access `request.cookies`. FastAPI's `HTTPBearer` only reads the `Authorization` header — without the cookie fallback, browser-based requests (which send cookies, not Bearer tokens) will always fail auth.

### WebSocket Auth

WebSocket connections also need Gateway JWT cookie support:

```python
gw_token = websocket.cookies.get("aiden-gw")
if gw_token:
    user = verify_gateway_jwt(gw_token)
```

### Requirements

- `PyJWT>=2.8.0` in `requirements.txt`
- `JWT_SECRET` env var matching Gateway (set in Railway)

---

## 10. Per-App Status & File Map

### Gateway (`www.aiden.services`)

| File | Role | Status |
|------|------|--------|
| `lib/jwt.ts` | JWT signing + verification | Gold standard |
| `lib/supabase/middleware.ts` | Auth + JWT issuance | Gold standard |
| `app/api/auth/session/route.ts` | Centralized session (CORS on all responses incl 401) | Gold standard |
| `app/auth/logout/route.ts` | Centralized logout (uses x-forwarded-host) | Gold standard |
| `app/(auth)/callback/route.ts` | OAuth callback (no studio_token, uses x-forwarded-host) | Gold standard |
| `app/api/auth/sso/route.ts` | DEPRECATED (returns 410) | Remove after 2 weeks |
| `components/ui/logout-button.tsx` | Redirects to `/auth/logout` | Gold standard |

### Creative Agent (`creative.aiden.services`)

| File | Role | Status |
|------|------|--------|
| `middleware.ts` | Delegates to updateSession | Gold standard |
| `src/lib/gateway-jwt.ts` | JWT verification | Gold standard |
| `src/lib/supabase/middleware.ts` | 3-tier auth + beta allowlist | Gold standard |
| `src/lib/auth.ts` | requireAuth / getUser | Gold standard |
| `src/app/auth/logout/route.ts` | Clear cookies + redirect to Gateway | Gold standard |
| `src/app/auth/sso/route.ts` | Token exchange (legacy path) | Review for removal |
| `src/app/auth/callback/page.tsx` | Client callback — redirects to `/generator` | Gold standard |
| `src/components/ClientLayout.tsx` | Hub link uses GATEWAY_URL env var | Gold standard |
| `src/hooks/useAuth.ts` | localStorage tokens | **DEPRECATED — remove** |

### Pressure Test (`test.aiden.services`)

| File | Role | Status |
|------|------|--------|
| `middleware.ts` | Delegates to updateSession | Gold standard |
| `lib/gateway-jwt.ts` | JWT verification | Gold standard |
| `lib/supabase/middleware.ts` | 3-tier auth | Gold standard |
| `lib/auth.ts` | requireAuth / getUser | Gold standard |
| `hooks/useAuth.ts` | localStorage tokens | **DEPRECATED — remove** |
| `components/auth/sign-out-button.tsx` | Redirects to `${GATEWAY_URL}/auth/logout` | Gold standard |
| `components/layout/user-menu.tsx` | Clears `aiden-gw` cookie, uses `www.aiden.services` | Gold standard |
| `app/auth/callback/page.tsx` | Uses GATEWAY_URL env var | Gold standard |

### Studio V2 / Pitch (`pitch.aiden.services`)

| File | Role | Status |
|------|------|--------|
| `frontend/middleware.ts` | Delegates to updateSession | Gold standard |
| `frontend/src/lib/gateway-jwt.ts` | JWT verification | Gold standard |
| `frontend/src/lib/supabase/middleware.ts` | 3-tier auth (request headers) | Gold standard |
| `frontend/src/lib/auth.ts` | requireAuth + direct JWT check | Gold standard |
| `frontend/src/components/ProtectedRoute.tsx` | Client-side auth guard | Works but redundant with middleware |
| `frontend/src/components/Navigation.tsx` | Redirects to `${GATEWAY_URL}/auth/logout` | Gold standard |
| `frontend/src/contexts/AuthContext.tsx` | Stubbed context | Intentional — pages handle own auth |
| `frontend/src/hooks/useCampaignState.tsx` | Auth redirect in campaign init | Has GATEWAY_URL (fixed) |
| `middleware.ts` (root) | Legacy token cookie | **DEAD CODE — do not use** |
| `src/hooks/useAuth.ts` (root) | Legacy localStorage | **DEAD CODE — do not use** |
| `src/contexts/AuthContext.tsx` (root) | Legacy Supabase auth | **DEAD CODE — do not use** |

### Chat/Unified (`chat.aiden.services`)

| File | Role | Status |
|------|------|--------|
| `frontend/src/store/authStore.ts` | Zustand auth (Gateway calls) | Gold standard |
| `frontend/src/utils/api.ts` | API client with credentials | Gold standard |
| `frontend/src/App.tsx` | Auth guard on mount, Hub link uses getGatewayUrl() | Gold standard |
| `frontend/src/lib/supabase.ts` | Supabase client (autoRefresh off) | Gold standard |
| `frontend/src/hooks/useWebSocket.ts` | Cookie-based WS auth | Gold standard |
| `backend/main.py` | FastAPI + CORS + WS | CORS wildcard fallback risk |
| `backend/aiden/auth/auth.py` | Supabase auth service | Gold standard |
| `backend/aiden/auth/middleware.py` | FastAPI auth — Bearer + Gateway JWT cookie | Gold standard |

---

## 11. Anti-Patterns (Things That Break Auth)

### 1. Using `aiden.services` without `www.`

The bare domain resolves to a completely different server. All auth calls to it fail silently or return 404.

```typescript
// BREAKS AUTH
const GATEWAY_URL = 'https://aiden.services'

// CORRECT
const GATEWAY_URL = 'https://www.aiden.services'
```

### 2. Setting middleware auth on response headers

Route handlers read request headers via `headers()`, not response headers.

```typescript
// BREAKS AUTH — API routes never see this
response.headers.set('x-middleware-auth-verified', '1')

// CORRECT — API routes see this via headers()
const requestHeaders = new Headers(request.headers)
requestHeaders.set('x-middleware-auth-verified', '1')
return NextResponse.next({ request: { headers: requestHeaders } })
```

### 3. Calling `supabase.auth.signOut()` in non-Gateway apps

This clears Supabase cookies but leaves `aiden-gw` JWT alive for up to 30 minutes.

```typescript
// WRONG — leaves JWT alive
await supabase.auth.signOut()

// CORRECT — clears everything
window.location.href = `${GATEWAY_URL}/auth/logout`
```

### 4. Using `autoRefreshToken: true` on browser Supabase clients

Causes conflict with Gateway JWT lifecycle. Can trigger circuit-breaker loops.

```typescript
// WRONG
createBrowserClient(url, key) // autoRefreshToken defaults to true

// CORRECT
createBrowserClient(url, key, { auth: { autoRefreshToken: false } })
```

### 5. Storing tokens in localStorage

Tokens belong in HttpOnly cookies. localStorage is readable by any JS on the page.

```typescript
// WRONG — visible to XSS
localStorage.setItem('aiden_auth_token', token)

// CORRECT — HttpOnly cookie set by server
response.cookies.set('aiden-gw', jwt, { httpOnly: true, secure: true })
```

### 6. Passing tokens in URL parameters

Tokens in URLs leak to browser history, server logs, Referrer headers.

```typescript
// WRONG — token visible in browser history
redirect(`/callback?studio_token=${token}`)

// CORRECT — auth via shared cookie on .aiden.services
redirect(returnUrl) // aiden-gw cookie already set
```

### 7. Using `request.url` for redirects on Railway

Behind Railway's proxy, `request.url` resolves to the internal container address (e.g., `http://localhost:8080`). Redirects built from it send users to `localhost`.

```typescript
// WRONG — redirects to http://localhost:8080/login on Railway
return NextResponse.redirect(new URL('/login', request.url))

// CORRECT — uses the public-facing URL
return NextResponse.redirect(new URL('/login', request.nextUrl.href))

// ALSO CORRECT — for non-middleware routes (e.g., /auth/logout)
const forwardedHost = request.headers.get('x-forwarded-host')
const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin
return NextResponse.redirect(new URL('/login', origin))
```

**Rule:** In `middleware.ts`, use `request.nextUrl.href`. In API/route handlers where `nextUrl` is unavailable, use `x-forwarded-host` / `x-forwarded-proto` headers.

### 8. Missing CORS headers on error responses

When the Gateway session endpoint (`/api/auth/session`) returns 401 without CORS headers, cross-origin browsers silently block the response. The calling app gets a network error instead of a readable 401, triggering redirect loops.

```typescript
// WRONG — cross-origin callers can't read this response
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// CORRECT — always include CORS headers on every response
const corsHeaders = getCorsHeaders(request)
const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
for (const [key, value] of Object.entries(corsHeaders)) {
  errorResponse.headers.set(key, value)
}
return errorResponse
```

**Rule:** Any Gateway API endpoint that handles cross-origin requests MUST set CORS headers on ALL responses — 200, 401, 500, etc. The browser enforces CORS before the caller's JavaScript can inspect the response.

### 9. Multiple client-side auth checks that redirect independently

If middleware AND ProtectedRoute AND useCampaignState all independently check auth and redirect, you get race conditions and loops.

```typescript
// WRONG — three independent redirects
// middleware.ts:     if (!auth) redirect(gateway)
// ProtectedRoute:    if (!auth) redirect(gateway)
// useCampaignState:  if (!auth) redirect(gateway)

// CORRECT — single source of truth
// middleware.ts handles ALL server-side auth
// Client components trust middleware (it already ran)
// If client needs to verify: call /api/auth/me (ONE check)
```

---

## 12. Remaining Tech Debt

### Must Fix

| Item | App | Issue |
|------|-----|-------|
| CORS wildcard | Chat backend | Falls back to `["*"]` if no origins configured |

### Fixed (Feb 2026)

| Item | App | What Was Done |
|------|-----|---------------|
| `sign-out-button.tsx` | Pressure Test | Now redirects to `${GATEWAY_URL}/auth/logout` |
| `user-menu.tsx` | Pressure Test | Now clears `aiden-gw` cookie, uses `www.aiden.services` |
| `Navigation.tsx` | Studio V2 | Fixed logout to use `${GATEWAY_URL}/auth/logout`, removed wrong cookie clearing |
| `auth/callback/page.tsx` | Pressure Test | Fixed to use GATEWAY_URL env var |
| `auth/callback/page.tsx` | Creative | Simplified — removed `studio_token` URL param handling |
| `auth/callback/page.tsx` | Studio V2 | Simplified — just redirects to `/dashboard` |
| `ClientLayout.tsx` | Creative | Uses GATEWAY_URL env var |
| `App.tsx` Hub link | Chat | Uses `getGatewayUrl()` from authStore |
| CORS on 401 | Gateway | `/api/auth/session` now returns CORS headers on 401 responses |
| `request.url` redirects | Gateway | All middleware/route redirects use `request.nextUrl.href` or `x-forwarded-host` |
| `logout-button.tsx` | Gateway | Now redirects to `/auth/logout` instead of client-side `signOut()` |
| `callback/route.ts` | Gateway | Removed `studio_token` from redirect URLs |
| Backend auth | Chat | Added PyJWT + Gateway JWT cookie verification to FastAPI middleware |
| WebSocket auth | Chat | Added Gateway JWT cookie fallback to WS endpoint |

### Should Fix

| Item | App | Issue |
|------|-----|-------|
| `useAuth.ts` | Creative, Pressure Test | Dead code — localStorage auth. Remove. |
| Root-level app files | Studio V2 | `middleware.ts`, `src/hooks/useAuth.ts`, etc. Dead code. Remove or archive. |
| `JWT_SECRET` in frontend `.env` | Chat | Should not be in frontend env file |
| WebSocket token param | Chat backend | Legacy unused code path in `main.py` |

### Can Remove After 2 Weeks Stable

| Item | App | Notes |
|------|-----|-------|
| Tier 3 Supabase fallback | All Next.js apps | Direct `getUser()` in middleware — safety net |
| `/api/auth/sso` endpoint | Gateway | Already returns 410 Gone |
| `aiden-auth-ts` cache cookie | Gateway | Optimization, adds complexity |

---

## 13. Troubleshooting

### Symptom: Redirect loop between app and Gateway

**Cause:** App redirects to Gateway login → Gateway sees user is logged in → redirects back → app can't verify auth → redirects again.

**Check:**
1. Is `NEXT_PUBLIC_GATEWAY_URL` set to `https://www.aiden.services` (with www)?
2. Is `JWT_SECRET` set and matching Gateway?
3. Is middleware using request headers (not response headers) for auth info?
4. Does `getUser()` / `requireAuth()` check the `aiden-gw` cookie directly?

### Symptom: Auth works on page load but API calls return 401

**Cause:** Middleware passes (sets auth headers) but API route can't read them.

**Check:**
1. Middleware MUST use `NextResponse.next({ request: { headers: requestHeaders } })` — NOT `response.headers.set()`
2. `lib/auth.ts` should have a direct JWT fallback (`getUserFromGatewayJWT()`)

### Symptom: CORS error on `/api/auth/session`

**Cause:** Gateway's session endpoint doesn't recognize the requesting origin, OR the 401 response is missing CORS headers.

**Check:**
1. Is the app on a `*.aiden.services` subdomain?
2. Does Gateway's `/api/auth/session` CORS allow the origin?
3. Is the request using `credentials: 'include'`?
4. **Does the 401 error response include CORS headers?** A 401 without `Access-Control-Allow-Origin` is silently blocked by the browser. The calling app sees a network error, not a 401. Verify with: `curl -D - -X POST https://www.aiden.services/api/auth/session -H "Origin: https://chat.aiden.services"` — the 401 response MUST have `Access-Control-Allow-Origin` set.

### Symptom: Redirect to `localhost:8080` after login/logout

**Cause:** Using `new URL('/login', request.url)` in middleware or route handlers. On Railway, `request.url` is the internal container URL (`http://localhost:8080`).

**Fix:** Use `new URL('/login', request.nextUrl.href)` in middleware, or construct the origin from `x-forwarded-host` / `x-forwarded-proto` headers in route handlers.

### Symptom: User logged out of one app but still logged in to others

**Cause:** Logout didn't clear `aiden-gw` cookie on `.aiden.services` domain.

**Check:**
1. Is logout redirecting to `${GATEWAY_URL}/auth/logout`?
2. Does the logout route clear cookies with `domain: '.aiden.services'`?
3. Are BOTH domain variants cleared (with domain and without)?

### Symptom: 404 when redirecting to Gateway login

**Cause:** Using `aiden.services` (bare domain) which is NOT the Gateway.

**Fix:** Change all references to `www.aiden.services`.

---

## 14. Adding Auth to a New AIDEN App

1. **Choose subdomain:** `newapp.aiden.services`

2. **Set Railway env vars:**
   ```
   JWT_SECRET=<same as Gateway>
   NEXT_PUBLIC_GATEWAY_URL=https://www.aiden.services
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. **Copy these files from any existing app:**
   - `lib/gateway-jwt.ts` (identical across apps)
   - `lib/supabase/middleware.ts` (customize public routes only)
   - `lib/supabase/server.ts` (identical)
   - `lib/supabase/client.ts` (identical)
   - `lib/auth.ts` (identical)
   - `middleware.ts` (identical)

4. **Protect API routes:**
   ```typescript
   const auth = await requireAuth()
   if (!auth.success) return auth.response
   ```

5. **Add login page (redirect only):**
   ```typescript
   'use client'
   import { useEffect } from 'react'
   const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'
   export default function LoginPage() {
     useEffect(() => {
       const returnUrl = window.location.origin + '/dashboard'
       window.location.href = `${GATEWAY_URL}/login?next=${encodeURIComponent(returnUrl)}`
     }, [])
     return <div>Redirecting to sign in...</div>
   }
   ```

6. **Add logout route:**
   See Section 6 above.

7. **Configure Gateway CORS** (if needed):
   Gateway already allows `*.aiden.services` origins.

---

## 15. DNS & Infrastructure

| Domain | Resolves To | Platform | Purpose |
|--------|-------------|----------|---------|
| `aiden.services` | `15.197.225.128` / `3.33.251.168` | **NOT Railway** | Basic redirect at `/` only. **Do not use for auth.** |
| `www.aiden.services` | Railway (`r3mj5bzc.up.railway.app`) | Railway | **AIDEN Gateway** — the real auth server |
| `creative.aiden.services` | Railway | Railway | Creative Agent |
| `pitch.aiden.services` | Railway | Railway | Studio V2 (Pitch) |
| `test.aiden.services` | Railway | Railway | Pressure Test |
| `chat.aiden.services` | Railway | Railway | Chat/Unified |

---

*This document is the single source of truth for AIDEN platform authentication. All auth changes must conform to these patterns. When in doubt, reference this document.*
