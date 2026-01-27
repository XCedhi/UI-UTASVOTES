-- Complete diagnostic to understand the permission issue
-- Run this in Supabase SQL Editor

-- 1. Check if table exists and who owns it
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'support_tickets';

-- 2. Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'support_tickets';

-- 3. Check all policies on the table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'support_tickets';

-- 4. Check table permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'support_tickets';

-- 5. Check if service_role can access the table
SELECT 
  has_table_privilege('service_role', 'support_tickets', 'INSERT') as can_insert,
  has_table_privilege('service_role', 'support_tickets', 'SELECT') as can_select,
  has_table_privilege('service_role', 'support_tickets', 'UPDATE') as can_update,
  has_table_privilege('service_role', 'support_tickets', 'DELETE') as can_delete;

-- 6. Show current database user
SELECT current_user, session_user;

SELECT '📊 Diagnostic complete! Review the results above.' as status;
