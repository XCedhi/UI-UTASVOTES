-- =====================================================
-- FINAL PASSWORD RESET FOR ADMIN USER
-- =====================================================
-- This will properly set the password to Admin@2026

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reset admin password
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin@2026', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';

-- Ensure user profile exists and is active
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
  'System Administrator',
  'admin',
  'active',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Verify everything is set up correctly
SELECT 
  '✅ VERIFICATION' as status,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.encrypted_password IS NOT NULL as has_password,
  LENGTH(au.encrypted_password) as password_length,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL 
      AND au.encrypted_password IS NOT NULL
      AND up.role = 'admin' 
      AND up.status = 'active' 
    THEN '✅ READY TO LOGIN!'
    ELSE '⚠️ Something is wrong'
  END as ready_status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';

-- Show login instructions
SELECT 
  '📋 LOGIN NOW' as action,
  'http://localhost:4028/login' as url,
  'admin@cktutas.edu.gh' as email,
  'Admin@2026' as password,
  'Password has been reset - try logging in now!' as message;
