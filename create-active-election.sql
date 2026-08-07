-- =====================================================
-- CREATE AN ACTIVE ELECTION FOR TESTING
-- =====================================================

-- First, check what elections already exist
SELECT id, title, type, status FROM elections;

-- If you have existing elections, just activate one:
-- UPDATE elections 
-- SET status = 'active' 
-- WHERE id = 'YOUR_ELECTION_ID_HERE';

-- If you need to create a new election, use one of these valid types:
-- Valid types are usually: 'departmental', 'university-wide', 'faculty', etc.

-- Create a new active election (using 'departmental' type)
INSERT INTO elections (
  title, 
  type, 
  status, 
  start_date, 
  end_date, 
  description,
  position
)
VALUES (
  'SRC General Elections 2024',
  'departmental',  -- Changed from 'general' to 'departmental'
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  'Annual Student Representative Council Elections',
  'President'  -- The position students can apply for
);

-- Verify the election was created
SELECT id, title, type, status, position FROM elections WHERE status = 'active';
