-- =====================================================
-- CHECK ADMIN USER IN AUTH AND PROFILES
-- =====================================================

-- 1. Check if admin exists in auth.users
SELECT 
  '🔍 Admin in auth.users' as check_type,
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh';

-- 2. Check if admin exists in user_profiles
SELECT 
  '🔍 Admin in user_profiles' as check_type,
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- 3. Check for any mismatches
SELECT 
  '⚠️ Orphaned Records' as check_type,
  CASE 
    WHEN au.id IS NULL THEN 'Profile exists but no auth user'
    WHEN up.id IS NULL THEN 'Auth user exists but no profile'
    ELSE 'Both exist - OK'
  END as status,
  COALESCE(au.email, up.email) as email
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.id = up.id
WHERE COALESCE(au.email, up.email) = 'admin@cktutas.edu.gh';

-- 4. Show all test users status
SELECT 
  '📊 All Test Users' as info,
  au.email,
  CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as in_auth,
  CASE WHEN up.id IS NOT NULL THEN '✅' ELSE '❌' END as in_profiles,
  up.role,
  up.status
FROM auth.users au
FULL OUTER JOIN public.user_profiles up ON au.id = up.id
WHERE au.email LIKE '%@cktutas.edu.gh' OR up.email LIKE '%@cktutas.edu.gh'
ORDER BY au.email;
