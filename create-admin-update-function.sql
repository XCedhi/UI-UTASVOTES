-- Create a database function that admins can call to update users
-- This bypasses RLS policies
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_update_user(
  user_id UUID,
  new_role TEXT,
  new_status TEXT,
  new_access_start TIMESTAMPTZ DEFAULT NULL,
  new_access_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the permissions of the function owner (bypasses RLS)
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update users';
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
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_user TO authenticated;
