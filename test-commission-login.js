const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use anon key like the browser does
);

(async () => {
  console.log('Testing Commission Login (as browser would)...\n');

  const email = 'commission@cktutas.edu.gh';
  const password = 'Commission@2026';

  try {
    // Step 1: Attempt login
    console.log('Step 1: Attempting login with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // Step 2: Fetch profile
    console.log('\nStep 2: Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
      return;
    }

    console.log('✅ Profile loaded successfully!');
    console.log('   Name:', profile.full_name);
    console.log('   Role:', profile.role);
    console.log('   Email:', profile.email);

    // Step 3: Determine redirect
    console.log('\nStep 3: Determining redirect...');
    let dashboard;
    switch (profile.role) {
      case 'admin':
        dashboard = '/admin-dashboard';
        break;
      case 'commission':
        dashboard = '/electoral-commission-panel';
        break;
      case 'student':
      case 'candidate':
      default:
        dashboard = '/student-dashboard';
    }

    console.log('✅ User should be redirected to:', dashboard);

    // Step 4: Sign out
    console.log('\nStep 4: Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n═══════════════════════════════════════');
    console.log('✅ COMMISSION LOGIN TEST PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('You can now login at: http://localhost:4028/login');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Expected: Redirect to', dashboard);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
})();
