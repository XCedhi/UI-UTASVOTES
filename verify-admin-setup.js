/**
 * Verify Admin User Setup
 * 
 * This script checks if the admin user is properly configured
 * Run with: node verify-admin-setup.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (value) {
      envVars[key] = value;
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAdminSetup() {
  console.log('\n🔍 Verifying Admin User Setup...\n');
  console.log('=' .repeat(60));

  try {
    // Check 1: Auth user exists
    console.log('\n1️⃣ Checking auth.users...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at, created_at')
      .eq('email', 'admin@cktutas.edu.gh');

    if (authError) {
      console.error('❌ Error querying auth.users:', authError.message);
      console.log('💡 Try running the query directly in Supabase SQL Editor');
      return;
    }

    if (!authUsers || authUsers.length === 0) {
      console.log('❌ Admin user NOT found in auth.users');
      console.log('📋 Action: Create user via Supabase Dashboard → Authentication → Users');
      console.log('   Email: admin@cktutas.edu.gh');
      console.log('   Password: Admin@2026');
      console.log('   ✅ Check "Auto Confirm User"');
      return;
    }

    const authUser = authUsers[0];
    console.log('✅ Admin user found in auth.users');
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}`);
    console.log(`   Confirmed: ${authUser.email_confirmed_at ? '✅ Yes' : '❌ No'}`);

    // Check 2: User profile exists
    console.log('\n2️⃣ Checking user_profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, status')
      .eq('email', 'admin@cktutas.edu.gh')
      .single();

    if (profileError || !profile) {
      console.log('❌ Profile NOT found in user_profiles');
      console.log('📋 Action: Run this SQL in Supabase Dashboard:');
      console.log(`
INSERT INTO public.user_profiles (
  id, email, full_name, role, status, created_at, updated_at
) VALUES (
  '${authUser.id}',
  'admin@cktutas.edu.gh',
  'System Administrator',
  'admin',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();
      `);
      return;
    }

    console.log('✅ Profile found in user_profiles');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   Status: ${profile.status}`);

    // Check 3: IDs match
    console.log('\n3️⃣ Checking ID consistency...');
    if (authUser.id === profile.id) {
      console.log('✅ IDs match perfectly!');
    } else {
      console.log('❌ IDs DO NOT match!');
      console.log(`   Auth ID: ${authUser.id}`);
      console.log(`   Profile ID: ${profile.id}`);
      console.log('📋 Action: Delete profile and recreate with correct ID');
      return;
    }

    // Check 4: Test authentication
    console.log('\n4️⃣ Testing authentication...');
    console.log('⚠️  Cannot test password from server side');
    console.log('📋 Manual test required:');
    console.log('   1. Go to http://localhost:4028/login');
    console.log('   2. Enter: admin@cktutas.edu.gh / Admin@2026');
    console.log('   3. Check browser console (F12) for errors');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SETUP VERIFICATION COMPLETE\n');
    console.log('Status Summary:');
    console.log('  ✅ Auth user exists');
    console.log('  ✅ Profile exists');
    console.log('  ✅ IDs match');
    console.log(`  ${authUser.email_confirmed_at ? '✅' : '❌'} Email confirmed`);
    console.log(`  ${profile.role === 'admin' ? '✅' : '❌'} Admin role set`);
    console.log(`  ${profile.status === 'active' ? '✅' : '❌'} Status active`);

    console.log('\n📋 Next Steps:');
    console.log('  1. Ensure dev server is running: npm run dev');
    console.log('  2. Clear browser cache and cookies');
    console.log('  3. Go to: http://localhost:4028/login');
    console.log('  4. Login with: admin@cktutas.edu.gh / Admin@2026');
    console.log('  5. Check browser console (F12) for any errors');

    if (!authUser.email_confirmed_at) {
      console.log('\n⚠️  WARNING: Email not confirmed!');
      console.log('📋 Fix: Run this SQL in Supabase Dashboard:');
      console.log(`
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@cktutas.edu.gh';
      `);
    }

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n💥 Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run verification
verifyAdminSetup();
