-- Check if support_tickets table exists and view its structure

-- 1. Check if table exists
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets'
  ) as table_exists;

-- 2. If table exists, view its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'support_tickets'
ORDER BY ordinal_position;

-- 3. Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'trigger_set_ticket_number';

-- 4. Try to insert a test ticket to see if it works
-- (This will fail if table doesn't exist or has issues)
-- Uncomment the lines below to test:

/*
INSERT INTO support_tickets (
  user_email,
  user_name,
  subject,
  message,
  category,
  priority,
  status
) VALUES (
  'test@cktutas.edu.gh',
  'Test User',
  'Test ticket',
  'This is a test ticket to verify the table works',
  'general',
  'low',
  'open'
) RETURNING ticket_number, id, created_at;
*/
