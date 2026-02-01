-- Fix: Update user_profiles.id to match auth.users.id for the admin user

-- First, let's see what we're working with
DO $$
DECLARE
  auth_user_id UUID;
  profile_user_id UUID;
BEGIN
  -- Get the auth.users ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

  -- Get the user_profiles ID
  SELECT id INTO profile_user_id
  FROM user_profiles
  WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

  -- If they don't match, update user_profiles to use the auth ID
  IF auth_user_id IS NOT NULL AND profile_user_id IS NOT NULL AND auth_user_id != profile_user_id THEN
    RAISE NOTICE 'Fixing ID mismatch: auth.users ID = %, user_profiles ID = %', auth_user_id, profile_user_id;
    
    -- Update the user_profiles ID to match auth.users ID
    UPDATE user_profiles
    SET id = auth_user_id
    WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
    
    RAISE NOTICE '✅ Fixed! user_profiles.id updated to match auth.users.id';
  ELSIF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ No user found in auth.users with email jkorkugah23.stu@cktutas.edu.gh';
  ELSIF profile_user_id IS NULL THEN
    RAISE NOTICE '❌ No user found in user_profiles with email jkorkugah23.stu@cktutas.edu.gh';
  ELSE
    RAISE NOTICE '✅ IDs already match! auth.users.id = user_profiles.id = %', auth_user_id;
  END IF;
END $$;

-- Verify the fix
SELECT 
  au.id as auth_id,
  up.id as profile_id,
  up.email,
  up.role,
  CASE 
    WHEN au.id = up.id THEN '✅ FIXED - IDs NOW MATCH'
    ELSE '❌ STILL BROKEN'
  END as status
FROM auth.users au
JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';
