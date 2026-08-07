require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSubmission() {
  console.log('🔍 Testing Candidate Application Visibility\n');

  // Test with service role (bypasses RLS)
  console.log('=== TEST 1: Service Role (Bypasses RLS) ===');
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (adminError) {
    console.error('❌ Service Role Error:', adminError);
  } else {
    console.log(`✅ Service Role sees ${adminData?.length || 0} candidates`);
    if (adminData && adminData.length > 0) {
      console.log('\nLatest application:');
      console.log(`  Name: ${adminData[0].name || adminData[0].full_name}`);
      console.log(`  Student ID: ${adminData[0].student_id}`);
      console.log(`  Position: ${adminData[0].position}`);
      console.log(`  Status: ${adminData[0].status}`);
      console.log(`  Election ID: ${adminData[0].election_id}`);
    }
  }

  // Test with anon key (subject to RLS)
  console.log('\n\n=== TEST 2: Anon Key (Subject to RLS) ===');
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (anonError) {
    console.error('❌ Anon Key Error:', anonError);
  } else {
    console.log(`✅ Anon Key sees ${anonData?.length || 0} candidates`);
  }

  // Check RLS status
  console.log('\n\n=== TEST 3: RLS Status ===');
  const { data: rlsStatus } = await supabaseAdmin
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('tablename', 'candidates')
    .single();

  if (rlsStatus) {
    console.log(`RLS Enabled on candidates table: ${rlsStatus.rowsecurity}`);
  }

  // Check current policies
  console.log('\n\n=== TEST 4: Current RLS Policies ===');
  const { data: policies } = await supabaseAdmin.rpc('exec_sql', {
    sql: `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'candidates'`
  }).catch(() => ({ data: null }));

  if (policies) {
    console.log('Current policies:', policies);
  } else {
    console.log('⚠️ Could not fetch policies (need to check in Supabase dashboard)');
  }

  console.log('\n\n📋 DIAGNOSIS:');
  if (adminData && adminData.length > 0 && (!anonData || anonData.length === 0)) {
    console.log('❌ ISSUE FOUND: RLS policies are blocking read access');
    console.log('   - Data exists in database (service role can see it)');
    console.log('   - But RLS prevents commission/admin from reading it');
    console.log('\n💡 SOLUTION: Run fix-candidates-read-access.sql in Supabase SQL Editor');
  } else if (anonData && anonData.length > 0) {
    console.log('✅ Applications are visible - check browser cache/refresh');
  } else {
    console.log('❌ No applications found in database');
  }

  console.log('\n✅ Test complete');
}

testSubmission();
