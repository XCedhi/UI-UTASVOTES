const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApplicationDecisions() {
  console.log('🧪 Testing Application Decision System...\n');

  // 1. Check database structure
  console.log('1️⃣ Checking database structure...');
  const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      AND column_name IN ('status', 'rejected_at', 'approved_at', 'verification_notes')
      ORDER BY column_name;
    `
  }).catch(() => ({ data: null, error: null }));

  // Alternative check if RPC doesn't work
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .select('status, rejected_at, approved_at, verification_notes')
    .limit(1)
    .single();

  if (candidate) {
    console.log('✅ Required columns exist:');
    console.log('   - status:', typeof candidate.status);
    console.log('   - rejected_at:', candidate.rejected_at ? 'exists' : 'null');
    console.log('   - approved_at:', candidate.approved_at ? 'exists' : 'null');
    console.log('   - verification_notes:', typeof candidate.verification_notes);
  } else {
    console.log('⚠️  Could not verify columns (no candidates in database)');
  }

  // 2. Check activity_logs table
  console.log('\n2️⃣ Checking activity_logs table...');
  const { data: activityLogs, error: logsError } = await supabase
    .from('activity_logs')
    .select('id, user_name, action, action_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logsError) {
    if (logsError.code === '42P01') {
      console.log('❌ activity_logs table does not exist');
      console.log('   Run fix-application-decision-buttons.sql to create it');
    } else {
      console.log('❌ Error accessing activity_logs:', logsError.message);
    }
  } else {
    console.log(`✅ activity_logs table exists with ${activityLogs?.length || 0} recent entries`);
    if (activityLogs && activityLogs.length > 0) {
      console.log('   Recent activity:');
      activityLogs.forEach(log => {
        console.log(`   - ${log.user_name || 'Unknown'}: ${log.action} (${log.action_type})`);
      });
    }
  }

  // 3. Test approval flow (simulate)
  console.log('\n3️⃣ Testing approval flow...');
  const { data: pendingApps, error: pendingError } = await supabase
    .from('candidates')
    .select('id, full_name, position, status')
    .eq('status', 'pending')
    .limit(1);

  if (pendingError) {
    console.log('❌ Error fetching pending applications:', pendingError.message);
  } else if (!pendingApps || pendingApps.length === 0) {
    console.log('⚠️  No pending applications to test approval');
  } else {
    const testApp = pendingApps[0];
    console.log(`✅ Found pending application: ${testApp.full_name} - ${testApp.position}`);
    console.log('   (Ready for approval/rejection testing)');
  }

  // 4. Check rejected applications
  console.log('\n4️⃣ Checking rejected applications...');
  const { data: rejectedApps, error: rejectedError } = await supabase
    .from('candidates')
    .select('id, full_name, position, status, rejected_at, verification_notes')
    .eq('status', 'rejected')
    .order('rejected_at', { ascending: false })
    .limit(5);

  if (rejectedError) {
    console.log('❌ Error fetching rejected applications:', rejectedError.message);
  } else if (!rejectedApps || rejectedApps.length === 0) {
    console.log('⚠️  No rejected applications found');
  } else {
    console.log(`✅ Found ${rejectedApps.length} rejected application(s):`);
    rejectedApps.forEach(app => {
      console.log(`\n   Name: ${app.full_name}`);
      console.log(`   Position: ${app.position}`);
      console.log(`   Rejected: ${app.rejected_at ? new Date(app.rejected_at).toLocaleDateString() : 'N/A'}`);
      console.log(`   Reason: ${app.verification_notes || 'No reason provided'}`);
    });
  }

  // 5. Check approved applications
  console.log('\n5️⃣ Checking approved applications...');
  const { data: approvedApps, error: approvedError } = await supabase
    .from('candidates')
    .select('id, full_name, position, status, approved_at')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(5);

  if (approvedError) {
    console.log('❌ Error fetching approved applications:', approvedError.message);
  } else if (!approvedApps || approvedApps.length === 0) {
    console.log('⚠️  No approved applications found');
  } else {
    console.log(`✅ Found ${approvedApps.length} approved application(s):`);
    approvedApps.forEach(app => {
      console.log(`   - ${app.full_name} - ${app.position}`);
      console.log(`     Approved: ${app.approved_at ? new Date(app.approved_at).toLocaleDateString() : 'N/A'}`);
    });
  }

  // 6. Check for duplicate applications (same user, same position)
  console.log('\n6️⃣ Checking for duplicate applications...');
  const { data: allApps, error: allAppsError } = await supabase
    .from('candidates')
    .select('user_id, full_name, position, status, created_at')
    .order('created_at', { ascending: false });

  if (allAppsError) {
    console.log('❌ Error checking duplicates:', allAppsError.message);
  } else if (allApps) {
    // Group by user_id and position
    const duplicates = {};
    allApps.forEach(app => {
      const key = `${app.user_id}-${app.position}`;
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(app);
    });

    const hasDuplicates = Object.values(duplicates).some(apps => apps.length > 1);
    
    if (hasDuplicates) {
      console.log('✅ Found users with multiple applications (reapplication working):');
      Object.entries(duplicates).forEach(([key, apps]) => {
        if (apps.length > 1) {
          console.log(`\n   User: ${apps[0].full_name}`);
          console.log(`   Position: ${apps[0].position}`);
          console.log(`   Applications: ${apps.length}`);
          apps.forEach((app, index) => {
            console.log(`      ${index + 1}. Status: ${app.status} (${new Date(app.created_at).toLocaleDateString()})`);
          });
        }
      });
    } else {
      console.log('⚠️  No duplicate applications found');
      console.log('   (This is normal if no student has reapplied after rejection)');
    }
  }

  // 7. Check triggers
  console.log('\n7️⃣ Checking database triggers...');
  const { data: triggers, error: triggersError } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name, event_manipulation, action_timing')
    .eq('event_object_table', 'candidates')
    .catch(() => ({ data: null, error: null }));

  if (triggers && triggers.length > 0) {
    console.log('✅ Found triggers:');
    triggers.forEach(trigger => {
      console.log(`   - ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
    });
  } else {
    console.log('⚠️  Could not verify triggers (may need RPC access)');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const pendingCount = pendingApps?.length || 0;
  const rejectedCount = rejectedApps?.length || 0;
  const approvedCount = approvedApps?.length || 0;
  const activityLogCount = activityLogs?.length || 0;

  console.log(`✅ Pending applications: ${pendingCount}`);
  console.log(`✅ Rejected applications: ${rejectedCount}`);
  console.log(`✅ Approved applications: ${approvedCount}`);
  console.log(`✅ Activity log entries: ${activityLogCount}`);
  
  console.log('\n📝 Next Steps:');
  if (pendingCount > 0) {
    console.log('   1. Test approval: Login as commission and approve a pending application');
    console.log('   2. Test rejection: Login as commission and reject a pending application');
  } else {
    console.log('   1. Submit a new application as student to test');
  }
  
  if (rejectedCount === 0) {
    console.log('   3. Test reapplication: After rejecting, try to apply again as same student');
  } else {
    console.log('   3. Verify reapplication works: Check if rejected students can apply again');
  }
  
  console.log('   4. Check activity logs after each action');
  console.log('   5. Verify timestamps (approved_at, rejected_at) are set correctly');
}

testApplicationDecisions()
  .then(() => {
    console.log('\n✅ Test script complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
