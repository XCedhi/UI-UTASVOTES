-- Fix RLS policies to allow users to update their own requires_password_change flag

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Drop existing update policy if it's too restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create a new policy that allows users to update their own profile
-- including the requires_password_change flag
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile';
