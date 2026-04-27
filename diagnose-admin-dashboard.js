require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnoseAdminDashboard() {
  console.log('🔍 Diagnosing Admin Dashboard Issue...\n');

  const adminEmail = 'jkorkugah23.stu@cktutas.edu.gh';

  // 1. Check if user exists in auth.users
  console.log('1️⃣ Checking auth.users...');
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.log('❌ Error listing users:', authError.message);
  } else {
    const user = authUser.users.find(u => u.email === adminEmail);
    if (user) {
      console.log('✅ User found in auth.users:', user.id);
    } else {
      console.log('❌ User NOT found in auth.users');
    }
  }

  // 2. Check user_profiles
  console.log('\n2️⃣ Checking user_profiles...');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (profileError) {
    console.log('❌ Profile error:', profileError.message);
  } else {
    console.log('✅ Profile found:', {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url ? 'exists' : 'null'
    });
  }

  // 3. Check tables needed by dashboard
  console.log('\n3️⃣ Checking required tables...');
  
  const tables = ['elections', 'votes', 'candidates', 'system_alerts', 'activity_logs', 'notifications'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} records`);
    }
  }

  // 4. Test specific queries from dashboard
  console.log('\n4️⃣ Testing dashboard queries...');
  
  // Active elections
  const { count: activeElections, error: electionError } = await supabase
    .from('elections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  
  if (electionError) {
    console.log('❌ Active elections query failed:', electionError.message);
  } else {
    console.log('✅ Active elections:', activeElections);
  }

  // Pending applications
  const { count: pendingApps, error: appError } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  if (appError) {
    console.log('❌ Pending applications query failed:', appError.message);
  } else {
    console.log('✅ Pending applications:', pendingApps);
  }

  console.log('\n✅ Diagnosis complete!');
  process.exit(0);
}

diagnoseAdminDashboard().catch(console.error);
