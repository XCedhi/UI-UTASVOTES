-- Fix RLS policies for candidates table to allow commission and admin to read applications

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Allow commission and admin to read all candidates" ON candidates;
DROP POLICY IF EXISTS "Commission can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Admin can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Users can view all candidates" ON candidates;

-- Create a comprehensive read policy for authenticated users
-- This allows commission and admin users to see all candidate applications
CREATE POLICY "Authenticated users can read candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);

-- Allow commission and admin to update candidate status (approve/reject)
DROP POLICY IF EXISTS "Commission and admin can update candidates" ON candidates;
CREATE POLICY "Commission and admin can update candidates"
ON candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'commission')
  )
);

-- Allow students to insert their own applications
DROP POLICY IF EXISTS "Students can insert their applications" ON candidates;
CREATE POLICY "Students can insert their applications"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Allow users to view their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON candidates;
CREATE POLICY "Users can view own applications"
ON candidates
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'commission')
  )
);

-- Grant necessary permissions
GRANT SELECT ON candidates TO authenticated;
GRANT INSERT ON candidates TO authenticated;
GRANT UPDATE ON candidates TO authenticated;

-- Verify the policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'candidates'
ORDER BY policyname;
