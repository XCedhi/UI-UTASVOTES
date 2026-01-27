-- Verify Support Ticket System Setup
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if tables exist
SELECT 
  'support_tickets' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets'
  ) as exists;

SELECT 
  'support_ticket_responses' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'support_ticket_responses'
  ) as exists;

-- 2. Check if view exists
SELECT 
  'support_ticket_stats' as view_name,
  EXISTS (
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'support_ticket_stats'
  ) as exists;

-- 3. Check if functions exist
SELECT 
  'generate_ticket_number' as function_name,
  EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'generate_ticket_number'
  ) as exists;

SELECT 
  'set_ticket_number' as function_name,
  EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'set_ticket_number'
  ) as exists;

-- 4. Check if triggers exist
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname IN ('trigger_set_ticket_number', 'trigger_support_tickets_updated_at');

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('support_tickets', 'support_ticket_responses')
ORDER BY tablename, policyname;

-- 6. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('support_tickets', 'support_ticket_responses');

-- 7. Count existing tickets
SELECT 
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets
FROM support_tickets;

-- 8. View recent tickets (if any)
SELECT 
  ticket_number,
  user_email,
  subject,
  category,
  priority,
  status,
  created_at
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('support_tickets', 'support_ticket_responses')
ORDER BY tablename, indexname;

-- 10. Test ticket number generation
SELECT generate_ticket_number() as sample_ticket_number;

-- Summary
SELECT 
  '✅ Setup Verification Complete' as status,
  'Check results above to ensure all components exist' as message;
