-- =====================================================
-- FIX PROFILE FETCH ERROR AFTER LOGIN
-- =====================================================
-- This script fixes RLS policies to allow users to read their own profiles after authentication

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;

-- Create a comprehensive read policy for authenticated users
CREATE POLICY "authenticated_users_read_own_profile" 
ON user_profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Also allow service role full access (for admin operations)
CREATE POLICY "service_role_full_access" 
ON user_profiles 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Verify the policies
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
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test query (this should work after authentication)
-- SELECT * FROM user_profiles WHERE id = auth.uid();
