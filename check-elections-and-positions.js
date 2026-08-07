const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkElectionsAndPositions() {
  console.log('=== CHECKING ELECTIONS AND POSITIONS ===\n');

  // 1. Check elections
  const { data: elections, error: electionsError } = await supabase
    .from('elections')
    .select('*')
    .in('status', ['active', 'upcoming'])
    .order('created_at', { ascending: false });

  if (electionsError) {
    console.error('❌ Error fetching elections:', electionsError);
    return;
  }

  console.log(`Found ${elections.length} active/upcoming elections:\n`);
  elections.forEach(e => {
    console.log(`Election ID: ${e.id}`);
    console.log(`Name: ${e.name}`);
    console.log(`Type: ${e.election_type}`);
    console.log(`Department: ${e.department || 'N/A'}`);
    console.log(`Status: ${e.status}`);
    console.log('---');
  });

  // 2. Check positions for each election
  console.log('\n=== CHECKING POSITIONS ===\n');
  
  for (const election of elections) {
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('election_id', election.id);

    if (positionsError) {
      console.error(`❌ Error fetching positions for election ${election.id}:`, positionsError);
    } else {
      console.log(`Election: ${election.name} (${election.id})`);
      console.log(`Positions: ${positions.length}`);
      if (positions.length > 0) {
        positions.forEach(p => {
          console.log(`  - ${p.title} (ID: ${p.id}, Fee: GHS ${p.application_fee || p.fee || 0})`);
        });
      } else {
        console.log('  (No positions created yet)');
      }
      console.log('');
    }
  }

  console.log('=== CHECK COMPLETE ===');
}

checkElectionsAndPositions().catch(console.error);
