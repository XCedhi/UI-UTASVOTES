const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('Creating Electoral Commission user in Supabase...\n');

  // Commission user details
  const commissionEmail = 'commission@cktutas.edu.gh';
  const commissionPassword = 'Commission@2026';
  const commissionName = 'Electoral Commission';

  try {
    // Step 1: Check if user already exists in auth
    console.log('Step 1: Checking if user exists in auth.users...');
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers.users.find(u => u.email === commissionEmail);

    let userId;

    if (existingAuthUser) {
      console.log('✅ User already exists in auth.users');
      console.log('   User ID:', existingAuthUser.id);
      userId = existingAuthUser.id;

      // Update password
      console.log('\nUpdating password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: commissionPassword }
      );
      if (updateError) {
        console.log('⚠️  Password update error:', updateError.message);
      } else {
        console.log('✅ Password updated');
      }
    } else {
      // Step 2: Create user in auth.users
      console.log('Creating new user in auth.users...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: commissionEmail,
        password: commissionPassword,
        email_confirm: true,
        user_metadata: {
          full_name: commissionName,
          role: 'commission'
        }
      });

      if (authError) {
        console.error('❌ Error creating auth user:', authError);
        return;
      }

      userId = authData.user.id;
      console.log('✅ Auth user created');
      console.log('   User ID:', userId);
    }

    // Step 3: Check if profile exists
    console.log('\nStep 2: Checking user_profiles...');
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('✅ Profile exists, updating role to commission...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: 'commission',
          full_name: commissionName,
          email: commissionEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
      } else {
        console.log('✅ Profile updated to commission role');
      }
    } else {
      // Step 4: Create profile
      console.log('Creating profile in user_profiles...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: commissionEmail,
          full_name: commissionName,
          role: 'commission',
          student_id: null,
          department: null,
          phone_number: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        return;
      }

      console.log('✅ Profile created with commission role');
    }

    // Step 5: Verify the user
    console.log('\nStep 3: Verifying commission user...');
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && profile.role === 'commission') {
      console.log('✅ Commission user verified successfully!\n');
      console.log('═══════════════════════════════════════');
      console.log('COMMISSION LOGIN CREDENTIALS');
      console.log('═══════════════════════════════════════');
      console.log('Email:    ', commissionEmail);
      console.log('Password: ', commissionPassword);
      console.log('Role:     ', profile.role);
      console.log('Name:     ', profile.full_name);
      console.log('User ID:  ', profile.id);
      console.log('═══════════════════════════════════════\n');
      console.log('✅ You can now login with these credentials!');
      console.log('   The user will be redirected to: /electoral-commission-panel');
    } else {
      console.error('❌ Verification failed - profile not found or role incorrect');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
})();
