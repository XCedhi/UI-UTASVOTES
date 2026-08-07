-- =====================================================
-- DIAGNOSE AND FIX PROFILE ACCESS ISSUES
-- =====================================================

-- Step 1: Check if user_profiles table exists and has data
SELECT 
    'Table exists' as status,
    COUNT(*) as total_profiles
FROM user_profiles;

-- Step 2: Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Step 3: Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Step 4: List all users in auth.users and their profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.email as profile_email,
    up.role,
    up.full_name,
    CASE 
        WHEN up.id IS NULL THEN '❌ NO PROFILE'
        ELSE '✅ HAS PROFILE'
    END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 20;

-- =====================================================
-- FIX: Drop all existing policies and recreate them properly
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Enable RLS (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies

-- 1. Allow authenticated users to read their own profile
CREATE POLICY "users_read_own_profile" 
ON user_profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 2. Allow authenticated users to update their own profile
CREATE POLICY "users_update_own_profile" 
ON user_profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow service role full access (for admin operations and user creation)
CREATE POLICY "service_role_all_access" 
ON user_profiles 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Allow anon users to insert profiles (for registration)
CREATE POLICY "anon_insert_profile" 
ON user_profiles 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- =====================================================
-- VERIFY THE FIX
-- =====================================================

-- Check policies were created
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test if a specific user can read their profile (replace with actual user ID)
-- This should return 1 row if the user exists
-- SELECT * FROM user_profiles WHERE id = 'USER_ID_HERE';

COMMIT;
