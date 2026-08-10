import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client (bypasses RLS) — server-only; the key never reaches the browser.
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

export const dynamic = 'force-dynamic';

/**
 * GET /api/results
 *
 * Returns authoritative live vote tallies straight from the `votes` table:
 *   { elections: { [electionId]: { total: number, candidates: { [candidateId]: number } } } }
 *
 * The commission/admin results pages use this so the displayed numbers always
 * reflect the real ballot rows — even if the denormalized counter columns
 * (candidates.votes / elections.voted_count) are stale or their RPC increments
 * were not applied.
 */
export async function GET(_request: NextRequest) {
  try {
    const { data: votes, error } = await supabaseAdmin
      .from('votes')
      .select('election_id, candidate_id');

    if (error) {
      console.error('Error loading live results:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const elections: Record<
      string,
      { total: number; candidates: Record<string, number> }
    > = {};

    for (const vote of votes || []) {
      const election = (elections[vote.election_id] ??= { total: 0, candidates: {} });
      election.total += 1;
      election.candidates[vote.candidate_id] = (election.candidates[vote.candidate_id] || 0) + 1;
    }

    return NextResponse.json({ elections });
  } catch (err: any) {
    console.error('Error in /api/results:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load live results' },
      { status: 500 }
    );
  }
}
