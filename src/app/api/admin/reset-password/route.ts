import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/server-auth';
import { isEmailConfigured, sendWelcomeEmail } from '@/lib/email';

// Service-role client for writes (bypasses RLS)
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

function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = lowercase + uppercase + numbers + special;

  const getRandomChar = (charset: string): string => {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
  };

  let password = '';
  password += getRandomChar(lowercase);
  password += getRandomChar(uppercase);
  password += getRandomChar(numbers);
  password += getRandomChar(special);

  for (let i = 0; i < 8; i++) {
    password += getRandomChar(allChars);
  }

  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

/**
 * POST /api/admin/reset-password
 * Admin-only. Resets a user's password, forces a password change on their
 * next login, and emails the new temporary password.
 */
export async function POST(request: NextRequest) {
  try {
    // Only admins may reset passwords
    await requireRole(request, ['admin']);

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, department, program, student_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const temporaryPassword = generateSecurePassword();

    // Update the Supabase Auth password
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
    });

    if (authError) {
      console.error('Error resetting password:', authError);
      return NextResponse.json(
        { error: `Failed to reset password: ${authError.message}` },
        { status: 500 }
      );
    }

    // Force a password change on next login
    const { error: flagError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        requires_password_change: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (flagError) {
      console.warn('Error setting requires_password_change flag:', flagError);
    }

    // Send the temporary password to the user (primary delivery channel)
    const emailResult = await sendWelcomeEmail({
      to: profile.email,
      fullName: profile.full_name || 'Student',
      studentId: profile.student_id || '',
      department: profile.department || '',
      program: profile.program || '',
      temporaryPassword,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.delivered
        ? 'Password reset and emailed to the user'
        : 'Password reset. Email could not be delivered — share the temporary password directly.',
      emailDelivered: emailResult.delivered,
      emailVia: emailResult.via,
      // Fallback: only exposed when real email delivery is unavailable
      ...(isEmailConfigured() ? {} : { temporaryPassword }),
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to reset password';
    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.startsWith('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
