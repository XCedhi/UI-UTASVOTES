require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseCommissionView() {
  console.log('🔍 Diagnosing Commission Panel View...\n');

  // Test 1: Check what the exact query returns
  console.log('Test 1: Fetching candidates with created_at order');
  const { data: candidates1, error: error1 } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`✅ Found ${candidates1?.length || 0} candidates`);
    if (candidates1 && candidates1.length > 0) {
      console.log('\nFirst candidate:');
      console.log(JSON.stringify(candidates1[0], null, 2));
    }
  }

  // Test 2: Check if there's an RLS issue
  console.log('\n\nTest 2: Checking RLS policies on candidates table');
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_table_policies', { table_name: 'candidates' })
    .catch(() => ({ data: null, error: 'RPC not available' }));

  if (policiesError) {
    console.log('⚠️ Could not check policies (this is normal)');
  }

  // Test 3: Try with status filter
  console.log('\n\nTest 3: Fetching only pending candidates');
  const { data: pending, error: error3 } = await supabase
    .from('candidates')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error3) {
    console.error('❌ Error:', error3);
  } else {
    console.log(`✅ Found ${pending?.length || 0} pending candidates`);
  }

  // Test 4: Check the exact columns being selected
  console.log('\n\nTest 4: Checking candidate table structure');
  const { data: sample, error: error4 } = await supabase
    .from('candidates')
    .select('*')
    .limit(1)
    .single();

  if (error4) {
    console.error('❌ Error:', error4);
  } else if (sample) {
    console.log('✅ Available columns:');
    console.log(Object.keys(sample).join(', '));
  }

  console.log('\n✅ Diagnosis complete');
}

diagnoseCommissionView();
