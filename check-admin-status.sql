-- =====================================================
-- CHECK ADMIN USER STATUS
-- =====================================================
-- Run this to see the current state of the admin user

-- Check if admin exists in auth.users
SELECT 
  '1️⃣ AUTH USER CHECK' as step,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email NOT confirmed'
  END as email_status,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✅ Has password'
    ELSE '❌ No password'
  END as password_status
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';

-- Check if profile exists
SELECT 
  '2️⃣ PROFILE CHECK' as step,
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- Check if IDs match
SELECT 
  '3️⃣ ID MATCH CHECK' as step,
  au.id as auth_id,
  up.id as profile_id,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match perfectly'
    ELSE '❌ IDs DO NOT match - this is a problem!'
  END as match_status
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.email = up.email
WHERE au.email = 'admin@cktutas.edu.gh' OR up.email = 'admin@cktutas.edu.gh';
