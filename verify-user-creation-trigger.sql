-- =====================================================
-- VERIFICATION SCRIPT: User Creation Trigger
-- =====================================================
-- Run this after applying fix-user-creation-trigger.sql

-- 1. Check if trigger exists
SELECT 
  '✅ Trigger Status' as check_type,
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 2. Check if function exists
SELECT 
  '✅ Function Status' as check_type,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 3. Check recent auth.users records
SELECT 
  '📊 Recent Auth Users' as check_type,
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'status' as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check recent user_profiles records
SELECT 
  '📊 Recent User Profiles' as check_type,
  id,
  email,
  full_name,
  role,
  status,
  access_start_date,
  access_end_date,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check for orphaned auth.users (users without profiles)
SELECT 
  '⚠️ Orphaned Users' as check_type,
  au.id,
  au.email,
  au.created_at,
  'Missing user_profiles record' as issue
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ORDER BY au.created_at DESC;

-- 6. Check for orphaned user_profiles (profiles without auth users)
SELECT 
  '⚠️ Orphaned Profiles' as check_type,
  up.id,
  up.email,
  up.created_at,
  'Missing auth.users record' as issue
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL
ORDER BY up.created_at DESC;

-- 7. Summary statistics
SELECT 
  '📈 Summary' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.user_profiles) as total_user_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.user_profiles up ON au.id = up.id WHERE up.id IS NULL) as orphaned_auth_users,
  (SELECT COUNT(*) FROM public.user_profiles up LEFT JOIN auth.users au ON up.id = au.id WHERE au.id IS NULL) as orphaned_profiles;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- ✅ Trigger Status: Should show 1 row with trigger details
-- ✅ Function Status: Should show 1 row with function details
-- 📊 Recent Auth Users: Shows last 5 users created
-- 📊 Recent User Profiles: Shows last 5 profiles created
-- ⚠️ Orphaned Users: Should be empty (0 rows) after fix
-- ⚠️ Orphaned Profiles: May have some old records (ignore)
-- 📈 Summary: total_auth_users should equal total_user_profiles
