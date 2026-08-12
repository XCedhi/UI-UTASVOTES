// One-off data fix for the "Let's test create a new election" election
// (id e2264c82-2683-4043-a2df-2e00198b5187).
//
// Why: the EC created it with a nomination/voting window that had already
// elapsed (nominations closed 8/8, voting ended 8/10 09:10, created 8/10 08:11).
// The date-based auto-status updater then marked it "completed", which hid it
// from the student candidate-application flow (status IN active/upcoming only).
//
// This resets it to an upcoming election with a future timeline so the
// notification -> preview -> apply flow works end-to-end, and deep-links the
// already-sent notifications so clicking one opens the election preview.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const ELECTION_ID = 'e2264c82-2683-4043-a2df-2e00198b5187';
const ELECTION_NAME = "Let's test create a new election";

async function run() {
  console.log('=== BEFORE ===');
  const { data: before } = await supabase
    .from('elections')
    .select('name, status, nomination_start, nomination_end, voting_start, voting_end')
    .eq('id', ELECTION_ID)
    .single();
  console.log(before);

  const { data: updated, error: uErr } = await supabase
    .from('elections')
    .update({
      status: 'upcoming',
      nomination_start: '2026-08-11T00:00:00+00:00',
      nomination_end: '2026-08-20T23:59:59+00:00',
      voting_start: '2026-08-24T08:00:00+00:00',
      voting_end: '2026-08-26T18:00:00+00:00',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ELECTION_ID)
    .select();
  if (uErr) return console.error('Update election error:', uErr);

  console.log('=== AFTER (election) ===');
  console.log(updated?.[0]);

  // Deep-link the notifications that were sent for this election.
  const { data: notifData, error: nErr } = await supabase
    .from('notifications')
    .update({ action_url: `/candidate-registration?election=${ELECTION_ID}` })
    .eq('type', 'election')
    .like('message', `%${ELECTION_NAME}%`)
    .select('id, user_id, action_url');
  if (nErr) return console.error('Update notifications error:', nErr);

  console.log(`=== NOTIFICATIONS UPDATED: ${notifData?.length || 0} ===`);
}

run().catch(console.error);
