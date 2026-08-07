const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApplications() {
  console.log('🔍 Checking submitted applications...\n');

  // Check all candidates
  const { data: allCandidates, error: allError } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (allError) {
    console.error('❌ Error fetching candidates:', allError);
    return;
  }

  console.log(`📋 Total candidates found: ${allCandidates?.length || 0}\n`);

  if (allCandidates && allCandidates.length > 0) {
    allCandidates.forEach((candidate, index) => {
      console.log(`\n--- Application ${index + 1} ---`);
      console.log(`ID: ${candidate.id}`);
      console.log(`Name: ${candidate.full_name || candidate.name || 'N/A'}`);
      console.log(`Student ID: ${candidate.student_id || 'N/A'}`);
      console.log(`Email: ${candidate.email || 'N/A'}`);
      console.log(`Position: ${candidate.position || 'N/A'}`);
      console.log(`Election ID: ${candidate.election_id || 'N/A'}`);
      console.log(`Status: ${candidate.status || 'N/A'}`);
      console.log(`Created: ${candidate.created_at || candidate.submitted_at || 'N/A'}`);
      console.log(`Transaction ID: ${candidate.transaction_id || 'N/A'}`);
    });
  } else {
    console.log('⚠️ No candidates found in database');
  }

  // Check pending applications specifically
  console.log('\n\n🔍 Checking PENDING applications...\n');
  const { data: pendingCandidates, error: pendingError } = await supabase
    .from('candidates')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (pendingError) {
    console.error('❌ Error fetching pending candidates:', pendingError);
  } else {
    console.log(`📋 Pending candidates: ${pendingCandidates?.length || 0}`);
  }
}

checkApplications()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
