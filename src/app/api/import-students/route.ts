import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

// Generate a secure random password
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

export async function POST(request: Request) {
  try {
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
      errors: [] as any[],
      createdStudents: [] as any[]
    };

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const student: StudentData = students[i];
      
      try {
        // Generate secure password
        const password = generateSecurePassword();

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
          console.error(`Error creating auth user for ${student.email}:`, authError);
          results.failed++;
          results.errors.push({
            row: i + 2,
            studentId: student.studentId,
            email: student.email,
            error: authError.message
          });
          continue;
        }

        // Create user profile
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
            role: 'student',
            status: 'active',
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

        // TODO: Send welcome email with password
        // For now, we'll just log it (in production, use an email service)
        console.log(`Created account for ${student.email} with password: ${password}`);

        results.success++;
        results.createdStudents.push({
          studentId: student.studentId,
          email: student.email,
          name: `${student.firstName} ${student.lastName}`,
          password: password // In production, don't return this - send via email instead
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
