/**
 * Shared email utilities for UTASVotes.
 *
 * Delivery strategy (approved):
 *  - Primary channel: real email via Resend (requires RESEND_API_KEY).
 *  - Fallback: the sender still gets a successful result with
 *    `via: 'log'` and the message is logged to the server console,
 *    while the UI offers a one-time downloadable credentials sheet.
 */

export interface EmailSendResult {
  delivered: boolean;
  via: 'resend' | 'log';
  messageId?: string;
  error?: string;
}

export interface WelcomeEmailData {
  to: string;
  fullName: string;
  studentId: string;
  department: string;
  program?: string;
  temporaryPassword: string;
}

export interface ResultsEmailData {
  to: string;
  fullName: string;
  electionName: string;
  /** Pre-rendered HTML rows describing each position's results. */
  resultsHtml: string;
  certifiedAt: string;
}

/** Base URL of the app for links inside emails. */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:4028'
  );
}

/** Whether a real email provider is configured. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResend() {
  const { Resend } = require('resend') as typeof import('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send an email. Uses Resend when RESEND_API_KEY is configured;
 * otherwise logs the message and reports `via: 'log'`.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailSendResult> {
  const { to, subject, html } = opts;

  if (!isEmailConfigured()) {
    console.log(`[email:log] To: ${to}`);
    console.log(`[email:log] Subject: ${subject}`);
    console.log('[email:log] Message (preview):', html.slice(0, 2000));
    return { delivered: false, via: 'log' };
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'UTASVotes <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.warn(`[email:resend] Failed to send to ${to}:`, error);
      return { delivered: false, via: 'resend', error: error.message };
    }

    return {
      delivered: true,
      via: 'resend',
      messageId: data?.id,
    };
  } catch (error: any) {
    console.warn(`[email:resend] Error sending to ${to}:`, error);
    return { delivered: false, via: 'resend', error: error.message || 'Unknown email error' };
  }
}

/** Build the branded welcome email HTML. */
export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const loginURL = `${getAppUrl()}/login`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                Hello <strong>${data.fullName}</strong>,
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
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.studentId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.to}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Department:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.department}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Program:</strong></td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.program || '—'}</td>
                      </tr>
                    </table>
                    <div style="margin: 24px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0 0 8px; color: #856404; font-size: 14px;"><strong>Temporary Password:</strong></p>
                      <p style="margin: 0; color: #333333; font-size: 20px; font-weight: 700; letter-spacing: 1px;">${data.temporaryPassword}</p>
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
                  <strong>&#128274; Security Tip:</strong> Never share your password with anyone.
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
                &copy; 2026 University of Technical and Applied Sciences
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Send a welcome email with temporary credentials. */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailSendResult> {
  const html = buildWelcomeEmailHtml(data);
  return sendEmail({
    to: data.to,
    subject: 'Welcome to UTASVotes - Your Account Details',
    html,
  });
}


/** Build the certified results email HTML. */
export function buildResultsEmailHtml(data: ResultsEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UTASVotes - Certified Election Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #F2B807 0%, #D97904 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">Certified Election Results</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${data.electionName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${data.fullName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                The Electoral Commission of UTAS has certified the final results for
                <strong>${data.electionName}</strong>. The certified results are presented below.
              </p>
              ${data.resultsHtml}
              <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-left: 4px solid #0066cc; border-radius: 4px;">
                <p style="margin: 0; color: #004085; font-size: 14px; line-height: 1.6;">
                  <strong>&#9989 Certified on:</strong> ${data.certifiedAt}
                </p>
              </div>
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                You can also view full details and candidate manifestos on the Student Results page.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                &copy; 2026 University of Technical and Applied Sciences - Electoral Commission
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Send certified results to a recipient. */
export async function sendResultsEmail(data: ResultsEmailData): Promise<EmailSendResult> {
  const html = buildResultsEmailHtml(data);
  return sendEmail({
    to: data.to,
    subject: `UTASVotes: Certified Results - ${data.electionName}`,
    html,
  });
}

