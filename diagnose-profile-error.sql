-- =====================================================
-- DIAGNOSE PROFILE ERROR FOR jkorkugah23.stu@cktutas.edu.gh
-- =====================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  '1️⃣ AUTH USER' as check,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not confirmed'
  END as status
FROM auth.users 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 2: Check if profile exists
SELECT 
  '2️⃣ PROFILE' as check,
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  CASE 
    WHEN role = 'admin' THEN '✅ Is admin'
    ELSE '❌ Not admin'
  END as role_check
FROM public.user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 3: Check if IDs match
SELECT 
  '3️⃣ ID MATCH' as check,
  au.id as auth_id,
  up.id as profile_id,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match'
    WHEN au.id IS NULL THEN '❌ No auth user'
    WHEN up.id IS NULL THEN '❌ No profile'
    ELSE '❌ IDs DO NOT match'
  END as match_status
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.email = up.email
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh' 
   OR up.email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 4: Check RLS policies on user_profiles
SELECT 
  '4️⃣ RLS POLICIES' as check,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Step 5: Try to select as if you were the user (simulated)
SELECT 
  '5️⃣ PROFILE ACCESS TEST' as check,
  COUNT(*) as profile_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Profile accessible'
    ELSE '❌ Profile NOT accessible (RLS issue?)'
  END as access_status
FROM public.user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
