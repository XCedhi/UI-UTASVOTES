import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key to bypass RLS
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, status, accessStartDate, accessEndDate } = body;

    // Validate required fields
    if (!userId || !role || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role, status' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['student', 'candidate', 'commission', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('🔄 API: Updating user:', userId);
    console.log('📝 API: New role:', role);
    console.log('📝 API: New status:', status);

    // Prepare update data
    const updateData: any = {
      role,
      status,
      updated_at: new Date().toISOString(),
    };

    // Add access dates for commission members
    if (role === 'commission') {
      updateData.access_start_date = accessStartDate || null;
      updateData.access_end_date = accessEndDate || null;
    } else {
      // Clear access dates for non-commission roles
      updateData.access_start_date = null;
      updateData.access_end_date = null;
    }

    console.log('📤 API: Sending update to database:', updateData);

    // Update user using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ API: Database error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error('❌ API: User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ API: User updated successfully:', data[0]);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: data[0],
    });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
