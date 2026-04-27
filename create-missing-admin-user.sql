-- Create Admin User in Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Delete the orphaned profile (no matching auth user)
DELETE FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';

-- Step 2: Create admin user in auth.users using Supabase Auth
-- You need to do this in the Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter:
--    Email: admin@cktutas.edu.gh
--    Password: Admin@2026
--    Auto Confirm User: YES (check this box)
-- 4. Click "Create user"

-- Step 3: After creating the user in the dashboard, the trigger will automatically
-- create the profile. Then update the role:
UPDATE user_profiles 
SET role = 'admin',
    full_name = 'System Administrator',
    updated_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';

-- Verify the setup
SELECT 
  'auth.users' as table_name,
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh'

UNION ALL

SELECT 
  'user_profiles' as table_name,
  id,
  email,
  created_at
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';
