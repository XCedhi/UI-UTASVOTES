import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Log environment variables to debug
console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔑 Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('🔑 Service Role Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

// Use service role key for admin operations (server-side only!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

console.log('✅ Supabase admin client created');

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received election creation request');
    
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const {
      name,
      description,
      election_type,
      department,
      nomination_start,
      nomination_end,
      voting_start,
      voting_end,
      positions,
      userId
    } = body;

    // Validate required fields
    if (!name || !description || !election_type || !nomination_start || !nomination_end || !voting_start || !voting_end) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!positions || positions.length === 0) {
      console.error('❌ No positions provided');
      return NextResponse.json(
        { error: 'At least one position is required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating election...');

    // Create election using service role (bypasses RLS)
    const { data: election, error: electionError } = await supabaseAdmin
      .from('elections')
      .insert({
        name,
        description,
        election_type,
        department: election_type === 'departmental' ? department : null,
        nomination_start,
        nomination_end,
        voting_start,
        voting_end,
        status: 'upcoming',
        created_by: userId,
      })
      .select()
      .single();

    if (electionError) {
      console.error('❌ Error creating election:', electionError);
      console.error('Error code:', electionError.code);
      console.error('Error message:', electionError.message);
      console.error('Error details:', electionError.details);
      console.error('Error hint:', electionError.hint);
      return NextResponse.json(
        { error: electionError.message },
        { status: 500 }
      );
    }

    console.log('✅ Election created:', election);

    // Create positions
    const validPositions = positions.filter((p: string) => p.trim());
    const positionsData = validPositions.map((position: string) => ({
      election_id: election.id,
      title: position.trim(),
      description: `Position for ${position.trim()}`,
      max_candidates: 10,
      application_fee: 0.00,
    }));

    const { error: positionsError } = await supabaseAdmin
      .from('positions')
      .insert(positionsData);

    if (positionsError) {
      console.error('⚠️ Error creating positions:', positionsError);
      // Don't fail the whole request if positions fail
    }

    // Create announcement for the election
    const announcementTitle = election_type === 'departmental' 
      ? `New Departmental Election: ${name}`
      : `New University-Wide Election: ${name}`;
    
    const announcementMessage = election_type === 'departmental'
      ? `${name} has been scheduled for ${department}. Nominations open on ${new Date(nomination_start).toLocaleDateString()} and close on ${new Date(nomination_end).toLocaleDateString()}. Voting starts ${new Date(voting_start).toLocaleDateString()}.`
      : `${name} has been scheduled for all students. Nominations open on ${new Date(nomination_start).toLocaleDateString()} and close on ${new Date(nomination_end).toLocaleDateString()}. Voting starts ${new Date(voting_start).toLocaleDateString()}.`;

    const { error: announcementError } = await supabaseAdmin
      .from('announcements')
      .insert({
        type: 'election',
        title: announcementTitle,
        message: announcementMessage,
        priority: 'high',
        is_active: true,
        published_at: new Date().toISOString(),
      });

    if (announcementError) {
      console.error('⚠️ Error creating announcement:', announcementError);
      // Don't fail the whole request if announcement fails
    } else {
      console.log('✅ Announcement created for election');
    }

    // Create notifications for all users
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role');

    if (users && users.length > 0) {
      const notifications = users.map(user => ({
        user_id: user.id,
        title: 'New Election Created',
        message: `${name} has been scheduled. Nominations open on ${new Date(nomination_start).toLocaleDateString()}.`,
        type: 'election',
        is_read: false,
      }));

      const { error: notifError } = await supabaseAdmin.from('notifications').insert(notifications);
      
      if (notifError) {
        console.error('⚠️ Error creating notifications:', notifError);
      } else {
        console.log('✅ Notifications sent to all users');
      }
    }

    return NextResponse.json({
      success: true,
      election,
    });

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
