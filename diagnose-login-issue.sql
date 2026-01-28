-- =====================================================
-- DIAGNOSE LOGIN ISSUE
-- =====================================================
-- Run this to understand why login is failing

-- 1. Check if admin exists in auth.users
SELECT 
  '1️⃣ Auth User Check' as step,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Admin exists in auth.users'
    ELSE '❌ Admin NOT in auth.users - CREATE USER FIRST'
  END as status,
  COUNT(*) as count
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh';

-- 2. Check if admin exists in user_profiles
SELECT 
  '2️⃣ Profile Check' as step,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Admin profile exists'
    ELSE '❌ Admin profile NOT found - CREATE PROFILE'
  END as status,
  COUNT(*) as count
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- 3. Check if email is confirmed
SELECT 
  '3️⃣ Email Confirmation' as step,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email NOT confirmed - RUN: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = ''admin@cktutas.edu.gh'''
  END as status,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh';

-- 4. Check if IDs match
SELECT 
  '4️⃣ ID Match Check' as step,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match'
    WHEN au.id IS NULL THEN '❌ No auth user'
    WHEN up.id IS NULL THEN '❌ No profile'
    ELSE '❌ IDs DO NOT match'
  END as status,
  au.id as auth_id,
  up.id as profile_id
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh' OR up.email = 'admin@cktutas.edu.gh';

-- 5. Check user status
SELECT 
  '5️⃣ User Status' as step,
  up.status,
  CASE 
    WHEN up.status = 'active' THEN '✅ User is active'
    ELSE '❌ User is ' || up.status || ' - RUN: UPDATE user_profiles SET status = ''active'' WHERE email = ''admin@cktutas.edu.gh'''
  END as status_check
FROM public.user_profiles up
WHERE up.email = 'admin@cktutas.edu.gh';

-- 6. Show complete user info
SELECT 
  '6️⃣ Complete Info' as step,
  au.id,
  au.email,
  au.created_at as auth_created,
  au.email_confirmed_at,
  au.last_sign_in_at,
  up.full_name,
  up.role,
  up.status,
  up.avatar_url
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh' OR up.email = 'admin@cktutas.edu.gh';

-- 7. Summary and next steps
SELECT 
  '📋 SUMMARY' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@cktutas.edu.gh') = 0 
    THEN '❌ CREATE USER: Go to Supabase Dashboard → Authentication → Users → Add User'
    
    WHEN (SELECT COUNT(*) FROM public.user_profiles WHERE email = 'admin@cktutas.edu.gh') = 0
    THEN '❌ CREATE PROFILE: Run the INSERT query from CREATE_ADMIN_USER_GUIDE.md'
    
    WHEN (SELECT email_confirmed_at FROM auth.users WHERE email = 'admin@cktutas.edu.gh') IS NULL
    THEN '❌ CONFIRM EMAIL: Run: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = ''admin@cktutas.edu.gh'''
    
    WHEN (SELECT status FROM public.user_profiles WHERE email = 'admin@cktutas.edu.gh') != 'active'
    THEN '❌ ACTIVATE USER: Run: UPDATE user_profiles SET status = ''active'' WHERE email = ''admin@cktutas.edu.gh'''
    
    ELSE '✅ Everything looks good! Try logging in again. If still failing, check browser console for errors.'
  END as next_step;
