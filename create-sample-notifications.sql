-- ============================================================
-- Create Sample Notifications for Testing
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This creates sample notifications for students
-- ============================================================

-- 1. Get student user IDs (we'll create notifications for them)
-- Replace with actual user IDs from your database

-- 2. Create sample notifications
-- Note: Replace 'YOUR_USER_ID' with actual user ID from user_profiles table

-- Sample notification 1: Election announcement
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh' LIMIT 1),
  'election',
  'New Election Announced',
  'Student Council 2026 Election has been scheduled. Voting opens on August 15, 2026.',
  '/election-guidelines',
  false,
  NOW() - INTERVAL '2 hours'
);

-- Sample notification 2: Application status
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh' LIMIT 1),
  'application',
  'Application Submitted',
  'Your candidate application for WOCOM has been received and is under review.',
  '/profile',
  false,
  NOW() - INTERVAL '1 day'
);

-- Sample notification 3: Result available
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh' LIMIT 1),
  'result',
  'Election Results Available',
  'Results for Student Council 2026 Election are now available. Click to view winners.',
  '/student-election-results',
  false,
  NOW() - INTERVAL '5 hours'
);

-- Sample notification 4: Deadline reminder
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh' LIMIT 1),
  'deadline',
  'Voting Ends Soon',
  'Reminder: Voting for Student Council 2026 ends in 24 hours. Cast your vote now!',
  '/voting-interface',
  false,
  NOW() - INTERVAL '30 minutes'
);

-- Sample notification 5: System update (read)
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh' LIMIT 1),
  'system',
  'Platform Maintenance Complete',
  'UTASVotes platform maintenance has been completed. All systems are operational.',
  null,
  true,
  NOW() - INTERVAL '3 days'
);

-- Create notifications for all students (broadcast)
-- This creates a general announcement for all students
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
SELECT 
  id,
  'election',
  'Welcome to UTASVotes 2026',
  'Welcome to the digital voting platform for UTAS. Stay tuned for upcoming elections and important announcements.',
  '/student-dashboard',
  false,
  NOW() - INTERVAL '1 week'
FROM user_profiles
WHERE role = 'student'
ON CONFLICT DO NOTHING;

-- Verify notifications were created
SELECT 
  n.id,
  n.type,
  n.title,
  n.is_read,
  n.created_at,
  up.email as user_email
FROM notifications n
JOIN user_profiles up ON n.user_id = up.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Success message
SELECT '✅ Sample notifications created!' as message;
