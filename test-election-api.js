// Test the election creation API
// Run with: node test-election-api.js

const testData = {
  name: "Test Election 2026",
  description: "Testing election creation via API",
  election_type: "university-wide",
  department: null,
  nomination_start: "2026-02-01T00:00:00",
  nomination_end: "2026-02-15T23:59:59",
  voting_start: "2026-02-16T00:00:00",
  voting_end: "2026-02-20T23:59:59",
  positions: ["President", "Vice President", "Secretary"],
  userId: "test-user-id" // Replace with actual user ID
};

fetch('http://localhost:4028/api/elections/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });
