import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

interface WelcomeEmailData {
  email: string;
  fullName: string;
  studentId: string;
  department: string;
  program?: string;
  temporaryPassword: string;
}

export async function POST(request: Request) {
  try {
    const { email, fullName, studentId, department, program, temporaryPassword }: WelcomeEmailData =
      await request.json();

    if (!email || !fullName || !temporaryPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Shared delivery helper: real email via Resend when RESEND_API_KEY is
    // set, otherwise the message is logged and `delivered: false` returned
    // so callers know to fall back to the one-time credentials sheet.
    const result = await sendWelcomeEmail({
      to: email,
      fullName,
      studentId,
      department,
      program,
      temporaryPassword,
    });

    return NextResponse.json({
      success: true,
      message: result.delivered
        ? 'Welcome email sent successfully'
        : 'Welcome email could not be delivered; use the fallback credentials sheet',
      delivered: result.delivered,
      via: result.via,
    });
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
