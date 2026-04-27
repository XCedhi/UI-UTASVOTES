-- Fix Admin User and Profile Issues
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Delete orphaned admin profile (no matching auth user)
DELETE FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';

-- Step 2: Fix commission profile (add missing full_name)
UPDATE user_profiles 
SET full_name = COALESCE(full_name, 'Electoral Commission Member'),
    updated_at = NOW()
WHERE email = 'commission@cktutas.edu.gh';

-- Step 3: Fix student profile (add missing full_name if needed)
UPDATE user_profiles 
SET full_name = COALESCE(full_name, 'Student User'),
    updated_at = NOW()
WHERE email = 'student@cktutas.edu.gh';

-- Step 4: Verify all profiles have required fields
SELECT 
  id,
  email,
  role,
  full_name,
  CASE 
    WHEN full_name IS NULL THEN '❌ Missing full_name'
    ELSE '✅ OK'
  END as status
FROM user_profiles
ORDER BY role, email;

-- Step 5: Check auth users
SELECT 
  'auth.users' as source,
  id,
  email,
  created_at
FROM auth.users
ORDER BY email;
