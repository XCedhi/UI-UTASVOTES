-- =====================================================
-- PROMOTE EXISTING USER TO ADMIN
-- =====================================================
-- This will give admin access to: jkorkugah23.stu@cktutas.edu.gh

-- Step 1: Check if user exists
SELECT 
  '1️⃣ USER CHECK' as step,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role as current_role,
  up.status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 2: Update user role to admin
UPDATE public.user_profiles
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 3: Verify the update
SELECT 
  '✅ ADMIN PROMOTED' as status,
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  CASE 
    WHEN up.role = 'admin' AND up.status = 'active' 
    THEN '🎉 Ready to login as admin!'
    ELSE '⚠️ Something went wrong'
  END as ready_status
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Step 4: Show login instructions
SELECT 
  '📋 LOGIN INSTRUCTIONS' as info,
  'http://localhost:4028/login' as url,
  'jkorkugah23.stu@cktutas.edu.gh' as email,
  'Use your existing password' as password,
  'You will be redirected to admin dashboard' as note;
