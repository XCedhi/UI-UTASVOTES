-- Quick test to verify Supabase is accessible
-- Run this in Supabase SQL Editor

-- Test 1: Check if support_tickets table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'support_tickets';

-- Test 2: Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'support_tickets';

-- Test 3: Try to see table structure (should work even with RLS)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'support_tickets'
ORDER BY ordinal_position;

-- If all three queries return results, Supabase is working fine!
SELECT '✅ Supabase is accessible and working!' as status;
