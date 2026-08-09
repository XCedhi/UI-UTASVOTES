import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/server-auth';
import { sendResultsEmail } from '@/lib/email';

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildResultsHtml(election: any, candidatesByPosition: Record<string, any[]>): string {
  const positionBlocks = Object.entries(candidatesByPosition)
    .map(([positionTitle, candidates]) => {
      const sorted = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const totalVotes = sorted.reduce((sum, c) => sum + (c.votes || 0), 0);

      const rows = sorted
        .map((candidate, index) => {
          const percentage =
            totalVotes > 0 ? (((candidate.votes || 0) / totalVotes) * 100).toFixed(2) : '0.00';
          const winnerBadge =
            index === 0 && (candidate.votes || 0) > 0
              ? ' <strong style="color:#16a34a;">&#10003; Winner</strong>'
              : '';
          return `<tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${
              index + 1
            }</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${escapeHtml(
              candidate.full_name || candidate.name || 'Unknown'
            )}${winnerBadge}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${
              candidate.department || 'N/A'
            }</td>
            <td align="center" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${
              candidate.votes || 0
            }</td>
            <td align="center" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${percentage}%</td>
          </tr>`;
        })
        .join('');

      return `<div style="margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #111827; font-size: 18px; font-weight: 600;">${escapeHtml(
          positionTitle
        )}</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">#</th>
              <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Candidate</th>
              <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Department</th>
              <th style="padding: 10px 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">Votes</th>
              <th style="padding: 10px 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">%</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join('');

  return `<div style="margin: 24px 0; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
    <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
      <strong>Turnout:</strong> ${election.voted_count || 0} of ${
    election.total_voters || 0
  } registered voters (${election.turnout_percentage || 0}%)
    </p>
  </div>${positionBlocks}`;
}

/**
 * POST /api/elections/certify
 * Admin/Commission-only. Marks an election as certified, records who
 * certified it, and emails the certified results to all active students.
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ['admin', 'commission']);

    const body = await request.json();
    const { electionId } = body;

    if (!electionId) {
      return NextResponse.json(
        { error: 'Missing required field: electionId' },
        { status: 400 }
      );
    }

    const { data: election, error: electionError } = await supabaseAdmin
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .maybeSingle();

    if (electionError || !election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 });
    }

    const { data: candidatesData, error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('election_id', electionId)
      .eq('status', 'approved')
      .order('votes', { ascending: false });

    if (candidatesError) {
      return NextResponse.json(
        { error: `Failed to load candidates: ${candidatesError.message}` },
        { status: 500 }
      );
    }

    const candidatesByPosition = (candidatesData || []).reduce<Record<string, any[]>>(
      (acc, candidate: any) => {
        const position = candidate.position || 'General Position';
        if (!acc[position]) acc[position] = [];
        acc[position].push(candidate);
        return acc;
      },
      {}
    );

    const electionName = election.name || election.title || 'Election';
    const certifiedAt = new Date().toISOString();
    const resultsHtml = buildResultsHtml(election, candidatesByPosition);

    // Mark the election as certified
    const { error: certifyError } = await supabaseAdmin
      .from('elections')
      .update({
        is_certified: true,
        certified_at: certifiedAt,
        certified_by: user.id,
        results_sent_at: certifiedAt,
        status: election.status === 'active' ? 'completed' : election.status,
        updated_at: certifiedAt,
      })
      .eq('id', electionId);

    if (certifyError) {
      console.error('Error certifying election:', certifyError);
      return NextResponse.json(
        { error: `Failed to certify election: ${certifyError.message}` },
        { status: 500 }
      );
    }

    // Deliver the certified results to all active students
    const { data: students } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name')
      .eq('role', 'student')
      .eq('status', 'active');

    let emailed = 0;
    let failed = 0;

    if (students && students.length > 0) {
      for (const student of students) {
        const result = await sendResultsEmail({
          to: student.email,
          fullName: student.full_name || 'Student',
          electionName,
          resultsHtml,
          certifiedAt: new Date(certifiedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
        if (result.delivered) emailed++;
        else failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Election certified and results sent to ${emailed} student(s).`,
      electionId,
      certifiedAt,
      emailed,
      failed,
      totalStudents: students?.length || 0,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to certify election';
    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error('Error certifying election:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

