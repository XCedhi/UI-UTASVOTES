-- =====================================================
-- SIMPLE FIX: Create user_profiles for existing orphaned users
-- =====================================================
-- This script creates user_profiles for any auth.users that don't have one
-- Run this to fix any existing orphaned users

-- Create user_profiles for orphaned auth.users
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  access_start_date,
  access_end_date,
  position,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  COALESCE(au.raw_user_meta_data->>'status', 'pending'),
  (au.raw_user_meta_data->>'access_start_date')::TIMESTAMPTZ,
  (au.raw_user_meta_data->>'access_end_date')::TIMESTAMPTZ,
  COALESCE(au.raw_user_meta_data->>'position', 'Member'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show results
SELECT 
  '✅ User Profiles Created' as result,
  COUNT(*) as total_profiles
FROM public.user_profiles;

-- Verify no orphans remain
SELECT 
  '⚠️ Remaining Orphaned Users' as result,
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All users have profiles!'
    ELSE '⚠️ Some users still missing profiles'
  END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
