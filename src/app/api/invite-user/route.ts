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
    
    // Invite user via Supabase Auth
    // This will automatically send an email using Supabase's email templates
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: `${firstName} ${lastName}`,
        role,
        access_start_date: accessStartDate || null,
        access_end_date: accessEndDate || null,
        invited_at: new Date().toISOString()
      },
      redirectTo: redirectUrl
    });
    
    if (error) {
      console.error('Supabase invite error:', error);
      throw error;
    }
    
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
