// Test fetching elections from database
// Run with: node test-elections-fetch.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Elections Fetch...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseKey);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'cache-control': 'no-cache',
    },
  },
});

async function testFetch() {
  console.log('📊 Fetching elections...\n');
  
  try {
    // Try fetching with all possible column names
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching elections:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('\nFull error:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Fetch successful!');
    console.log(`Found ${data?.length || 0} elections\n`);
    
    if (data && data.length > 0) {
      console.log('📋 Elections:');
      data.forEach((election, index) => {
        console.log(`\n${index + 1}. Election ID: ${election.id}`);
        console.log(`   Name: ${election.name || election.title || 'N/A'}`);
        console.log(`   Type: ${election.election_type || election.type || 'N/A'}`);
        console.log(`   Department: ${election.department || 'N/A'}`);
        console.log(`   Status: ${election.status || 'N/A'}`);
        console.log(`   Created: ${election.created_at || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No elections found in database');
      console.log('\nPossible reasons:');
      console.log('1. Elections table is empty');
      console.log('2. RLS policies are blocking read access');
      console.log('3. Elections were not created successfully');
    }
    
    // Test positions fetch
    console.log('\n\n📊 Fetching positions...\n');
    
    const { data: positionsData, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (positionsError) {
      console.error('❌ Error fetching positions:');
      console.error('Message:', positionsError.message);
      return;
    }
    
    console.log('✅ Positions fetch successful!');
    console.log(`Found ${positionsData?.length || 0} positions\n`);
    
    if (positionsData && positionsData.length > 0) {
      console.log('📋 Positions:');
      positionsData.forEach((position, index) => {
        console.log(`\n${index + 1}. Position ID: ${position.id}`);
        console.log(`   Title: ${position.title}`);
        console.log(`   Election ID: ${position.election_id}`);
        console.log(`   Fee: GHS ${position.application_fee || 0}`);
      });
    } else {
      console.log('⚠️  No positions found in database');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testFetch();
