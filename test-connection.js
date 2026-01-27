// Quick test to check if we can reach Supabase
const https = require('https');

console.log('🔍 Testing connection to Supabase...\n');

const url = 'https://inogysmdiergapyvavbx.supabase.co';

https.get(url, (res) => {
  console.log('✅ SUCCESS! Can reach Supabase');
  console.log(`Status Code: ${res.statusCode}`);
  console.log('\nYour internet connection is working fine.');
  console.log('The issue might be temporary. Try submitting the form again.');
}).on('error', (err) => {
  console.log('❌ FAILED! Cannot reach Supabase');
  console.log(`Error: ${err.message}`);
  console.log('\nPossible solutions:');
  console.log('1. Check your internet connection');
  console.log('2. Run: ipconfig /flushdns');
  console.log('3. Restart your router');
  console.log('4. Check firewall/antivirus settings');
  console.log('5. Try using a different network (mobile hotspot)');
});
