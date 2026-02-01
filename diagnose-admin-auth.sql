-- Check if the admin user exists in both auth.users and user_profiles

-- 1. Check auth.users table
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- 2. Check user_profiles table
SELECT 
  id,
  email,
  role,
  full_name
FROM user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- 3. Check if the IDs match
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  up.id as profile_id,
  up.email as profile_email,
  up.role,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs MATCH'
    ELSE '❌ IDs DO NOT MATCH - THIS IS THE PROBLEM'
  END as status
FROM auth.users au
FULL OUTER JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh' 
   OR up.email = 'jkorkugah23.stu@cktutas.edu.gh';
