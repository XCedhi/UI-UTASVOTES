import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔄 Changing password for user:', userId);

    // Step 1: Update the requires_password_change flag FIRST (using service role)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        requires_password_change: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error updating profile flag:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile: ' + profileError.message },
        { status: 500 }
      );
    }

    console.log('✅ Profile flag updated successfully');

    // Step 2: Update password in Supabase Auth
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('❌ Error updating password:', passwordError);
      
      // Revert the profile flag if password update fails
      await supabaseAdmin
        .from('user_profiles')
        .update({
          requires_password_change: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return NextResponse.json(
        { error: 'Failed to update password: ' + passwordError.message },
        { status: 500 }
      );
    }

    console.log('✅ Password updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in change-password API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
