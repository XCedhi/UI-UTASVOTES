import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, newRole, newStatus, accessStartDate, accessEndDate } = body;

    if (!email || !name || !newRole || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format role name for display
    const roleDisplay = newRole === 'commission' 
      ? 'Electoral Commission Member' 
      : newRole.charAt(0).toUpperCase() + newRole.slice(1);

    // Format status for display
    const statusDisplay = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    // Build email content based on role and status
    let accessInfo = '';
    if (newRole === 'commission' && accessStartDate && accessEndDate) {
      const startDate = new Date(accessStartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const endDate = new Date(accessEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      accessInfo = `
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400E; font-weight: 600;">⏰ Time-Bound Access</p>
          <p style="margin: 8px 0 0 0; color: #92400E;">
            Your commission access is valid from <strong>${startDate}</strong> to <strong>${endDate}</strong>.
            After this period, your account will automatically revert to student role.
          </p>
        </div>
      `;
    }

    // Status-specific message
    let statusMessage = '';
    if (newStatus === 'inactive') {
      statusMessage = `
        <div style="background-color: #FEE2E2; border-left: 4px solid #DC2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991B1B; font-weight: 600;">⚠️ Account Deactivated</p>
          <p style="margin: 8px 0 0 0; color: #991B1B;">
            Your account has been deactivated. You will not be able to access the system until it is reactivated.
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      `;
    } else if (newStatus === 'active') {
      statusMessage = `
        <div style="background-color: #D1FAE5; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #065F46; font-weight: 600;">✅ Account Active</p>
          <p style="margin: 8px 0 0 0; color: #065F46;">
            Your account is now active. You can log in and access all features available to your role.
          </p>
        </div>
      `;
    }

    // Build notification banner for development mode
    let devModeBanner = '';
    if (process.env.NODE_ENV !== 'production' && recipientEmail !== email) {
      devModeBanner = `
        <tr>
          <td style="background-color: #FEF3C7; padding: 16px; text-align: center; border-bottom: 2px solid #F59E0B;">
            <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
              🔧 DEVELOPMENT MODE: This email was intended for <strong>${email}</strong>
            </p>
            <p style="margin: 4px 0 0 0; color: #92400E; font-size: 12px;">
              In production, emails will be sent to actual user addresses after domain verification.
            </p>
          </td>
        </tr>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Update - UTASVotes</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  ${devModeBanner}

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #F2B807 0%, #D97904 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">UTASVotes</h1>
                      <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 16px; opacity: 0.9;">University Electoral System</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Account Update Notification</h2>
                      
                      <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${name}</strong>,
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Your UTASVotes account has been updated by a system administrator. Here are the details of the changes:
                      </p>

                      <!-- Update Details Box -->
                      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #6B7280; font-size: 14px; font-weight: 600; padding: 8px 0;">NEW ROLE:</td>
                            <td style="color: #111827; font-size: 16px; font-weight: 600; padding: 8px 0; text-align: right;">${roleDisplay}</td>
                          </tr>
                          <tr>
                            <td style="color: #6B7280; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #E5E7EB;">ACCOUNT STATUS:</td>
                            <td style="color: #111827; font-size: 16px; font-weight: 600; padding: 8px 0; text-align: right; border-top: 1px solid #E5E7EB;">${statusDisplay}</td>
                          </tr>
                        </table>
                      </div>

                      ${statusMessage}
                      ${accessInfo}

                      <!-- Important Notice -->
                      <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #1E40AF; font-weight: 600;">📌 Important</p>
                        <p style="margin: 8px 0 0 0; color: #1E40AF;">
                          Please <strong>log out and log back in</strong> for these changes to take effect. Your new role and permissions will be applied after you sign in again.
                        </p>
                      </div>

                      <!-- Login Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                           style="display: inline-block; background-color: #F2B807; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Log In to UTASVotes
                        </a>
                      </div>

                      <p style="margin: 24px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions about these changes or believe this update was made in error, please contact the system administrator immediately.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9FAFB; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">
                        University of Technical and Applied Sciences (UTAS)
                      </p>
                      <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Determine recipient email
    // In development/testing: Send to admin email (Resend free tier restriction)
    // In production: Send to actual user email (requires verified domain)
    const recipientEmail = process.env.NODE_ENV === 'production' 
      ? email 
      : process.env.ADMIN_NOTIFICATION_EMAIL || email;

    console.log(`📧 Sending email to: ${recipientEmail} (original: ${email})`);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'UTASVotes <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `UTASVotes: Account Update for ${name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Role update email sent:', data);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error('❌ Email API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
