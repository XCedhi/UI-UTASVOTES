require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Commission user credentials from DEFAULT_LOGIN_CREDENTIALS.md
const COMMISSION_EMAIL = 'commission@cktutas.edu.gh';
const COMMISSION_PASSWORD = 'Commission@2026';

async function testWithCommissionAuth() {
  console.log('🔍 Testing with Commission User Authentication...\n');

  const supabase = createClient(supabaseUrl, anonKey);

  // Step 1: Sign in as commission user
  console.log('Step 1: Signing in as commission user...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: COMMISSION_EMAIL,
    password: COMMISSION_PASSWORD,
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }

  console.log('✅ Logged in successfully');
  console.log(`   User ID: ${authData.user.id}`);
  console.log(`   Email: ${authData.user.email}`);

  // Step 2: Check user profile and role
  console.log('\nStep 2: Checking user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile fetch failed:', profileError.message);
  } else {
    console.log('✅ Profile found');
    console.log(`   Role: ${profile.role}`);
    console.log(`   Name: ${profile.full_name}`);
  }

  // Step 3: Fetch candidates (this is what the commission panel does)
  console.log('\nStep 3: Fetching candidates as authenticated commission user...');
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (candidatesError) {
    console.error('❌ Candidates fetch failed:', candidatesError);
    console.error('   Code:', candidatesError.code);
    console.error('   Message:', candidatesError.message);
    console.error('   Details:', candidatesError.details);
    console.error('   Hint:', candidatesError.hint);
    
    console.log('\n⚠️ RLS POLICY ISSUE DETECTED!');
    console.log('The commission user cannot read candidates even when authenticated.');
    console.log('\nPossible causes:');
    console.log('1. RLS policy is checking for role but user_profiles.role is not "commission"');
    console.log('2. RLS policy syntax error');
    console.log('3. Policy was not created successfully');
  } else {
    console.log(`✅ SUCCESS: Found ${candidates?.length || 0} candidates`);
    
    if (candidates && candidates.length > 0) {
      console.log('\n📋 Applications visible to commission user:');
      candidates.forEach((app, index) => {
        console.log(`\n${index + 1}. ${app.name || app.full_name}`);
        console.log(`   Student ID: ${app.student_id}`);
        console.log(`   Position: ${app.position}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Election ID: ${app.election_id}`);
      });
      
      console.log('\n✅ RLS is working correctly!');
      console.log('Applications should show in commission panel.');
      console.log('\nIf they still don\'t show:');
      console.log('1. Clear browser cache completely');
      console.log('2. Hard refresh (Ctrl + Shift + R)');
      console.log('3. Log out and log back in');
      console.log('4. Check browser console for JavaScript errors');
    } else {
      console.log('\n⚠️ No candidates found in database');
      console.log('This means either:');
      console.log('1. No applications have been submitted');
      console.log('2. Applications were deleted');
      console.log('3. RLS is filtering them out');
    }
  }

  // Step 4: Sign out
  await supabase.auth.signOut();
  console.log('\n✅ Test complete');
}

testWithCommissionAuth();
