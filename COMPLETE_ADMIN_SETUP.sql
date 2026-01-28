-- =====================================================
-- COMPLETE ADMIN SETUP FOR jkorkugah23.stu@cktutas.edu.gh
-- =====================================================
-- This script will fix everything needed for admin access

-- Step 1: Ensure user exists and is confirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 2: Create or update profile with admin role
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
  COALESCE(up.full_name, 'Admin User'),
  'admin',
  'active',
  COALESCE(up.avatar_url, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'),
  COALESCE(up.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(user_profiles.full_name, ''), EXCLUDED.full_name),
  role = 'admin',
  status = 'active',
  avatar_url = COALESCE(user_profiles.avatar_url, EXCLUDED.avatar_url),
  updated_at = NOW();

-- Step 3: Verify everything is correct
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

-- Step 4: Show what to do next
SELECT 
  '📋 NEXT STEPS' as action,
  '1. Clear browser cache (Ctrl+Shift+Delete)' as step_1,
  '2. Logout if currently logged in' as step_2,
  '3. Go to http://localhost:4028/login' as step_3,
  '4. Login with jkorkugah23.stu@cktutas.edu.gh / Admin@2026' as step_4,
  '5. Should redirect to /admin-dashboard' as step_5;
