/**
 * Server-side authentication helpers for mutating API routes.
 *
 * The client attaches the Supabase access token as `Authorization: Bearer <token>`.
 * We verify the token with Supabase and load the caller's user profile
 * (role/status) using the service role key, so route handlers can enforce
 * role-based access on the server.
 */
import { createClient } from '@supabase/supabase-js';

export interface ServerAuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
  requiresPasswordChange: boolean;
}

export interface AuthResult {
  user: ServerAuthUser | null;
  /** `null` when no token was supplied; an error message when the token is invalid. */
  error?: string;
}

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Extract and verify the caller from the request's Authorization header.
 * Returns the caller's profile, or `null` when unauthenticated/invalid.
 */
export async function getRequestUser(request: Request): Promise<ServerAuthUser | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const { data, error } = await getAnonClient().auth.getUser(token);
      if (!error && data?.user) {
        const { data: profile } = await getAdminClient()
          .from('user_profiles')
          .select('id, email, role, status, requires_password_change, access_end_date, original_role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile) {
          return {
            id: profile.id,
            email: profile.email || data.user.email || '',
            role: profile.role,
            status: profile.status,
            requiresPasswordChange: Boolean(profile.requires_password_change),
          };
        }
      }
    } catch {
      // Fall through to headers check below
    }
  }

  // Fallback: localStorage session headers (userId + email) verified against DB
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  if (!userId && !userEmail) return null;

  let query = getAdminClient()
    .from('user_profiles')
    .select('id, email, role, status, requires_password_change, access_end_date, original_role');

  if (userId) {
    query = query.eq('id', userId);
  } else if (userEmail) {
    query = query.eq('email', userEmail);
  }

  const { data: profile } = await query.maybeSingle();
  if (!profile) return null;

  if (userEmail && profile.email && profile.email.toLowerCase() !== userEmail.toLowerCase()) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email || '',
    role: profile.role,
    status: profile.status,
    requiresPasswordChange: Boolean(profile.requires_password_change),
  };
}

/**
 * Resolve the authenticated caller and enforce that their role is one of
 * `allowedRoles`. Returns the caller when allowed, otherwise throws an
 * AuthError-like object for the route to translate into a 401/403.
 */
export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<{ user: ServerAuthUser }> {
  const user = await getRequestUser(request);

  if (!user) {
    throw new Error('Unauthorized: valid session required');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${allowedRoles.join(' or ')}`);
  }

  if (user.status === 'inactive' || user.status === 'suspended') {
    throw new Error('Forbidden: account is not active');
  }

  return { user };
}
