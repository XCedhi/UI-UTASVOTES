const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseLogin() {
  console.log('\n🔍 Diagnosing Login Issue...\n');

  // Check all users in auth.users
  console.log('📋 Checking auth.users table:');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
  } else {
    console.log(`✅ Found ${authUsers.users.length} users in auth.users:`);
    authUsers.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
  }

  // Check user_profiles
  console.log('\n📋 Checking user_profiles table:');
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
  } else {
    console.log(`✅ Found ${profiles.length} profiles:`);
    profiles.forEach(profile => {
      console.log(`   - ${profile.email} | Role: ${profile.role} | ID: ${profile.id}`);
    });
  }

  // Test credentials
  console.log('\n🧪 Testing default credentials:');
  const testAccounts = [
    { email: 'admin@cktutas.edu.gh', password: 'Admin@2026', role: 'admin' },
    { email: 'commission@cktutas.edu.gh', password: 'Commission@2026', role: 'commission' },
    { email: 'student@cktutas.edu.gh', password: 'Student@2026', role: 'student' },
  ];

  for (const account of testAccounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) {
      console.log(`❌ ${account.role}: ${account.email} - FAILED (${error.message})`);
    } else {
      console.log(`✅ ${account.role}: ${account.email} - SUCCESS`);
      // Sign out immediately
      await supabase.auth.signOut();
    }
  }

  console.log('\n✅ Diagnosis complete!\n');
}

diagnoseLogin().catch(console.error);
