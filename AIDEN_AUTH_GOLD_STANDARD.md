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

---

## 2. Auth Flow

### 2-Tier Flow (Next.js Apps)

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

## 3. Cookie Inventory

| Cookie | Domain | HttpOnly | Secure | SameSite | MaxAge | Set By | Purpose |
|--------|--------|----------|--------|----------|--------|--------|---------|
| `aiden-gw` | `.aiden.services` | Yes | Yes (prod) | lax | 30 min | Gateway | Gateway-signed JWT (HS256) |
| `sb-*` (multiple) | `.aiden.services` | Yes | Yes (prod) | lax | session | Supabase | Supabase session tokens |
| `aiden-auth-ts` | `.aiden.services` | No | Yes (prod) | lax | 30 sec | Gateway | Auth cache timestamp (optimization) |

### Cookie Domain Rules

- **Production:** Always `.aiden.services` (leading dot, covers all subdomains)
- **Development:** `undefined` (localhost, no domain restriction)
- **NEVER** set cookies on bare `aiden.services` without the leading dot

```typescript
const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.aiden.services' : undefined
```

---

## 4. Per-App Configuration

### Gateway (`www.aiden.services`)

| File | Role |
|------|------|
| `lib/jwt.ts` | JWT signing + verification |
| `lib/supabase/middleware.ts` | Auth + JWT issuance |
| `app/api/auth/session/route.ts` | Centralized session endpoint (CORS on all responses incl 401) |
| `app/auth/logout/route.ts` | Centralized logout (clears all cookies, uses x-forwarded-host) |
| `app/(auth)/callback/route.ts` | OAuth callback |
| `components/ui/logout-button.tsx` | Redirects to `/auth/logout` |

### Creative Agent (`creative.aiden.services`)

| File | Role |
|------|------|
| `middleware.ts` | Delegates to updateSession |
| `src/lib/gateway-jwt.ts` | JWT verification |
| `src/lib/supabase/middleware.ts` | 2-tier auth + beta allowlist |
| `src/lib/auth.ts` | requireAuth / getUser (middleware headers → direct JWT) |
| `src/app/auth/logout/route.ts` | Clear cookies + redirect to Gateway |
| `src/app/auth/callback/page.tsx` | Client callback — redirects to `/generator` |
| `src/components/ClientLayout.tsx` | Hub link uses GATEWAY_URL env var |

**Note:** Creative Agent's 28 API routes use direct `supabase.auth.getUser()` via `sb-*` cookies. This works correctly and is a separate future refactor.

### Pressure Test (`test.aiden.services`)

| File | Role |
|------|------|
| `middleware.ts` | Delegates to updateSession |
| `lib/gateway-jwt.ts` | JWT verification |
| `lib/supabase/middleware.ts` | 2-tier auth |
| `lib/auth.ts` | requireAuth / getUser |
| `components/auth/sign-out-button.tsx` | Redirects to `${GATEWAY_URL}/auth/logout` |
| `components/layout/user-menu.tsx` | Clears `aiden-gw` cookie, uses `www.aiden.services` |
| `app/auth/callback/page.tsx` | Uses GATEWAY_URL env var |

### Studio V2 / Pitch (`pitch.aiden.services`)

| File | Role |
|------|------|
| `frontend/middleware.ts` | Delegates to updateSession |
| `frontend/src/lib/gateway-jwt.ts` | JWT verification |
| `frontend/src/lib/supabase/middleware.ts` | 2-tier auth (request headers) |
| `frontend/src/lib/auth.ts` | requireAuth + direct JWT check |
| `frontend/src/components/Navigation.tsx` | Redirects to `${GATEWAY_URL}/auth/logout` |

### Chat/Unified (`chat.aiden.services`)

| File | Role |
|------|------|
| `frontend/src/store/authStore.ts` | Zustand auth (Gateway session calls) |
| `frontend/src/utils/api.ts` | API client with `credentials: 'include'` |
| `frontend/src/App.tsx` | Auth guard on mount, Hub link uses `getGatewayUrl()` |
| `frontend/src/lib/supabase.ts` | Supabase client (`autoRefreshToken: false`) |
| `frontend/src/hooks/useWebSocket.ts` | Cookie-based WS auth |
| `backend/main.py` | FastAPI + CORS (explicit origins) + WS |
| `backend/aiden/auth/auth.py` | Supabase auth service |
| `backend/aiden/auth/middleware.py` | FastAPI auth — Bearer + Gateway JWT cookie |

---

## 5. Environment Variables

### Required Across ALL Apps

| Variable | Example | Notes |
|----------|---------|-------|
| `JWT_SECRET` | `a63EX74d/EDKOHt+...` | **MUST be identical** across all 5 apps. Base64 32-byte key. |
| `NEXT_PUBLIC_SUPABASE_URL` / `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Same Supabase project for all apps |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Public anon key |

### Required Per App

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GATEWAY_URL` / `VITE_GATEWAY_URL` | `https://www.aiden.services` | **ALWAYS use `www.`** — bare domain is NOT the Gateway |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-side only, for admin operations |

### Critical: `www.aiden.services` vs `aiden.services`

```
aiden.services      → 15.197.225.128 / 3.33.251.168  (NOT Railway, returns 404)
www.aiden.services  → Railway (r3mj5bzc.up.railway.app) (THE REAL GATEWAY)
```

The bare domain `aiden.services` is NOT the Gateway. Every reference to the Gateway MUST use `www.aiden.services`.

```typescript
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'
```

---

## 6. Key Gateway Files

### JWT (`lib/jwt.ts`)

| Field | Value |
|-------|-------|
| Algorithm | HS256 via `jose` |
| Secret | `JWT_SECRET` env var (identical across all apps) |
| Issuer | `aiden-gateway` (verified on decode) |
| Expiration | 30 minutes |
| Claims | `{ sub, email, iss, iat, exp }` |

**Signing (Gateway only):**

```typescript
import { SignJWT } from 'jose'

const jwt = await new SignJWT({ sub: user.id, email: user.email })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setIssuer('aiden-gateway')
  .setExpirationTime('30m')
  .sign(new TextEncoder().encode(process.env.JWT_SECRET))
```

**Verification (all apps):**

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
    return null
  }
}
```

### Session Endpoint (`app/api/auth/session/route.ts`)

All apps call this for Tier 2 auth refresh.

- **Method:** POST
- **Cookies:** `sb-*` Supabase cookies (forwarded from original request)
- **Response (200):** `{ user, jwt, cookies }`
- **Response (401):** No valid session
- **CORS:** Allows `*.aiden.services` origins with `credentials: true`. **CORS headers on ALL responses including 401** — without them, cross-origin browsers silently block the response, causing redirect loops.

### Logout (`app/auth/logout/route.ts`)

Single source of truth for logout. Clears `aiden-gw`, `aiden-auth-ts`, and all `sb-*` cookies, then redirects to `/login`.

All apps redirect here — **never** call `supabase.auth.signOut()` directly in non-Gateway apps.

```typescript
// CORRECT — all apps
window.location.href = `${GATEWAY_URL}/auth/logout`
```

---

## 7. Standard File Patterns

### `middleware.ts` (root of each Next.js app)

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

### `lib/gateway-jwt.ts` (identical across all apps)

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

### `lib/auth.ts` (API route auth helpers)

Checks middleware headers first, then Gateway JWT directly as fallback.

```typescript
export async function getUser(): Promise<User | null> {
  // 1. Check middleware headers (fastest)
  const headerStore = await headers()
  if (headerStore.get('x-middleware-auth-verified') === '1') {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) return session.user

    const userId = headerStore.get('x-middleware-user-id')
    const userEmail = headerStore.get('x-middleware-user-email')
    if (userId && userEmail) return { id: userId, email: userEmail } as User
  }

  // 2. Direct JWT verification (handles header propagation edge cases)
  const cookieStore = await cookies()
  const gwToken = cookieStore.get('aiden-gw')?.value
  if (gwToken) {
    const payload = await verifyGatewayJWT(gwToken)
    if (payload) return { id: payload.sub, email: payload.email } as User
  }

  return null
}
```

### Supabase Client — Browser (`autoRefreshToken: false`)

```typescript
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false } }  // Gateway handles session lifecycle
  )
}
```

### Python/FastAPI Auth (Chat Backend)

```python
import jwt  # PyJWT

def verify_gateway_jwt(token: str) -> Optional[User]:
    if not JWT_SECRET:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer="aiden-gateway")
        if payload.get("sub") and payload.get("email"):
            return User(id=payload["sub"], email=payload["email"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        pass
    return None
```

WebSocket connections also verify the `aiden-gw` cookie:

```python
gw_token = websocket.cookies.get("aiden-gw")
if gw_token:
    user = verify_gateway_jwt(gw_token)
```

---

## 8. Deployment

| Domain | Platform | Notes |
|--------|----------|-------|
| `www.aiden.services` | Railway | **AIDEN Gateway** — the real auth server |
| `creative.aiden.services` | Railway | Creative Agent |
| `pitch.aiden.services` | Railway | Studio V2 (Pitch) |
| `test.aiden.services` | Railway | Pressure Test |
| `chat.aiden.services` | Railway | Chat/Unified |
| `aiden.services` (bare) | NOT Railway | Basic redirect at `/` only. **Do not use for auth.** |

---

## 9. Adding Auth to a New App

1. **Choose subdomain:** `newapp.aiden.services`

2. **Set Railway env vars:**
   ```
   JWT_SECRET=<same as Gateway>
   NEXT_PUBLIC_GATEWAY_URL=https://www.aiden.services
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. **Copy standard files** from any existing app:
   - `lib/gateway-jwt.ts`
   - `lib/supabase/middleware.ts` (customize public routes only)
   - `lib/supabase/server.ts`
   - `lib/supabase/client.ts`
   - `lib/auth.ts`
   - `middleware.ts`

4. **Protect API routes:**
   ```typescript
   const auth = await requireAuth()
   if (!auth.success) return auth.response
   ```

5. **Logout:** Redirect to `${GATEWAY_URL}/auth/logout`

6. **CORS:** Gateway already allows `*.aiden.services` origins.

---

## 10. Anti-Patterns

### 1. Using `aiden.services` without `www.`
The bare domain resolves to a different server. All auth calls fail.

### 2. Setting middleware auth on response headers
Route handlers read **request** headers via `headers()`, not response headers.
```typescript
// WRONG
response.headers.set('x-middleware-auth-verified', '1')

// CORRECT
const requestHeaders = new Headers(request.headers)
requestHeaders.set('x-middleware-auth-verified', '1')
return NextResponse.next({ request: { headers: requestHeaders } })
```

### 3. Calling `supabase.auth.signOut()` in non-Gateway apps
Clears Supabase cookies but leaves `aiden-gw` JWT alive for up to 30 minutes.

### 4. Using `autoRefreshToken: true` on browser Supabase clients
Conflicts with Gateway JWT lifecycle.

### 5. Storing tokens in localStorage
Tokens belong in HttpOnly cookies. localStorage is vulnerable to XSS.

### 6. Passing tokens in URL parameters
Tokens in URLs leak to browser history, server logs, and Referrer headers.

### 7. Using `request.url` for redirects on Railway
Behind Railway's proxy, `request.url` is the internal container URL. Use `request.nextUrl.href` in middleware, or `x-forwarded-host`/`x-forwarded-proto` in route handlers.

### 8. Missing CORS headers on error responses
Gateway's session endpoint must set CORS headers on ALL responses (200, 401, 500). Without them, cross-origin browsers silently block the response, causing redirect loops.

---

## 11. Troubleshooting

### Redirect loop between app and Gateway
1. Is `NEXT_PUBLIC_GATEWAY_URL` set to `https://www.aiden.services` (with `www.`)?
2. Is `JWT_SECRET` set and matching Gateway?
3. Is middleware using request headers (not response headers)?

### Auth works on page load but API calls return 401
1. Middleware must use `NextResponse.next({ request: { headers: requestHeaders } })`
2. `lib/auth.ts` should have a direct JWT fallback

### CORS error on `/api/auth/session`
1. Is the app on a `*.aiden.services` subdomain?
2. Is the request using `credentials: 'include'`?
3. Does the 401 response include CORS headers?

### Redirect to `localhost:8080`
Use `request.nextUrl.href` in middleware, or `x-forwarded-host` in route handlers. Never use `request.url` on Railway.

### User logged out of one app but still logged in to others
1. Is logout redirecting to `${GATEWAY_URL}/auth/logout`?
2. Are cookies cleared with `domain: '.aiden.services'`?

### 404 when redirecting to Gateway login
Change `aiden.services` to `www.aiden.services`.

---

## 12. Remaining Tech Debt

| Item | App | Issue |
|------|-----|-------|
| `JWT_SECRET` in frontend `.env` | Chat | Should not be in frontend env file |
| WebSocket token param | Chat backend | Legacy unused code path in `main.py` |

---

*This document is the single source of truth for AIDEN platform authentication. All auth changes must conform to these patterns.*
