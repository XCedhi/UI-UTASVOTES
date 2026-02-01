// Test script to verify service role key works directly
// Run with: node test-service-role-direct.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Service Role Key...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!serviceRoleKey);
console.log('Service Role Key length:', serviceRoleKey?.length);
console.log('Service Role Key starts with:', serviceRoleKey?.substring(0, 20) + '...');
console.log('');

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDirectInsert() {
  console.log('📝 Attempting direct insert into elections table...\n');
  
  try {
    // Try to insert a test election
    const { data, error } = await supabaseAdmin
      .from('elections')
      .insert({
        name: 'Test Election ' + Date.now(),
        description: 'Test election created by service role',
        election_type: 'university-wide',
        nomination_start: new Date().toISOString(),
        nomination_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        voting_start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        voting_end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed!');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('\nFull error object:', JSON.stringify(error, null, 2));
      
      if (error.code === '42501') {
        console.error('\n⚠️  PERMISSION DENIED ERROR');
        console.error('This means the service_role key does not have permission to insert.');
        console.error('Possible causes:');
        console.error('1. The key in .env is actually the anon key, not service_role key');
        console.error('2. RLS policies are blocking even service_role');
        console.error('3. Table ownership or grants are incorrect');
        console.error('\n💡 Solution: Run fix-elections-permissions-final.sql in Supabase SQL Editor');
      }
      
      return false;
    }

    console.log('✅ Insert successful!');
    console.log('Created election:', data);
    
    // Clean up - delete the test election
    const { error: deleteError } = await supabaseAdmin
      .from('elections')
      .delete()
      .eq('id', data.id);
    
    if (!deleteError) {
      console.log('✅ Test election cleaned up');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

async function testTableAccess() {
  console.log('📊 Testing table read access...\n');
  
  try {
    const { data, error } = await supabaseAdmin
      .from('elections')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Read failed:', error.message);
      return false;
    }
    
    console.log('✅ Read successful!');
    console.log(`Found ${data?.length || 0} elections`);
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SERVICE ROLE KEY TEST');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const readSuccess = await testTableAccess();
  console.log('');
  
  const insertSuccess = await testDirectInsert();
  console.log('');
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Read access:', readSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('Insert access:', insertSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (!insertSuccess) {
    console.log('🔧 NEXT STEPS:');
    console.log('1. Verify your SUPABASE_SERVICE_ROLE_KEY in .env is correct');
    console.log('   - Go to Supabase Dashboard → Settings → API');
    console.log('   - Copy the "service_role" key (NOT the "anon" key)');
    console.log('   - It should start with "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"');
    console.log('   - It should contain "role":"service_role" when decoded');
    console.log('');
    console.log('2. Run fix-elections-permissions-final.sql in Supabase SQL Editor');
    console.log('   - This will create proper RLS bypass policies for service_role');
    console.log('');
    console.log('3. Restart your dev server after making changes');
    console.log('   - Stop the server (Ctrl+C)');
    console.log('   - Run: npm run dev');
  } else {
    console.log('✅ All tests passed! Service role key is working correctly.');
  }
}

runTests();
