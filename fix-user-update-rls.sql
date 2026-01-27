-- Fix RLS policies for user_profiles table to allow admin updates
-- Run this in your Supabase SQL Editor

-- First, let's see current policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Create new policy that allows admins to update any user
CREATE POLICY "Admins can update any user"
ON user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Also allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'user_profiles' AND cmd = 'UPDATE';
