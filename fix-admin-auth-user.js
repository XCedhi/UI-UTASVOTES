const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminUser() {
  console.log('\n🔧 Fixing Admin User...\n');

  const adminEmail = 'admin@cktutas.edu.gh';
  const adminPassword = 'Admin@2026';
  const adminProfileId = '3a5cad6a-c735-4e2f-bc32-109d3de76850';

  // Step 1: Create admin user in auth.users with the correct ID
  console.log('1️⃣ Creating admin user in auth.users...');
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: 'System Administrator'
    }
  });

  if (authError) {
    console.error('❌ Error creating auth user:', authError);
    
    // If user already exists, try to update the profile to match
    console.log('\n2️⃣ User might already exist, checking...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers.users.find(u => u.email === adminEmail);
    
    if (existingAdmin) {
      console.log(`✅ Found existing admin user with ID: ${existingAdmin.id}`);
      console.log('3️⃣ Updating user_profiles to match auth user ID...');
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ id: existingAdmin.id })
        .eq('email', adminEmail);
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
      } else {
        console.log('✅ Profile updated successfully!');
      }
    }
  } else {
    console.log(`✅ Admin user created with ID: ${authUser.user.id}`);
    
    // Step 2: Update the profile to match the new auth user ID
    console.log('\n2️⃣ Updating user_profiles to match new auth user...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ id: authUser.user.id })
      .eq('email', adminEmail);
    
    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
    } else {
      console.log('✅ Profile updated successfully!');
    }
  }

  // Step 3: Test login
  console.log('\n3️⃣ Testing admin login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (loginError) {
    console.error('❌ Login test failed:', loginError.message);
  } else {
    console.log('✅ Admin login successful!');
    await supabase.auth.signOut();
  }

  console.log('\n✅ Admin user fix complete!\n');
}

fixAdminUser().catch(console.error);
