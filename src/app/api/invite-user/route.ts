import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, role, accessStartDate, accessEndDate } = await request.json();
    
    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Generate invitation link
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028'}/reset-password`;
    
    console.log('📧 Inviting user:', email);
    
    // Invite user via Supabase Auth
    // This will automatically send an email using Supabase's email templates
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: `${firstName} ${lastName}`,
        role,
        status: 'pending',
        access_start_date: accessStartDate || null,
        access_end_date: accessEndDate || null,
        position: role === 'commission' ? 'Electoral Commission Member' : 'Administrator',
        invited_at: new Date().toISOString()
      },
      redirectTo: redirectUrl
    });
    
    if (error) {
      console.error('❌ Supabase invite error:', error);
      throw error;
    }
    
    console.log('✅ Auth user created:', data.user?.id);
    
    // CRITICAL: Manually create the user_profiles record
    // Since we can't create a trigger on auth.users, we do it here
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: data.user?.id,
        email: email,
        full_name: `${firstName} ${lastName}`,
        role: role,
        status: 'pending',
        access_start_date: accessStartDate || null,
        access_end_date: accessEndDate || null,
        position: role === 'commission' ? 'Electoral Commission Member' : 'Administrator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      // Try to clean up the auth user if profile creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(data.user?.id || '');
        console.log('🧹 Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup auth user:', cleanupError);
      }
      throw new Error(`Database error creating new user: ${profileError.message}`);
    }
    
    console.log('✅ User profile created successfully:', profile);
    
    // Create invitation record in database
    const { error: dbError } = await supabaseAdmin
      .from('user_invitations')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        access_start_date: accessStartDate || null,
        access_end_date: accessEndDate || null,
        invitation_token: data.user?.id || '',
        invited_by: null, // You can pass the current user's ID here
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    
    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database insert fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation email sent successfully',
      data: {
        email,
        userId: data.user?.id
      }
    });
    
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to send invitation',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
