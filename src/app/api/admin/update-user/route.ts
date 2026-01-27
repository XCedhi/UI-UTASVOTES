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

    // Send email notification to user about role/status change
    try {
      // Import Resend directly instead of calling another API route
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Determine recipient email (admin in dev, user in production)
      const recipientEmail = process.env.NODE_ENV === 'production' 
        ? data[0].email 
        : process.env.ADMIN_NOTIFICATION_EMAIL || data[0].email;

      console.log(`📧 Sending email to: ${recipientEmail} (original: ${data[0].email})`);

      // Format role and status for display
      const roleDisplay = role === 'commission' 
        ? 'Electoral Commission Member' 
        : role.charAt(0).toUpperCase() + role.slice(1);
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

      // Build email HTML (simplified version)
      const devBanner = process.env.NODE_ENV !== 'production' && recipientEmail !== data[0].email
        ? `<div style="background-color: #FEF3C7; padding: 16px; text-align: center; border-bottom: 2px solid #F59E0B;">
             <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
               🔧 DEVELOPMENT MODE: This email was intended for <strong>${data[0].email}</strong>
             </p>
           </div>`
        : '';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F3F4F6;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden;">
              ${devBanner}
              <div style="background: linear-gradient(135deg, #F2B807 0%, #D97904 100%); padding: 40px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px;">UTASVotes</h1>
                <p style="margin: 8px 0 0 0; color: white;">University Electoral System</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="margin: 0 0 16px 0; color: #111827;">Account Update Notification</h2>
                <p style="color: #4B5563;">Hello <strong>${data[0].full_name}</strong>,</p>
                <p style="color: #4B5563;">Your UTASVotes account has been updated by a system administrator.</p>
                <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <p style="margin: 0; color: #6B7280; font-size: 14px;">NEW ROLE: <strong style="color: #111827;">${roleDisplay}</strong></p>
                  <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 14px;">STATUS: <strong style="color: #111827;">${statusDisplay}</strong></p>
                </div>
                <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #1E40AF; font-weight: 600;">📌 Important</p>
                  <p style="margin: 8px 0 0 0; color: #1E40AF;">
                    Please <strong>log out and log back in</strong> for these changes to take effect.
                  </p>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                     style="display: inline-block; background-color: #F2B807; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600;">
                    Log In to UTASVotes
                  </a>
                </div>
              </div>
              <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  University of Technical and Applied Sciences (UTAS)
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Send email
      const { error: emailError } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'UTASVotes <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `UTASVotes: Account Update for ${data[0].full_name}`,
        html: emailHtml,
      });

      if (emailError) {
        console.warn('⚠️ Email error:', emailError);
        console.warn('⚠️ Failed to send email notification, but user was updated');
      } else {
        console.log('✅ Email notification sent successfully');
      }
    } catch (emailError) {
      console.warn('⚠️ Email notification error:', emailError);
      // Don't fail the whole request if email fails
    }

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
