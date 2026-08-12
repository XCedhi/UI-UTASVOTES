// Verification: simulate the apply-page election filter against the live DB.
// Prints which elections a student would see for candidate applications using
// the same logic as CandidateRegistrationInteractive.loadAvailablePositions.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  const { data: elections, error } = await supabase
    .from('elections')
    .select('*')
    .in('status', ['active', 'upcoming', 'completed', 'paused', 'scheduled']);
  if (error) return console.error(error);

  const nowMs = Date.now();
  const isOpenForApplications = (election) => {
    if (election.status === 'cancelled') return false;
    const nomEndMs = election.nomination_end ? new Date(election.nomination_end).getTime() : null;
    if (election.status === 'completed') return nomEndMs !== null && nomEndMs >= nowMs;
    if (nomEndMs !== null && nomEndMs < nowMs) return false;
    return true;
  };

  console.log('Now:', new Date(nowMs).toISOString());
  console.log('');
  console.log('Elections a STUDENT would see on the apply page:');
  elections.filter(isOpenForApplications).forEach((e) => {
    console.log(`  ✅ ${e.name}  [${e.status}]  nomination_end=${e.nomination_end || 'null'}`);
  });
  console.log('');
  console.log('Elections hidden from the apply page:');
  elections.filter((e) => !isOpenForApplications(e)).forEach((e) => {
    console.log(`  ❌ ${e.name}  [${e.status}]  nomination_end=${e.nomination_end || 'null'}`);
  });
}

run().catch(console.error);
