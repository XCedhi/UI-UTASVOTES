require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: 'commission@cktutas.edu.gh', password: 'Commission@2026' });
  if (authError) { console.log('LOGIN FAIL:', authError.message); return; }

  // 1. Elections as commission user
  const { data: electionsData, error: eErr } = await supabase.from('elections').select('*').order('created_at', { ascending: false });
  console.log('=== COMMISSION sees elections ===');
  if (eErr) console.log('Elections ERROR:', eErr.message);
  else electionsData.forEach((e) => console.log('  id=' + e.id + ' name=' + (e.name || e.title) + ' status=' + e.status));

  // 2. Candidates as commission user (mimic panel query with limit 20)
  const { data: candidatesData, error: cErr } = await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(20);
  if (cErr) { console.log('Candidates ERROR:', cErr.message); return; }

  // 3. Mimic the exact panel transform
  const electionMap = new Map();
  (electionsData || []).forEach((e) => electionMap.set(e.id?.toString(), e.name || e.title || 'Election'));
  const apps = candidatesData.map((c) => {
    const electionId = c.election_id?.toString() || '';
    return { id: c.id, electionId, electionName: electionMap.get(electionId) || c.election_name || c.election_title || 'Election' };
  });

  // 4. Mimic ApplicationsByElection grouping
  const groupMap = new Map();
  apps.forEach((app) => {
    const key = app.electionId ? String(app.electionId) : 'unassigned';
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(app);
  });
  const groups = Array.from(groupMap.entries()).map(([electionId, list]) => {
    const election = (electionsData || []).find((e) => String(e.id) === electionId);
    return { electionId, electionName: election?.name || list[0]?.electionName || 'Unassigned Election', count: list.length, apps: list.map(a => a.id) };
  });
  console.log('=== RESULTING GROUPS ===');
  groups.forEach((g) => console.log(JSON.stringify(g)));
})();
