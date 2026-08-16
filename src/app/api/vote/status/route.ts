import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole, type ServerAuthUser } from '@/lib/server-auth';

// Service-role client for reads (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function resolveVoter(request: Request): Promise<ServerAuthUser | null> {
  try {
    const { user } = await requireRole(request, ['student', 'candidate', 'commission', 'admin']);
    return user;
  } catch {
    // Fallback to localStorage session headers
  }

  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  if (!userId && !userEmail) return null;

  let query = supabaseAdmin
    .from('user_profiles')
    .select('id, email, role, status, requires_password_change');

  if (userId) {
    query = query.eq('id', userId);
  } else if (userEmail) {
    query = query.eq('email', userEmail);
  }

  const { data: profile } = await query.maybeSingle();
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    requiresPasswordChange: Boolean(profile.requires_password_change),
  };
}

/**
 * GET /api/vote/status
 * Returns the list of election IDs that the currently authenticated user has voted in.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await resolveVoter(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        votedElectionIds: [],
      });
    }

    const { data: voteRows, error: votesError } = await supabaseAdmin
      .from('votes')
      .select('election_id')
      .eq('voter_id', user.id);

    if (votesError) {
      console.error('Error querying votes status:', votesError);
      return NextResponse.json({
        success: true,
        authenticated: true,
        userId: user.id,
        votedElectionIds: [],
      });
    }

    const votedElectionIds = Array.from(
      new Set((voteRows || []).map((v: any) => v.election_id).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId: user.id,
      votedElectionIds,
    });
  } catch (error: any) {
    console.error('Error in /api/vote/status:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error', votedElectionIds: [] },
      { status: 500 }
    );
  }
}
