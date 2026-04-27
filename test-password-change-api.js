require('dotenv').config();

async function testPasswordChangeAPI() {
  const userId = '648db2fa-1ebf-42f3-bf67-bf57060d0fa7'; // Salomay Coffie
  const newPassword = 'TestNewPassword123!';

  console.log('🧪 Testing password change API...\n');
  console.log('User ID:', userId);
  console.log('New Password:', newPassword);
  console.log('API URL: http://localhost:4028/api/change-password\n');

  try {
    const response = await fetch('http://localhost:4028/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        newPassword: newPassword
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('\nResponse Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ API call successful!');
      console.log('\nNow try logging in with:');
      console.log('Email: scoffie23.stu@cktutas.edu.gh');
      console.log('Password:', newPassword);
    } else {
      console.log('\n❌ API call failed');
    }

  } catch (error) {
    console.error('\n❌ Error calling API:', error.message);
  }
}

testPasswordChangeAPI();
