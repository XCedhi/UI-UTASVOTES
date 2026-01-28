-- =====================================================
-- FIX PROFILE ISSUE FOR jkorkugah23.stu@cktutas.edu.gh
-- =====================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  '1️⃣ AUTH USER CHECK' as step,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 2: Check if profile exists
SELECT 
  '2️⃣ PROFILE CHECK' as step,
  id,
  email,
  full_name,
  role,
  status
FROM public.user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 3: Create profile if missing (this will work even if profile exists)
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  'Admin User',
  'admin',
  'active',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(NULLIF(user_profiles.full_name, ''), 'Admin User'),
  role = 'admin',
  status = 'active',
  avatar_url = COALESCE(user_profiles.avatar_url, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'),
  updated_at = NOW();

-- Step 4: Verify everything is correct
SELECT 
  '✅ FINAL VERIFICATION' as status,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match'
    ELSE '❌ IDs mismatch'
  END as id_check,
  CASE 
    WHEN up.role = 'admin' THEN '✅ Is admin'
    ELSE '❌ Not admin'
  END as role_check,
  CASE 
    WHEN up.status = 'active' THEN '✅ Active'
    ELSE '❌ Not active'
  END as status_check,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL 
      AND up.role = 'admin' 
      AND up.status = 'active'
      AND au.id = up.id
    THEN '🎉 READY TO LOGIN!'
    ELSE '⚠️ Something still needs fixing'
  END as final_status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 5: Show login instructions
SELECT 
  '📋 LOGIN NOW' as action,
  'http://localhost:4028/login' as url,
  'jkorkugah23.stu@cktutas.edu.gh' as email,
  'Admin@2026' as password,
  'Clear browser cache first!' as important_note;
