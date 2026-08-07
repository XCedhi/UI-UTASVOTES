require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function verifyRLSFix() {
  console.log('🔍 Verifying RLS Fix...\n');

  const supabase = createClient(supabaseUrl, anonKey);

  // Test: Fetch candidates with anon key (what the commission panel uses)
  console.log('Testing candidate fetch with anon key (simulating commission panel)...');
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    
    console.log('\n⚠️ RLS is still blocking access!');
    console.log('Possible issues:');
    console.log('1. SQL script was not run successfully in Supabase');
    console.log('2. User is not authenticated');
    console.log('3. RLS policies are still incorrect');
  } else {
    console.log(`✅ SUCCESS: Found ${data?.length || 0} candidates`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Applications found:');
      data.forEach((app, index) => {
        console.log(`\n${index + 1}. ${app.name || app.full_name}`);
        console.log(`   Student ID: ${app.student_id}`);
        console.log(`   Position: ${app.position}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${app.created_at}`);
      });
      
      console.log('\n✅ RLS fix is working! Applications should show in commission panel.');
      console.log('If they still don\'t show, try:');
      console.log('1. Hard refresh browser (Ctrl + Shift + R)');
      console.log('2. Clear browser cache completely');
      console.log('3. Check browser console for errors');
    } else {
      console.log('\n⚠️ No applications found in database');
    }
  }

  console.log('\n✅ Verification complete');
}

verifyRLSFix();
