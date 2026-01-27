/**
 * Test Support Ticket System
 * 
 * This script tests the support ticket API endpoint
 * Run with: node test-support-ticket.js
 */

const testTicketSubmission = async () => {
  console.log('🧪 Testing Support Ticket System...\n');

  const testData = {
    subject: 'Test Ticket - System Verification',
    category: 'technical',
    priority: 'medium',
    message: 'This is a test ticket to verify the support system is working correctly. Please ignore this ticket.',
    userEmail: 'test@cktutas.edu.gh',
    userName: 'Test User',
    userId: null
  };

  try {
    console.log('📤 Sending test ticket...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    console.log('');

    const response = await fetch('http://localhost:4028/api/submit-support-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Ticket created successfully\n');
      console.log('📋 Ticket Details:');
      console.log('   Ticket Number:', result.ticket.ticket_number);
      console.log('   Ticket ID:', result.ticket.id);
      console.log('   Status:', result.ticket.status);
      console.log('   Created At:', result.ticket.created_at);
      console.log('');
      console.log('🎉 Support ticket system is working correctly!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Check Supabase Dashboard → Table Editor → support_tickets');
      console.log('2. You should see your test ticket');
      console.log('3. Try submitting via the UI at http://localhost:4028/contact-admin');
    } else {
      console.log('❌ FAILED! Error creating ticket\n');
      console.log('Error:', result.error);
      console.log('Details:', result.details || 'No details provided');
      console.log('');
      console.log('Troubleshooting:');
      console.log('1. Make sure you ran the database migration (support_tickets_schema.sql)');
      console.log('2. Check SUPABASE_SERVICE_ROLE_KEY in .env file');
      console.log('3. Verify development server is running (npm run dev)');
      console.log('4. Check terminal for any error messages');
    }
  } catch (error) {
    console.log('❌ ERROR! Failed to connect to API\n');
    console.log('Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure development server is running: npm run dev');
    console.log('2. Verify server is running on port 4028');
    console.log('3. Check if API route exists: src/app/api/submit-support-ticket/route.ts');
  }
};

// Run the test
testTicketSubmission();
