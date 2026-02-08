import { NextResponse } from "next/server";
import { createAuthClient as createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { headers } from "next/headers";

export type AuthResult =
  | { success: true; user: User }
  | { success: false; response: NextResponse };

/**
 * Require authentication for API routes.
 * Returns the authenticated user or an unauthorized response.
 *
 * When middleware has already verified auth (via getUser() + token refresh),
 * this uses getSession() to avoid a second getUser() call that would race
 * on the refresh token and cause "refresh_token_already_used" revocations.
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const auth = await requireAuth();
 *   if (!auth.success) return auth.response;
 *
 *   // Use auth.user.id for database operations
 *   const userId = auth.user.id;
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const headerStore = await headers();

  // If middleware already verified auth (it called getUser() which may have refreshed
  // the token), use getSession() instead of getUser() to avoid a second refresh
  // that would race on the now-consumed refresh token.
  const middlewareVerified = headerStore.get('x-middleware-auth-verified') === '1';

  if (middlewareVerified) {
    // Middleware already called getUser() and verified. Use getSession() which reads
    // from cookies without making an API call or triggering token refresh.
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }

    return { success: true, user: session.user };
  }

  // No middleware verification (e.g., public routes that still call requireAuth,
  // or direct API calls). Fall back to getUser() for full verification.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { success: true, user };
}

/**
 * Get the current user without requiring authentication.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const headerStore = await headers();

  // Same optimization: if middleware verified, use getSession() to avoid double refresh
  const middlewareVerified = headerStore.get('x-middleware-auth-verified') === '1';

  if (middlewareVerified) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
