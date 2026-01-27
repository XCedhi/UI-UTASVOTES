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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking commission expiry for user:', userId);

    // Get user from database
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      console.error('❌ User not found:', fetchError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is commission and has expired access
    if (user.role === 'commission' && user.access_end_date) {
      const endDate = new Date(user.access_end_date);
      const now = new Date();

      if (now > endDate) {
        console.log('⏰ Commission access expired, downgrading to student');

        // Downgrade to student role
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            role: 'student',
            status: 'active',
            updated_at: new Date().toISOString(),
            // Keep access dates for audit trail
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Failed to downgrade user:', updateError);
          return NextResponse.json(
            { error: 'Failed to downgrade user' },
            { status: 500 }
          );
        }

        // Send email notification
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          const recipientEmail = process.env.NODE_ENV === 'production' 
            ? user.email 
            : process.env.ADMIN_NOTIFICATION_EMAIL || user.email;

          const devBanner = process.env.NODE_ENV !== 'production' && recipientEmail !== user.email
            ? `<div style="background-color: #FEF3C7; padding: 16px; text-align: center; border-bottom: 2px solid #F59E0B;">
                 <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
                   🔧 DEVELOPMENT MODE: This email was intended for <strong>${user.email}</strong>
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
                    <h2 style="margin: 0 0 16px 0; color: #111827;">Commission Access Expired</h2>
                    <p style="color: #4B5563;">Hello <strong>${user.full_name}</strong>,</p>
                    <p style="color: #4B5563;">Your Electoral Commission access period has ended and your account has been automatically downgraded to student role.</p>
                    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #92400E; font-weight: 600;">⏰ Access Period Ended</p>
                      <p style="margin: 8px 0 0 0; color: #92400E;">
                        Your commission access ended on <strong>${new Date(user.access_end_date).toLocaleDateString()}</strong>.
                      </p>
                    </div>
                    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                      <p style="margin: 0; color: #6B7280; font-size: 14px;">NEW ROLE: <strong style="color: #111827;">Student</strong></p>
                      <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 14px;">STATUS: <strong style="color: #111827;">Active</strong></p>
                    </div>
                    <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #1E40AF; font-weight: 600;">📌 What This Means</p>
                      <p style="margin: 8px 0 0 0; color: #1E40AF;">
                        You now have student access and can vote in elections, view results, and engage with campaign content.
                        You no longer have access to commission management features.
                      </p>
                    </div>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                         style="display: inline-block; background-color: #F2B807; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600;">
                        Log In to UTASVotes
                      </a>
                    </div>
                    <p style="margin: 24px 0 0 0; color: #6B7280; font-size: 14px;">
                      Thank you for your service as an Electoral Commission member. If you have any questions, please contact the system administrator.
                    </p>
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

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'UTASVotes <onboarding@resend.dev>',
            to: recipientEmail,
            subject: 'UTASVotes: Commission Access Expired',
            html: emailHtml,
          });

          console.log('✅ Expiry notification email sent');
        } catch (emailError) {
          console.warn('⚠️ Failed to send email:', emailError);
        }

        return NextResponse.json({
          expired: true,
          downgraded: true,
          newRole: 'student',
          message: 'Commission access expired, downgraded to student',
        });
      }
    }

    // No expiry or not commission
    return NextResponse.json({
      expired: false,
      downgraded: false,
      currentRole: user.role,
      message: 'Access is valid',
    });
  } catch (error: any) {
    console.error('❌ Error checking commission expiry:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
