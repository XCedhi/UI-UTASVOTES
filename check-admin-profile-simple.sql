-- Check admin profile in database
-- Run this in your Supabase SQL Editor

-- 1. Check if admin user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh';

-- 2. Check if admin profile exists in user_profiles
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  avatar_url,
  created_at
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- 3. Count unread notifications for admin
SELECT COUNT(*) as unread_count
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
WHERE u.email = 'admin@cktutas.edu.gh'
AND n.is_read = false;

-- 4. If profile doesn't exist, create it (uncomment to run)
/*
INSERT INTO user_profiles (id, email, full_name, role, status)
SELECT 
  id,
  email,
  'System Administrator',
  'admin',
  'active'
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh'
ON CONFLICT (id) DO NOTHING;
*/
