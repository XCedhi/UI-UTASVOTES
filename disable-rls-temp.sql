-- Temporarily disable RLS on user_profiles to test
-- Run this in Supabase SQL Editor

-- Disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';
