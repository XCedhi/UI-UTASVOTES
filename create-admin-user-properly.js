const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  console.log('\n🔧 Creating Admin User Properly...\n');

  const adminEmail = 'admin@cktutas.edu.gh';
  const adminPassword = 'Admin@2026';

  try {
    // Step 1: Delete orphaned profile first
    console.log('1️⃣ Cleaning up orphaned profiles...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('email', adminEmail);
    
    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('   ⚠️  Delete warning:', deleteError.message);
    } else {
      console.log('   ✅ Cleanup complete');
    }

    // Step 2: Check if auth user already exists
    console.log('\n2️⃣ Checking for existing auth user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('   ❌ Error listing users:', listError);
      return;
    }

    let adminUser = users.find(u => u.email === adminEmail);
    
    if (adminUser) {
      console.log(`   ✅ Found existing auth user: ${adminUser.id}`);
      console.log('   🔑 Updating password...');
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: adminPassword }
      );
      
      if (updateError) {
        console.error('   ❌ Error updating password:', updateError);
        return;
      }
      console.log('   ✅ Password updated');
    } else {
      console.log('   ➕ Creating new auth user...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          full_name: 'System Administrator'
        }
      });

      if (createError) {
        console.error('   ❌ Error creating user:', createError);
        return;
      }

      adminUser = newUser.user;
      console.log(`   ✅ Auth user created: ${adminUser.id}`);
    }

    // Step 3: Create/update profile
    console.log('\n3️⃣ Creating user profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: adminUser.id,
        email: adminEmail,
        role: 'admin',
        full_name: 'System Administrator',
        student_id: null,
        department: null,
        level: null,
        phone: null,
        avatar_url: null,
        bio: 'System Administrator with full access',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('   ❌ Error creating profile:', profileError);
      return;
    }
    console.log('   ✅ Profile created');

    // Step 4: Test login
    console.log('\n4️⃣ Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (loginError) {
      console.error('   ❌ Login test failed:', loginError.message);
    } else {
      console.log('   ✅ Login test successful!');
      await supabase.auth.signOut();
    }

    // Step 5: Verify profile
    console.log('\n5️⃣ Verifying profile...');
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (fetchError) {
      console.error('   ❌ Error fetching profile:', fetchError);
    } else {
      console.log('   ✅ Profile verified:');
      console.log(`      ID: ${profile.id}`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Role: ${profile.role}`);
      console.log(`      Name: ${profile.full_name}`);
    }

    console.log('\n✅ Admin user setup complete!\n');
    console.log('📝 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Dashboard: /admin-dashboard');
    console.log('\n🌐 Login at: http://localhost:4028/login\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminUser().catch(console.error);
