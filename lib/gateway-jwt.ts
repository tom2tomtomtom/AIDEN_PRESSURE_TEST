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
