// Test student login directly with detailed logging
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://inogysmdiergapyvavbx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub2d5c21kaWVyZ2FweXZhdmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTI3MjgsImV4cCI6MjA4NDY4ODcyOH0.IfjghMUu9uSdQbWqb9EIuSxojcmkfikIEKEPHpc3PSA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔍 Testing student login...\n');

  const email = 'student@cktutas.edu.gh';
  const password = 'Student@2026';

  try {
    // Step 1: Attempt authentication
    console.log('Step 1: Attempting authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.error('Error details:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user data returned');
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('');

    // Step 2: Wait for session to establish
    console.log('Step 2: Waiting for session to establish...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Session wait complete\n');

    // Step 3: Fetch user profile
    console.log('Step 3: Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed!');
      console.error('Error message:', profileError.message);
      console.error('Error code:', profileError.code);
      console.error('Error details:', profileError.details);
      console.error('Error hint:', profileError.hint);
      console.error('Full error:', JSON.stringify(profileError, null, 2));
      
      // Try to fetch without RLS
      console.log('\n🔍 Attempting to check if profile exists (may fail due to RLS)...');
      const { data: allProfiles, error: allError } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .eq('email', email);
      
      if (allError) {
        console.error('❌ Cannot check profiles:', allError.message);
      } else {
        console.log('Profiles found:', allProfiles);
      }
      
      return;
    }

    if (!profile) {
      console.error('❌ No profile data returned (but no error either)');
      return;
    }

    console.log('✅ Profile fetched successfully!');
    console.log('Profile data:', JSON.stringify(profile, null, 2));
    console.log('\n🎉 Login test PASSED! Everything works correctly.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();
