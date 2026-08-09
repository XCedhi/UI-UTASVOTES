require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyApplications() {
  console.log('🔍 Checking for applications in database...\n');

  // Check candidates table
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching candidates:', error);
    return;
  }

  console.log(`✅ Found ${candidates.length} applications in database\n`);

  if (candidates.length === 0) {
    console.log('⚠️ No applications found. Please submit an application as a student first.\n');
    return;
  }

  console.log('📋 Applications:');
  candidates.forEach((app, index) => {
    console.log(`\n${index + 1}. Application ID: ${app.id}`);
    console.log(`   Name: ${app.name || app.full_name || 'N/A'}`);
    console.log(`   Student ID: ${app.student_id || 'N/A'}`);
    console.log(`   Position: ${app.position || 'N/A'}`);
    console.log(`   Status: ${app.status || 'N/A'}`);
    console.log(`   Election ID: ${app.election_id || 'N/A'}`);
    console.log(`   Submitted: ${app.submitted_at || app.created_at || 'N/A'}`);
    console.log(`   ID Card Doc: ${app.student_id_doc_url || app.student_id_document_url || 'NOT UPLOADED'}`);
  });

  console.log('\n✅ Applications exist in database and should be visible to commission/admin');
  console.log('\n🔍 Troubleshooting steps if not visible:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Look for any red errors');
  console.log('4. Check Network tab for failed API calls');
  console.log('5. Hard refresh (Ctrl+Shift+R)');
}

verifyApplications();
