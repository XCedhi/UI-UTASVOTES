/**
 * Test script for user update API
 * Run this in browser console while logged in as admin
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Check the output
 */

async function testUserUpdateAPI() {
  console.log('🧪 Testing User Update API...\n');

  // Get a test user ID (replace with actual user ID from your database)
  const testUserId = 'YOUR_USER_ID_HERE'; // ← Replace this!
  
  if (testUserId === 'YOUR_USER_ID_HERE') {
    console.error('❌ Please replace YOUR_USER_ID_HERE with an actual user ID');
    console.log('\nTo get a user ID:');
    console.log('1. Go to User Management page');
    console.log('2. Open DevTools → Network tab');
    console.log('3. Look at the user list response');
    console.log('4. Copy any user ID from the response');
    return;
  }

  try {
    console.log('📤 Sending test update request...');
    console.log('User ID:', testUserId);
    console.log('New Role: commission');
    console.log('New Status: active\n');

    const response = await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        role: 'commission',
        status: 'active',
        accessStartDate: new Date().toISOString(),
        accessEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }),
    });

    console.log('📥 Response Status:', response.status);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! User updated:');
      console.log(result);
      console.log('\n✅ API is working correctly!');
    } else {
      console.error('❌ FAILED! Error:');
      console.error(result);
      console.log('\n❌ API returned an error. Check the error message above.');
    }
  } catch (error) {
    console.error('❌ FAILED! Exception:');
    console.error(error);
    console.log('\n❌ Network error or API not responding.');
  }
}

// Run the test
testUserUpdateAPI();
