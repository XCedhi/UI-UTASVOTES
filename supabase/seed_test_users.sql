-- =====================================================
-- UTASVOTES TEST USER SEEDING
-- =====================================================
-- This file creates test users for development/testing
-- Run AFTER schema_comprehensive.sql
-- =====================================================

-- Note: In production, users are created via Supabase Auth signup
-- This seed file is for development/testing only

-- =====================================================
-- IMPORTANT: Manual Steps Required
-- =====================================================
-- 1. Create users in Supabase Dashboard → Authentication → Users
-- 2. Copy their UUIDs
-- 3. Update the UUIDs below
-- 4. Run this script to create their profiles

-- OR use the Supabase Auth API to create users programmatically

-- =====================================================
-- TEST USER PROFILES
-- =====================================================

-- After creating users in Supabase Auth, insert their profiles here
-- Replace the UUIDs with actual user IDs from Supabase Auth

-- Example: Student User
-- Email: student@cktutas.edu.gh
-- Password: Student@2026
INSERT INTO public.user_profiles (
  id, 
  email, 
  full_name, 
  student_id,
  department,
  level,
  cgpa,
  role, 
  status,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID from Supabase Auth
  'student@cktutas.edu.gh',
  'John Mensah',
  'UTAS2024001',
  'Computer Science',
  '300',
  3.45,
  'student',
  'active',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Example: Candidate User
-- Email: candidate@cktutas.edu.gh
-- Password: Candidate@2026
INSERT INTO public.user_profiles (
  id, 
  email, 
  full_name, 
  student_id,
  department,
  level,
  cgpa,
  role, 
  status,
  avatar_url,
  bio
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Replace with actual UUID
  'candidate@cktutas.edu.gh',
  'Ama Osei',
  'UTAS2024002',
  'Business Administration',
  '400',
  3.67,
  'candidate',
  'active',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  'Aspiring SRC President committed to student welfare and campus development.'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Example: Electoral Commission User
-- Email: commission@cktutas.edu.gh
-- Password: Commission@2026
INSERT INTO public.user_profiles (
  id, 
  email, 
  full_name, 
  position,
  department,
  role, 
  status,
  avatar_url,
  access_start_date,
  access_end_date
) VALUES (
  '00000000-0000-0000-0000-000000000003', -- Replace with actual UUID
  'commission@cktutas.edu.gh',
  'Dr. Kwame Nkrumah',
  'Electoral Commissioner',
  'Student Affairs',
  'commission',
  'active',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
  NOW(),
  NOW() + INTERVAL '1 year' -- Commission access expires in 1 year
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Example: Admin User
-- Email: admin@cktutas.edu.gh
-- Password: Admin@2026
INSERT INTO public.user_profiles (
  id, 
  email, 
  full_name, 
  position,
  role, 
  status,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000004', -- Replace with actual UUID
  'admin@cktutas.edu.gh',
  'System Administrator',
  'System Administrator',
  'admin',
  'active',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test user profiles created!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IMPORTANT: You must create these users in Supabase Auth first:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Student: student@cktutas.edu.gh / Student@2026';
  RAISE NOTICE '2. Candidate: candidate@cktutas.edu.gh / Candidate@2026';
  RAISE NOTICE '3. Commission: commission@cktutas.edu.gh / Commission@2026';
  RAISE NOTICE '4. Admin: admin@cktutas.edu.gh / Admin@2026';
  RAISE NOTICE '';
  RAISE NOTICE 'Then update the UUIDs in this file and run again.';
  RAISE NOTICE '========================================';
END $$;

