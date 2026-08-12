// Diagnostic: full data overview for election visibility issue
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  console.log('=== ELECTIONS (ALL FIELDS) ===');
  const { data: elections, error: eErr } = await supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });
  if (eErr) return console.error('Election fetch error:', eErr);
  elections.forEach(e => {
    console.log(JSON.stringify({
      id: e.id, name: e.name, title: e.title, election_type: e.election_type,
      department: e.department, status: e.status,
      nomination_start: e.nomination_start, nomination_end: e.nomination_end,
      voting_start: e.voting_start, voting_end: e.voting_end, created_at: e.created_at,
    }, null, 2));
  });

  console.log('\n=== USER PROFILES (STUDENTS) ===');
  const { data: profiles, error: pErr } = await supabase
    .from('user_profiles')
    .select('id, email, role, full_name, department, level, student_id');
  if (pErr) return console.error('Profile fetch error:', pErr);
  profiles.forEach(p => {
    console.log(`${p.role} | ${p.email} | dept="${p.department}" | level="${p.level}"`);
  });

  console.log('\n=== NOTIFICATIONS (latest 10) ===');
  const { data: notifs, error: nErr } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, message, action_url, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  if (nErr) return console.error('Notif fetch error:', nErr);
  notifs.forEach(n => {
    console.log(JSON.stringify({ user_id: n.user_id, type: n.type, title: n.title, action_url: n.action_url, read: n.is_read, at: n.created_at }));
  });

  console.log('\n=== POSITIONS (latest 16) ===');
  const { data: positions, error: posErr } = await supabase
    .from('positions')
    .select('id, election_id, title, name, application_fee, created_at')
    .order('created_at', { ascending: false })
    .limit(16);
  if (posErr) return console.error('Positions fetch error:', posErr);
  positions.forEach(p => {
    console.log(`${p.title || p.name} | election=${p.election_id} | fee=${p.application_fee}`);
  });

  console.log('\n=== TRIGGERS ON ELECTIONS ===');
  const { data: triggers, error: tErr } = await supabase.rpc('exec_sql', {});
  if (tErr) console.log('(rpc exec_sql not available)');
}

run().catch(console.error);
