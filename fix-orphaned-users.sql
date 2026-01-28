-- =====================================================
-- FIX ORPHANED USERS
-- =====================================================
-- This script creates user_profiles for any auth.users that don't have one
-- Run this AFTER applying fix-user-creation-trigger.sql

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
  au.raw_user_meta_data->>'position',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show results
SELECT 
  '✅ Fixed Orphaned Users' as result,
  COUNT(*) as users_fixed
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NOT NULL;

-- Verify no orphans remain
SELECT 
  '⚠️ Remaining Orphaned Users' as result,
  COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
