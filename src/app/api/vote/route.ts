import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/server-auth';

// Service-role client for writes (bypasses RLS)
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

/**
 * POST /api/vote
 * Cast a single vote. The server:
 *  1. Authenticates the caller (student/candidate with active session).
 *  2. Verifies the election's voting window is open.
 *  3. Verifies the candidate belongs to the election and is approved.
 *  4. Inserts into `votes` — the UNIQUE(election_id, voter_id) constraint
 *     rejects duplicate votes (Postgres error 23505 → 409).
 *  5. Atomically increments candidate and election counters.
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ['student', 'candidate']);

    if (user.requiresPasswordChange) {
      return NextResponse.json(
        { error: 'You must change your password before voting' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { electionId, candidateId } = body;

    if (!electionId || !candidateId) {
      return NextResponse.json(
        { error: 'Missing required fields: electionId, candidateId' },
        { status: 400 }
      );
    }

    // Load election and validate voting window
    const { data: election, error: electionError } = await supabaseAdmin
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .maybeSingle();

    if (electionError || !election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    const now = new Date();
    const start = new Date(election.voting_start || election.start_date);
    const end = new Date(election.voting_end || election.end_date);

    if (now < start || now > end) {
      return NextResponse.json(
        { error: 'Voting is not open for this election at this time' },
        { status: 403 }
      );
    }

    // Verify the candidate belongs to this election and is approved
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('id, election_id, status')
      .eq('id', candidateId)
      .maybeSingle();

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (candidate.election_id !== electionId) {
      return NextResponse.json(
        { error: 'Candidate does not belong to this election' },
        { status: 400 }
      );
    }

    if (candidate.status !== 'approved') {
      return NextResponse.json(
        { error: 'This candidate is not approved for the ballot' },
        { status: 400 }
      );
    }

    // Insert the vote — the unique constraint is the authoritative duplicate guard
    const voteHash = `V-${crypto.randomUUID()}`;
    const { error: insertError } = await supabaseAdmin.from('votes').insert({
      election_id: electionId,
      candidate_id: candidateId,
      voter_id: user.id,
      vote_hash: voteHash,
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted in this election.' },
          { status: 409 }
        );
      }
      console.error('Error inserting vote:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to record vote' },
        { status: 500 }
      );
    }

    // Atomic counter increments
    const counterResults = await Promise.allSettled([
      supabaseAdmin.rpc('increment_candidate_votes', { p_candidate_id: candidateId }),
      supabaseAdmin.rpc('increment_election_voted_count', { p_election_id: electionId }),
    ]);

    counterResults.forEach((result) => {
      if (result.status === 'rejected') {
        console.warn('Counter increment failed:', result.reason);
      }
    });

    const receiptNumber = `UTAS-${electionId.slice(0, 6).toUpperCase()}-${Date.now()
      .toString(36)
      .toUpperCase()}`;

    return NextResponse.json({
      success: true,
      receiptNumber,
      message: 'Vote recorded successfully',
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to cast vote';
    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error('Error casting vote:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
