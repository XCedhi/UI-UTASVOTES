const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetCommissionPassword() {
  console.log('\n🔧 Resetting Commission User Password...\n');

  const email = 'commission@cktutas.edu.gh';
  const newPassword = 'Commission@2026';

  try {
    // Get the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found:', email);
      console.log('\n📋 Available users:');
      users.forEach(u => console.log(`   - ${u.email}`));
      return;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Update the user's password
    console.log('\n🔑 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }

    console.log('✅ Password updated successfully!');
    
    // Test the new password
    console.log('\n🧪 Testing new password...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: newPassword,
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      await supabase.auth.signOut();
    }

    console.log('\n✅ Commission password reset complete!');
    console.log('\n📝 New credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n🌐 Try logging in at: http://localhost:4028/login\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetCommissionPassword().catch(console.error);
