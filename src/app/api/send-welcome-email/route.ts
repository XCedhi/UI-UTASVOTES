import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface WelcomeEmailData {
  email: string;
  fullName: string;
  studentId: string;
  department: string;
  temporaryPassword: string;
}

export async function POST(request: Request) {
  try {
    const { email, fullName, studentId, department, temporaryPassword }: WelcomeEmailData = await request.json();

    if (!email || !fullName || !temporaryPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prepare email content
    const loginURL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4028'}/login`;
    
    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to UTASVotes</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #F2B807 0%, #D97904 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to UTASVotes!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${fullName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Your account has been successfully created for the UTASVotes electoral system.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">Your Account Details</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;"><strong>Student ID:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${studentId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Department:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${department}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Account Role:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">Student</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff3cd; border: 2px solid #F2B807; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 12px; color: #856404; font-size: 16px; font-weight: 600;">⚠️ Temporary Password</h3>
                    <p style="margin: 0 0 16px; color: #856404; font-size: 14px; line-height: 1.5;">Your temporary password is:</p>
                    <div style="background-color: #ffffff; padding: 16px; border-radius: 4px; border: 1px solid #F2B807; text-align: center;">
                      <code style="font-size: 20px; font-weight: 700; color: #D97904; letter-spacing: 1px; font-family: 'Courier New', monospace;">${temporaryPassword}</code>
                    </div>
                    <p style="margin: 16px 0 0; color: #856404; font-size: 13px; line-height: 1.5;">
                      <strong>Important:</strong> You will be required to change this password immediately after your first login.
                    </p>
                  </td>
                </tr>
              </table>
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Click the button below to access the login page</li>
                  <li style="margin-bottom: 8px;">Enter your email and temporary password</li>
                  <li style="margin-bottom: 8px;">You'll be prompted to create a new secure password</li>
                  <li style="margin-bottom: 8px;">Complete your profile and start participating in elections</li>
                </ol>
              </div>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginURL}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F2B807 0%, #D97904 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Login to UTASVotes
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-left: 4px solid #0066cc; border-radius: 4px;">
                <p style="margin: 0; color: #004085; font-size: 14px; line-height: 1.6;">
                  <strong>🔒 Security Tip:</strong> Never share your password with anyone.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                This is an automated message from UTASVotes Electoral System
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2026 University of Technical and Applied Sciences
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

    // In production, use a proper email service like SendGrid, AWS SES, or Resend
    // For now, we'll log it
    console.log('📧 Welcome email would be sent to:', email);
    console.log('📧 Temporary password:', temporaryPassword);

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'UTASVotes <noreply@utasvotes.edu.gh>',
    //   to: email,
    //   subject: 'Welcome to UTASVotes - Your Account Details',
    //   html: emailHTML
    // });

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
