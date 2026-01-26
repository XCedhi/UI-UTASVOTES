// Quick script to verify environment variables are loaded
// Run with: node verify-env.js

require('dotenv').config();

console.log('\n=== Environment Variables Check ===\n');

const checks = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    required: true
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    required: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    required: true
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    value: process.env.NEXT_PUBLIC_SITE_URL,
    required: false
  }
];

let allGood = true;

checks.forEach(check => {
  const status = check.value ? '✅' : '❌';
  const required = check.required ? '(REQUIRED)' : '(optional)';
  
  console.log(`${status} ${check.name} ${required}`);
  
  if (check.value) {
    // Show first 20 and last 10 characters for security
    const masked = check.value.length > 30 
      ? `${check.value.substring(0, 20)}...${check.value.substring(check.value.length - 10)}`
      : check.value;
    console.log(`   Value: ${masked}`);
  } else {
    console.log(`   Value: NOT SET`);
    if (check.required) {
      allGood = false;
    }
  }
  console.log('');
});

console.log('=================================\n');

if (allGood) {
  console.log('✅ All required environment variables are set!\n');
  console.log('If import still fails, the issue is likely:');
  console.log('1. Service role key is incorrect');
  console.log('2. RLS policies blocking access');
  console.log('3. user_profiles table doesn\'t exist\n');
} else {
  console.log('❌ Some required environment variables are missing!\n');
  console.log('Fix:');
  console.log('1. Check .env file is in project root');
  console.log('2. Verify no typos in variable names');
  console.log('3. Restart dev server after fixing\n');
}
