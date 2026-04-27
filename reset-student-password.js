require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Generate a secure random password that meets all Supabase requirements
function generateSecurePassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one character from each required set
  let password = '';
  
  // Add one random character from each required set
  const getRandomChar = (charset) => {
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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function resetStudentPassword() {
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Please provide a student email address');
    console.log('Usage: node reset-student-password.js <email>');
    console.log('Example: node reset-student-password.js student@cktutas.edu.gh');
    process.exit(1);
  }

  console.log(`🔄 Resetting password for: ${email}\n`);

  try {
    // Get student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.log('❌ Student not found in database');
      process.exit(1);
    }

    console.log('✅ Student found:');
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Student ID: ${profile.student_id}`);
    console.log(`   Department: ${profile.department || 'N/A'}`);
    console.log(`   Role: ${profile.role}\n`);

    // Generate new temporary password
    const newPassword = generateSecurePassword();

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );

    if (updateError) {
      console.log('❌ Error updating password:', updateError.message);
      process.exit(1);
    }

    // Set requires_password_change flag
    const { error: flagError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        requires_password_change: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (flagError) {
      console.log('⚠️  Warning: Could not set password change flag:', flagError.message);
    }

    console.log('✅ Password reset successfully!\n');
    console.log('═'.repeat(60));
    console.log('📧 LOGIN CREDENTIALS');
    console.log('═'.repeat(60));
    console.log(`Email:    ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log('═'.repeat(60));
    console.log('\n⚠️  Student will be required to change this password on first login.\n');
    console.log('💡 Copy the password above to login as this student.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

resetStudentPassword();
