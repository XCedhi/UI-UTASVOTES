require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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

async function diagnoseStudentLogin() {
  const email = 'scoffie23.stu@cktutas.edu.gh';

  console.log('🔍 Diagnosing student account:', email);
  console.log('═'.repeat(60));

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.log('❌ Profile not found:', profileError?.message);
      return;
    }

    console.log('\n📋 USER PROFILE:');
    console.log('   ID:', profile.id);
    console.log('   Name:', profile.full_name);
    console.log('   Email:', profile.email);
    console.log('   Student ID:', profile.student_id);
    console.log('   Role:', profile.role);
    console.log('   Status:', profile.status);
    console.log('   Requires Password Change:', profile.requires_password_change);
    console.log('   Created:', profile.created_at);
    console.log('   Updated:', profile.updated_at);

    // Get auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError || !authUser) {
      console.log('\n❌ Auth user not found:', authError?.message);
      return;
    }

    console.log('\n🔐 AUTH USER:');
    console.log('   ID:', authUser.user.id);
    console.log('   Email:', authUser.user.email);
    console.log('   Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Last Sign In:', authUser.user.last_sign_in_at || 'Never');
    console.log('   Created:', authUser.user.created_at);
    console.log('   Updated:', authUser.user.updated_at);

    // Try to sign in with a test password to see what error we get
    console.log('\n🧪 TESTING LOGIN:');
    console.log('   Attempting to sign in...');
    
    const testPassword = 'TestPassword123!'; // User should provide their new password
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: email,
      password: testPassword
    });

    if (signInError) {
      console.log('   ❌ Sign in failed:', signInError.message);
      console.log('   Error code:', signInError.status);
    } else {
      console.log('   ✅ Sign in successful!');
      console.log('   Session exists:', !!signInData.session);
    }

    console.log('\n═'.repeat(60));
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (profile.requires_password_change) {
      console.log('   ⚠️  Password change flag is still TRUE');
      console.log('   → This means the password change didn\'t complete properly');
      console.log('   → Run: node reset-student-password.js', email);
      console.log('   → Then try the complete flow again');
    } else {
      console.log('   ✅ Password change flag is FALSE (correct)');
      console.log('   → The password was changed successfully');
      console.log('   → Make sure you\'re using the NEW password, not the temporary one');
      console.log('   → Clear browser cache/cookies and try again');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  process.exit(0);
}

diagnoseStudentLogin();
