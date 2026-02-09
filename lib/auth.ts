import { NextResponse } from 'next/server'
import { createAuthClient as createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import { headers, cookies } from 'next/headers'
import { verifyGatewayJWT, GW_COOKIE_NAME } from '@/lib/gateway-jwt'

export type AuthResult =
  | { success: true; user: User }
  | { success: false; response: NextResponse }

async function getUserFromGatewayJWT(): Promise<User | null> {
  const cookieStore = await cookies()
  const gwToken = cookieStore.get(GW_COOKIE_NAME)?.value
  if (!gwToken) return null
  const payload = await verifyGatewayJWT(gwToken)
  if (!payload) return null
  return { id: payload.sub, email: payload.email } as User
}

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const headerStore = await headers()
  const middlewareVerified = headerStore.get('x-middleware-auth-verified') === '1'

  if (middlewareVerified) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (!error && session?.user) {
      return { success: true, user: session.user }
    }

    const userId = headerStore.get('x-middleware-user-id')
    const userEmail = headerStore.get('x-middleware-user-email')
    if (userId && userEmail) {
      return { success: true, user: { id: userId, email: userEmail } as User }
    }
  }

  // Check Gateway JWT directly (handles header propagation edge cases)
  const gwUser = await getUserFromGatewayJWT()
  if (gwUser) {
    return { success: true, user: gwUser }
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { success: true, user }
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const headerStore = await headers()
  const middlewareVerified = headerStore.get('x-middleware-auth-verified') === '1'

  if (middlewareVerified) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) return session.user

    const userId = headerStore.get('x-middleware-user-id')
    const userEmail = headerStore.get('x-middleware-user-email')
    if (userId && userEmail) return { id: userId, email: userEmail } as User
  }

  // Check Gateway JWT directly (handles header propagation edge cases)
  const gwUser = await getUserFromGatewayJWT()
  if (gwUser) return gwUser

  const { data: { user } } = await supabase.auth.getUser()
  return user
}
