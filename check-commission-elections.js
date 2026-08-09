// Check what elections exist in the database for commission view
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkElections() {
  console.log('🔍 Checking elections in database...\n');

  try {
    // Fetch all elections
    const { data: elections, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching elections:', error);
      return;
    }

    console.log(`✅ Found ${elections?.length || 0} elections:\n`);
    
    if (!elections || elections.length === 0) {
      console.log('⚠️  No elections found in database');
      console.log('\nTo create test elections, run:');
      console.log('  - create-active-election.sql');
      return;
    }

    elections.forEach((election, index) => {
      console.log(`${index + 1}. ${election.name || election.title || 'Unnamed'}`);
      console.log(`   ID: ${election.id}`);
      console.log(`   Status: ${election.status}`);
      console.log(`   Created: ${new Date(election.created_at).toLocaleDateString()}`);
      
      // Check positions
      supabase
        .from('positions')
        .select('count')
        .eq('election_id', election.id)
        .then(({ data, error }) => {
          if (!error && data) {
            console.log(`   Positions: ${data.length}`);
          }
        });
      
      // Check candidates
      supabase
        .from('candidates')
        .select('count')
        .eq('election_id', election.id)
        .then(({ data, error }) => {
          if (!error && data) {
            console.log(`   Candidates: ${data.length}`);
          }
        });
      
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkElections();
