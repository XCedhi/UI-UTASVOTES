const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAvatarPersistence() {
  console.log('🧪 Testing Avatar Persistence\n');

  const testEmail = 'jkorkugah23.stu@cktutas.edu.gh';

  try {
    // Fetch the user profile
    console.log('1️⃣ Fetching profile for:', testEmail);
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, avatar_url, updated_at')
      .eq('email', testEmail)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error.message);
      return;
    }

    console.log('✅ Profile found:');
    console.log('   - ID:', profile.id);
    console.log('   - Name:', profile.full_name);
    console.log('   - Email:', profile.email);
    console.log('   - Updated:', profile.updated_at);
    
    if (profile.avatar_url) {
      console.log('   - Avatar: Present (' + profile.avatar_url.length + ' characters)');
      console.log('   - Avatar type:', profile.avatar_url.substring(0, 30) + '...');
      
      // Check if it's a valid base64 image
      if (profile.avatar_url.startsWith('data:image/')) {
        console.log('   ✅ Valid base64 image format');
      } else {
        console.log('   ⚠️ Not a base64 image format');
      }
    } else {
      console.log('   - Avatar: ❌ NULL or empty');
    }

    console.log('\n2️⃣ Testing if avatar persists across queries...');
    
    // Fetch again to simulate page reload
    const { data: profile2, error: error2 } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('email', testEmail)
      .single();

    if (error2) {
      console.error('❌ Error on second fetch:', error2.message);
      return;
    }

    if (profile2.avatar_url === profile.avatar_url) {
      console.log('✅ Avatar persists correctly across queries');
    } else {
      console.log('❌ Avatar changed between queries!');
      console.log('   First:', profile.avatar_url ? 'Present' : 'NULL');
      console.log('   Second:', profile2.avatar_url ? 'Present' : 'NULL');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testAvatarPersistence();
