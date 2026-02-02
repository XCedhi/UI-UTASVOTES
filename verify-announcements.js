const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  console.log('Fetching announcements (as browser would see them):\n');
  
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log(`✅ Found ${data.length} active announcements\n`);
    
    data.forEach((a, i) => {
      console.log(`${i+1}. [${a.type.toUpperCase()}] ${a.title}`);
      console.log(`   Priority: ${a.priority} | Published: ${new Date(a.published_at).toLocaleDateString()}`);
      console.log(`   Message: ${a.message.substring(0, 80)}...`);
      console.log('');
    });
  }
})();
