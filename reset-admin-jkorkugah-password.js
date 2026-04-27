const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAdminPassword() {
  console.log('\n🔧 Resetting Admin User Password (jkorkugah23)...\n');

  const email = 'jkorkugah23.stu@cktutas.edu.gh';
  const newPassword = 'Admin@2026';
  const userId = '3aaaaf74-a405-4bf6-8680-766f0cda4b8b';

  try {
    console.log(`📧 User: ${email}`);
    console.log(`🆔 ID: ${userId}`);
    
    // Update the user's password
    console.log('\n🔑 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }

    console.log('✅ Password updated successfully!');
    
    // Verify the profile has admin role
    console.log('\n📋 Verifying admin role...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log(`✅ Profile found:`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Name: ${profile.full_name || 'Not set'}`);
      
      if (profile.role !== 'admin') {
        console.log('\n⚠️  Role is not admin, updating...');
        const { error: updateRoleError } = await supabase
          .from('user_profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', userId);
        
        if (updateRoleError) {
          console.error('❌ Error updating role:', updateRoleError);
        } else {
          console.log('✅ Role updated to admin');
        }
      }
    }

    // Test login
    console.log('\n🧪 Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: newPassword,
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Admin login successful!');
      await supabase.auth.signOut();
    }

    console.log('\n✅ Admin password reset complete!\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN CREDENTIALS                                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│ Email: ${email.padEnd(43)} │`);
    console.log(`│ Password: ${newPassword.padEnd(43)} │`);
    console.log('│ Role: admin                                             │');
    console.log('│ Dashboard: /admin-dashboard                             │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🌐 Login at: http://localhost:4028/login\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetAdminPassword().catch(console.error);
