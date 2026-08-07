const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkElectionIds() {
  console.log('=== CHECKING ELECTION IDS ===\n');

  const { data: elections, error } = await supabase
    .from('elections')
    .select('id, name, type, status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${elections.length} elections:\n`);
    elections.forEach(e => {
      console.log(`ID: ${e.id}`);
      console.log(`Name: ${e.name}`);
      console.log(`Type: ${e.type}`);
      console.log(`Status: ${e.status}`);
      console.log(`ID Type: ${typeof e.id}`);
      console.log('---');
    });
  }
}

checkElectionIds().catch(console.error);
