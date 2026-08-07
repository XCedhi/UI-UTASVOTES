/**
 * Test Script: Candidate Application Submission
 * 
 * This script tests the complete application submission flow
 * Run this in the browser console (F12) after logging in as a student
 */

async function testApplicationSubmission() {
  console.log('🧪 Starting Application Submission Test...\n');

  // Step 1: Check if user is logged in
  console.log('Step 1: Checking user session...');
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  
  if (!userId || !userEmail) {
    console.error('❌ User not logged in. Please log in first.');
    return;
  }
  
  console.log('✅ User logged in:', { userId, userEmail });

  // Step 2: Check for active elections
  console.log('\nStep 2: Fetching active elections...');
  const electionsResponse = await fetch(`${window.location.origin}/api/elections/active`);
  
  if (!electionsResponse.ok) {
    console.log('⚠️ No active elections API, checking database directly...');
    // This is expected - we'll use Supabase client instead
  }

  // Step 3: Create test application data
  console.log('\nStep 3: Creating test application data...');
  const testApplicationData = {
    userId: userId,
    electionId: 'test-election-id', // Replace with actual election ID
    positionTitle: 'President',
    fullName: 'Test Candidate',
    studentId: '12345678',
    email: userEmail,
    phone: '0241234567',
    department: 'Computer Science',
    level: '300',
    transactionId: 'TEST_TXN_' + Date.now(),
    applicationFee: 100,
    photoUrl: 'test-photo.jpg',
    manifestoUrl: 'test-manifesto.pdf',
    studentIdUrl: 'test-student-id.jpg',
    transcriptUrl: 'test-transcript.pdf',
  };

  console.log('Test data:', testApplicationData);

  // Step 4: Submit application
  console.log('\nStep 4: Submitting application...');
  try {
    const response = await fetch('/api/candidate-application/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testApplicationData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Submission failed:', result);
      console.error('Status:', response.status);
      console.error('Error:', result.error);
      console.error('Details:', result.details);
      return;
    }

    console.log('✅ Submission successful!');
    console.log('Result:', result);
    console.log('Application ID:', result.applicationId);

    // Step 5: Verify in database (if you have access)
    console.log('\n✅ TEST PASSED!');
    console.log('\nNext steps:');
    console.log('1. Check Supabase database:');
    console.log('   SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1;');
    console.log('2. Check notifications:');
    console.log('   SELECT * FROM notifications WHERE type = \'application\' ORDER BY created_at DESC LIMIT 5;');
    console.log('3. Log in as admin/commission to see the application');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testApplicationSubmission();
