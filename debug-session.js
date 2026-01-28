// Debug script to check Supabase session
// Run this in browser console on the /admin-profile page

console.log('🔍 Checking Supabase session...');

// Check localStorage for session
const supabaseKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
console.log('📦 Supabase localStorage key:', supabaseKey);

if (supabaseKey) {
  const sessionData = localStorage.getItem(supabaseKey);
  console.log('📦 Session data:', sessionData);
  
  try {
    const parsed = JSON.parse(sessionData);
    console.log('✅ Parsed session:', parsed);
    console.log('👤 User ID:', parsed?.currentSession?.user?.id);
    console.log('🔑 Access token exists:', !!parsed?.currentSession?.access_token);
    console.log('⏰ Expires at:', new Date(parsed?.currentSession?.expires_at * 1000));
  } catch (e) {
    console.error('❌ Failed to parse session:', e);
  }
} else {
  console.log('❌ No Supabase session found in localStorage');
}

// Check if Supabase client is available
if (typeof window !== 'undefined') {
  console.log('🌐 Window object available');
  
  // Try to import and check session
  import('@supabase/supabase-js').then(async ({ createClient }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔍 getSession() result:');
    console.log('  Session:', session);
    console.log('  Error:', error);
    console.log('  User ID:', session?.user?.id);
  }).catch(err => {
    console.error('❌ Failed to check session:', err);
  });
}
