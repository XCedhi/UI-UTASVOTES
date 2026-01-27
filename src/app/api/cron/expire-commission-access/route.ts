import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key
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
 * Cron job to automatically downgrade expired commission members
 * This should be called daily by a cron service (Vercel Cron, GitHub Actions, etc.)
 * 
 * Security: Verify the request is from your cron service using CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting commission access expiry check...');

    // Find all commission members with expired access
    const { data: expiredUsers, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('role', 'commission')
      .not('access_end_date', 'is', null)
      .lt('access_end_date', new Date().toISOString());

    if (fetchError) {
      console.error('❌ Error fetching expired users:', fetchError);
      return NextResponse.json(
        { error: 'Database error', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!expiredUsers || expiredUsers.length === 0) {
      console.log('✅ No expired commission members found');
      return NextResponse.json({
        success: true,
        message: 'No expired commission members',
        processed: 0,
      });
    }

    console.log(`📋 Found ${expiredUsers.length} expired commission members`);

    const results = {
      total: expiredUsers.length,
      downgraded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expired user
    for (const user of expiredUsers) {
      try {
        console.log(`⏰ Processing expired user: ${user.email}`);

        // Downgrade to student
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            role: 'student',
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`❌ Failed to downgrade ${user.email}:`, updateError);
          results.failed++;
          results.errors.push(`${user.email}: ${updateError.message}`);
          continue;
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
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                         style="display: inline-block; background-color: #F2B807; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600;">
                        Log In to UTASVotes
                      </a>
                    </div>
                    <p style="margin: 24px 0 0 0; color: #6B7280; font-size: 14px;">
                      Thank you for your service as an Electoral Commission member.
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

          console.log(`✅ Email sent to ${user.email}`);
        } catch (emailError) {
          console.warn(`⚠️ Failed to send email to ${user.email}:`, emailError);
          // Don't fail the whole process if email fails
        }

        results.downgraded++;
        console.log(`✅ Successfully downgraded ${user.email}`);
      } catch (error: any) {
        console.error(`❌ Error processing ${user.email}:`, error);
        results.failed++;
        results.errors.push(`${user.email}: ${error.message}`);
      }
    }

    console.log('✅ Commission expiry check completed');
    console.log(`📊 Results: ${results.downgraded} downgraded, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Commission expiry check completed',
      results,
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
