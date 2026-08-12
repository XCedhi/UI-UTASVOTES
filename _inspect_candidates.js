// Temp inspection: live candidates table columns + a sample row
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  console.log('=== CANDIDATES (first 5 rows) ===');
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return console.error('Candidates fetch error:', error.message);

  if (data.length === 0) {
    console.log('No candidate rows found.');
  } else {
    console.log('COLUMNS:', Object.keys(data[0]).join(', '));
    data.forEach((c) => {
      console.log(JSON.stringify({
        id: c.id,
        user_id: c.user_id,
        election_id: c.election_id,
        position: c.position,
        status: c.status,
        eligibility_status: c.eligibility_status,
        verification_notes: c.verification_notes,
        rejection_reason: c.rejection_reason,
        full_name: c.full_name,
        email: c.email,
        approved_at: c.approved_at,
        rejected_at: c.rejected_at,
      }, null, 2));
    });
  }

  console.log('\n=== NOTIFICATIONS (first 2 rows) ===');
  const { data: notifs, error: nErr } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);
  if (nErr) return console.error('Notifications fetch error:', nErr.message);
  if (notifs.length === 0) {
    console.log('No notification rows found.');
  } else {
    console.log('COLUMNS:', Object.keys(notifs[0]).join(', '));
    notifs.forEach((n) => console.log(JSON.stringify(n, null, 2)));
  }
}

run();
