require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: electionsData, error: eErr } = await supabase.from('elections').select('*').order('created_at', { ascending: false });
  if (eErr) { console.log('ELECTIONS ERROR:', eErr.message); return; }
  console.log('=== ELECTIONS (' + electionsData.length + ') ===');
  electionsData.forEach((e) => {
    console.log(JSON.stringify({ id: e.id, type: typeof e.id, name: e.name, title: e.title, status: e.status }));
  });

  const { data: candidatesData, error: cErr } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
  if (cErr) { console.log('CANDIDATES ERROR:', cErr.message); return; }
  console.log('=== CANDIDATES (' + candidatesData.length + ') ===');
  candidatesData.forEach((c) => {
    console.log(JSON.stringify({ id: c.id, name: c.name || c.full_name, position: c.position, election_id: c.election_id, type: typeof c.election_id, status: c.status, submitted_at: c.submitted_at, created_at: c.created_at }));
  });

  // Mimic the commission panel transform
  const electionMap = new Map();
  electionsData.forEach((e) => electionMap.set(e.id?.toString(), e.name || e.title || 'Election'));
  const transformed = candidatesData.map((candidate) => {
    const electionId = candidate.election_id?.toString() || '';
    return { id: candidate.id.toString(), electionId, electionName: electionMap.get(electionId) || 'Election' };
  });
  console.log('=== TRANSFORMED (group keys) ===');
  transformed.forEach((t) => console.log(JSON.stringify(t)));
})();
