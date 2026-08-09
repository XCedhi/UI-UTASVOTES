import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/server-auth';
import { isEmailConfigured, sendWelcomeEmail } from '@/lib/email';

interface StudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  program: string;
  phoneNumber?: string;
}

// Generate a secure random password that meets all Supabase requirements
function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one character from each required set
  let password = '';
  
  // Add one random character from each required set
  const getRandomChar = (charset: string): string => {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
  };
  
  password += getRandomChar(lowercase);
  password += getRandomChar(uppercase);
  password += getRandomChar(numbers);
  password += getRandomChar(special);
  
  // Fill the rest with random characters from all sets
  const allChars = lowercase + uppercase + numbers + special;
  const remainingLength = 12 - 4; // Total length 12, already have 4 chars
  
  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password to avoid predictable pattern
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
}

export async function POST(request: Request) {
  try {
    // Server-side authorization: only admin or commission may import students
    await requireRole(request, ['admin', 'commission']);

    const { students } = await request.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No student data provided' },
        { status: 400 }
      );
    }

    // Verify environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Supabase URL not set' },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Service role key not set. Please restart the dev server.' },
        { status: 500 }
      );
    }

    console.log('✅ Environment variables loaded');
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Service role key present:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No');

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

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [] as any[],
      createdStudents: [] as any[],
      email: {
        configured: isEmailConfigured(),
        delivered: 0,
        failed: 0,
      },
    };

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const student: StudentData = students[i];
      
      try {
        // Generate secure password
        const password = generateSecurePassword();

        // Duplicate detection before creating anything
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id, email, student_id')
          .or(`student_id.eq.${student.studentId},email.eq.${student.email}`)
          .maybeSingle();

        if (existingProfile) {
          results.duplicates++;
          results.failed++;
          results.errors.push({
            row: i + 2,
            studentId: student.studentId,
            email: student.email,
            error: `Duplicate: a user with this student ID or email already exists (${
              existingProfile.email || existingProfile.student_id
            })`
          });
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: `${student.firstName} ${student.lastName}`,
            student_id: student.studentId,
            role: 'student'
          }
        });

        if (authError) {
          const isDuplicate =
            authError.code === 'user_already_exists' ||
            /already (registered|exists)/i.test(authError.message || '');
          if (isDuplicate) results.duplicates++;
          console.error(`Error creating auth user for ${student.email}:`, authError.message);
          results.failed++;
          results.errors.push({
            row: i + 2,
            studentId: student.studentId,
            email: student.email,
            error: isDuplicate
              ? 'Duplicate: this email is already registered'
              : authError.message
          });
          continue;
        }

        // Create user profile with password change requirement
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: student.email,
            full_name: `${student.firstName} ${student.lastName}`,
            student_id: student.studentId,
            phone: student.phoneNumber || null,
            department: student.department,
            level: student.level,
            program: student.program,
            role: 'student',
            status: 'active',
            requires_password_change: true, // Force password change on first login
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Error creating profile for ${student.email}:`, {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            fullError: profileError
          });
          // Delete the auth user if profile creation fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          results.failed++;
          results.errors.push({
            row: i + 2,
            studentId: student.studentId,
            email: student.email,
            error: `Failed to create user profile: ${profileError.message || profileError.code || 'Unknown error'}`
          });
          continue;
        }

        // Send welcome email with temporary password (primary delivery channel)
        try {
          const emailResult = await sendWelcomeEmail({
            to: student.email,
            fullName: `${student.firstName} ${student.lastName}`,
            studentId: student.studentId,
            department: student.department,
            program: student.program,
            temporaryPassword: password
          });

          if (emailResult.delivered) {
            results.email.delivered++;
          } else {
            results.email.failed++;
            console.warn(
              `Email not delivered to ${student.email} (via ${emailResult.via}); fallback credentials sheet available`
            );
          }
        } catch (emailError) {
          results.email.failed++;
          console.warn(`Error sending welcome email to ${student.email}:`, emailError);
          // Don't fail the import if email fails
        }

        results.success++;
        // Credentials are returned exactly once so the admin/commission screen
        // can offer the one-time fallback credentials sheet download.
        results.createdStudents.push({
          studentId: student.studentId,
          email: student.email,
          name: `${student.firstName} ${student.lastName}`,
          password: password
        });

      } catch (error: any) {
        console.error(`Error processing student ${student.studentId}:`, error);
        results.failed++;
        results.errors.push({
          row: i + 2,
          studentId: student.studentId,
          email: student.email,
          error: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to import students',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
