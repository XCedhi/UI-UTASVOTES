const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAllPasswords() {
  console.log('\n🔧 Resetting All User Passwords After Supabase Resume...\n');

  const users = [
    { email: 'commission@cktutas.edu.gh', password: 'Commission@2026', role: 'commission' },
    { email: 'admin@cktutas.edu.gh', password: 'Admin@2026', role: 'admin' },
    { email: 'student@cktutas.edu.gh', password: 'Student@2026', role: 'student' },
  ];

  for (const userInfo of users) {
    console.log(`\n📧 Processing: ${userInfo.email}`);
    
    try {
      // Check if user exists
      const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error listing users:', listError);
        continue;
      }

      let user = existingUsers.find(u => u.email === userInfo.email);
      
      if (!user) {
        // Create user if doesn't exist
        console.log(`   ➕ Creating new user...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: userInfo.email,
          password: userInfo.password,
          email_confirm: true,
          user_metadata: {
            role: userInfo.role,
            full_name: userInfo.role === 'admin' ? 'System Administrator' : 
                      userInfo.role === 'commission' ? 'Electoral Commission' : 'Student User'
          }
        });

        if (createError) {
          console.error(`   ❌ Error creating user:`, createError.message);
          continue;
        }

        user = newUser.user;
        console.log(`   ✅ User created with ID: ${user.id}`);
        
        // Update profile role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: userInfo.email,
            role: userInfo.role,
            full_name: user.user_metadata.full_name,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error(`   ⚠️  Profile update warning:`, profileError.message);
        } else {
          console.log(`   ✅ Profile created/updated`);
        }
      } else {
        // Update existing user's password
        console.log(`   🔑 Updating password for existing user...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: userInfo.password }
        );

        if (updateError) {
          console.error(`   ❌ Error updating password:`, updateError.message);
          continue;
        }

        console.log(`   ✅ Password updated`);
        
        // Ensure profile exists and has correct role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: userInfo.email,
            role: userInfo.role,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });
        
        if (profileError) {
          console.error(`   ⚠️  Profile update warning:`, profileError.message);
        } else {
          console.log(`   ✅ Profile verified`);
        }
      }

      // Test login
      console.log(`   🧪 Testing login...`);
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: userInfo.password,
      });

      if (loginError) {
        console.error(`   ❌ Login test failed:`, loginError.message);
      } else {
        console.log(`   ✅ Login test successful!`);
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error.message);
    }
  }

  console.log('\n\n✅ Password Reset Complete!\n');
  console.log('📝 Updated Credentials:\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ COMMISSION                                              │');
  console.log('│ Email: commission@cktutas.edu.gh                        │');
  console.log('│ Password: Commission@2026                               │');
  console.log('│ Dashboard: /electoral-commission-panel                  │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ ADMIN                                                   │');
  console.log('│ Email: admin@cktutas.edu.gh                             │');
  console.log('│ Password: Admin@2026                                    │');
  console.log('│ Dashboard: /admin-dashboard                             │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ STUDENT                                                 │');
  console.log('│ Email: student@cktutas.edu.gh                           │');
  console.log('│ Password: Student@2026                                  │');
  console.log('│ Dashboard: /student-dashboard                           │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('\n🌐 Login at: http://localhost:4028/login\n');
}

resetAllPasswords().catch(console.error);
