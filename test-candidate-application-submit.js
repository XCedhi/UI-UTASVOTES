// Test script for candidate application submission
// Run this in your browser console on the candidate registration page

async function testApplicationSubmit() {
  console.log('🧪 Testing Candidate Application Submission...\n');

  // Test data
  const testData = {
    userId: localStorage.getItem('userId'),
    electionId: '1', // Replace with actual election ID
    positionTitle: 'President',
    fullName: 'Test Candidate',
    studentId: '20230001',
    email: 'test@cktutas.edu.gh',
    phone: '024 123 4567',
    department: 'Computer Science',
    level: '300',
    cgpa: '3.5',
    transactionId: 'TEST_TXN_' + Date.now(),
    applicationFee: 150,
    photoUrl: 'test-photo.jpg',
    manifestoUrl: 'test-manifesto.pdf',
    studentIdUrl: 'test-id.jpg',
    transcriptUrl: 'test-transcript.pdf',
  };

  console.log('📋 Test Data:', testData);
  console.log('');

  // Check user ID
  if (!testData.userId) {
    console.error('❌ No userId found in localStorage');
    console.log('💡 Please log in first');
    return;
  }
  console.log('✅ User ID found:', testData.userId);

  // Test API call
  try {
    console.log('📤 Sending request to /api/candidate-application/submit...');
    
    const response = await fetch('/api/candidate-application/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const result = await response.json();
    console.log('📥 Response data:', result);

    if (response.ok) {
      console.log('✅ Application submitted successfully!');
      console.log('📝 Application ID:', result.applicationId);
    } else {
      console.error('❌ Application submission failed');
      console.error('Error:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Network or parsing error:', error);
  }

  console.log('\n🔍 Next steps:');
  console.log('1. Check Supabase database for the new candidate record');
  console.log('2. Check notifications table for admin/commission notifications');
  console.log('3. Log in as admin/commission to see the application');
}

// Run the test
testApplicationSubmit();
