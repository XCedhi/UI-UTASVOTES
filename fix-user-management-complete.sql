-- =====================================================
-- COMPLETE FIX FOR USER MANAGEMENT UPDATE ISSUE
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Step 1: Create or replace the admin_update_user function
CREATE OR REPLACE FUNCTION admin_update_user(
  user_id UUID,
  new_role TEXT,
  new_status TEXT,
  new_access_start TIMESTAMPTZ DEFAULT NULL,
  new_access_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions, bypasses RLS
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update users. Current user: %, Role: %', 
      auth.uid(), 
      (SELECT role FROM user_profiles WHERE id = auth.uid());
  END IF;

  -- Update the user
  UPDATE user_profiles
  SET 
    role = new_role,
    status = new_status,
    access_start_date = new_access_start,
    access_end_date = new_access_end,
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  RAISE NOTICE 'User % updated successfully by admin %', user_id, auth.uid();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_update_user TO authenticated;

-- Step 2: Update RLS policies to allow admin updates
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create comprehensive admin policy
CREATE POLICY "Admins can manage all profiles" 
ON user_profiles 
FOR ALL 
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

-- Step 3: Verify admin user exists
-- Check if admin@cktutas.edu.gh exists and has admin role
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM user_profiles
  WHERE email = 'admin@cktutas.edu.gh' AND role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE WARNING 'No admin user found with email admin@cktutas.edu.gh';
    RAISE WARNING 'Please ensure your admin user has role = admin in user_profiles table';
  ELSE
    RAISE NOTICE 'Admin user verified: admin@cktutas.edu.gh';
  END IF;
END $$;

-- Step 4: Show current state
SELECT 
  'Current Users' as info,
  id,
  email,
  full_name,
  role,
  status
FROM user_profiles
ORDER BY created_at DESC;

-- Step 5: Verify function was created
SELECT 
  'Function Status' as info,
  proname as function_name,
  prosecdef as is_security_definer,
  'Created successfully' as status
FROM pg_proc
WHERE proname = 'admin_update_user';
