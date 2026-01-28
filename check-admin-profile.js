// Script to check and verify admin profile data in database
// Run this with: node check-admin-profile.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminProfile() {
  try {
    console.log('🔍 Checking admin profile data...\n');

    // Get admin user from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }

    const adminUser = users.find(u => u.email === 'admin@cktutas.edu.gh');
    
    if (!adminUser) {
      console.error('❌ Admin user not found in auth.users');
      return;
    }

    console.log('✅ Admin user found in auth:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('');

    // Check user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
      console.log('');
      console.log('🔧 Creating profile for admin user...');
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: adminUser.id,
          email: adminUser.email,
          full_name: 'System Administrator',
          role: 'admin',
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError.message);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('   Profile:', newProfile);
      }
    } else {
      console.log('✅ Admin profile found:');
      console.log('   ID:', profile.id);
      console.log('   Email:', profile.email);
      console.log('   Full Name:', profile.full_name);
      console.log('   Role:', profile.role);
      console.log('   Avatar URL:', profile.avatar_url || 'Not set');
      console.log('   Profile Picture URL:', profile.profile_picture_url || 'Not set');
      console.log('   Status:', profile.status);
    }

    console.log('');

    // Check notifications
    const { count, error: notifError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', adminUser.id)
      .eq('is_read', false);

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError.message);
    } else {
      console.log('🔔 Unread notifications:', count || 0);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkAdminProfile();
