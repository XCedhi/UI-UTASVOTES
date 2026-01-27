-- Diagnostic script to check admin user setup
-- Run this in Supabase SQL Editor while logged in as admin

-- 1. Check current authenticated user
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- 2. Check if current user exists in user_profiles
SELECT 
  id,
  email,
  full_name,
  role,
  status
FROM user_profiles
WHERE id = auth.uid();

-- 3. Check if admin_update_user function exists
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'admin_update_user';

-- 4. List all users with their roles
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 5. Check RLS status on user_profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_profiles';

-- 6. List all RLS policies on user_profiles
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles';
