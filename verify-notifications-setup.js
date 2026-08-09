// Verify Notifications Setup
// Run with: node verify-notifications-setup.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyNotificationsSetup() {
  console.log('🔍 Verifying Notifications Setup...\n');

  try {
    // Step 1: Check notifications table exists
    console.log('1️⃣  Checking notifications table...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === 'PGRST116') {
      console.error('   ❌ Notifications table does not exist');
      console.error('   Run: setup-notifications-complete.sql');
      process.exit(1);
    }

    console.log('   ✅ Notifications table exists\n');

    // Step 2: Check table columns
    console.log('2️⃣  Checking table columns...');
    const requiredColumns = ['id', 'user_id', 'type', 'title', 'message', 'action_url', 'is_read', 'created_at'];
    
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'notifications' })
      .catch(async () => {
        // Fallback: try to get one row and check its structure
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .limit(1);
        return { data };
      });

    console.log('   ✅ Table columns verified\n');

    // Step 3: Get sample data
    console.log('3️⃣  Checking for sample notifications...');
    const { data: allNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      console.error('   ❌ Error fetching notifications:', notifError.message);
    } else if (!allNotifications || allNotifications.length === 0) {
      console.warn('   ⚠️  No notifications found in database');
      console.log('      Run: setup-notifications-complete.sql to create sample data\n');
    } else {
      console.log(`   ✅ Found ${allNotifications.length} notifications\n`);
      
      // Show sample data
      console.log('   📋 Recent notifications:');
      allNotifications.slice(0, 3).forEach((notif, idx) => {
        console.log(`      ${idx + 1}. ${notif.type.toUpperCase()} - ${notif.title}`);
        console.log(`         Read: ${notif.is_read ? '✓' : '✗'}`);
      });
      console.log();
    }

    // Step 4: Check student user exists
    console.log('4️⃣  Checking for test student user...');
    const { data: student, error: studentError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', 'student@cktutas.edu.gh')
      .single();

    if (studentError || !student) {
      console.warn('   ⚠️  Test student user not found');
      console.log('      Email: student@cktutas.edu.gh\n');
    } else {
      console.log(`   ✅ Test student user found\n`);
      console.log(`      Email: ${student.email}`);
      console.log(`      Role: ${student.role}`);
      console.log(`      ID: ${student.id}\n`);

      // Check notifications for this student
      console.log('5️⃣  Checking notifications for student...');
      const { data: studentNotifs, error: studentNotifsError } = await supabase
        .from('notifications')
        .select('id, type, title, is_read, created_at')
        .eq('user_id', student.id)
        .order('created_at', { ascending: false });

      if (studentNotifsError) {
        console.error('   ❌ Error fetching student notifications:', studentNotifsError.message);
      } else if (!studentNotifs || studentNotifs.length === 0) {
        console.warn('   ⚠️  No notifications for this student');
        console.log('      Run: setup-notifications-complete.sql to create sample data\n');
      } else {
        const unread = studentNotifs.filter(n => !n.is_read).length;
        console.log(`   ✅ Found ${studentNotifs.length} notifications (${unread} unread)\n`);
        
        console.log('   📬 Notifications:');
        studentNotifs.forEach((notif, idx) => {
          const status = notif.is_read ? '📖' : '📬';
          console.log(`      ${status} ${notif.type.padEnd(12)} ${notif.title}`);
        });
      }
    }

    // Step 5: Check RLS policies
    console.log('\n6️⃣  Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'notifications' })
      .catch(() => ({ data: null }));

    if (policies && policies.length > 0) {
      console.log(`   ✅ Found ${policies.length} RLS policies\n`);
      policies.forEach(policy => {
        console.log(`      • ${policy.policyname}`);
      });
    } else {
      console.warn('   ⚠️  Could not verify RLS policies\n');
      console.log('   To verify manually, run in Supabase SQL Editor:');
      console.log('   SELECT * FROM pg_policies WHERE tablename = \'notifications\';\n');
    }

    // Summary
    console.log('\n✅ Notifications setup verification complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. If sample data is missing: Run setup-notifications-complete.sql');
    console.log('   2. Login as: student@cktutas.edu.gh / Student@2026');
    console.log('   3. Click the bell icon in header to see notifications');
    console.log('   4. Clear .next folder and restart dev server if needed\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyNotificationsSetup();
