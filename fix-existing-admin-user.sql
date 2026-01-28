-- =====================================================
-- FIX EXISTING ADMIN USER
-- =====================================================
-- The admin user exists but can't login
-- This script will fix the password and ensure everything is set up

-- 1. Get the admin user ID
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@cktutas.edu.gh';
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION '❌ Admin user not found in auth.users';
  END IF;
  
  RAISE NOTICE '✅ Found admin user with ID: %', v_admin_id;
  
  -- 2. Update password to Admin@2026
  UPDATE auth.users
  SET 
    encrypted_password = crypt('Admin@2026', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_admin_id;
  
  RAISE NOTICE '✅ Password updated to: Admin@2026';
  RAISE NOTICE '✅ Email confirmed';
  
  -- 3. Ensure user profile exists
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
  VALUES (
    v_admin_id,
    'admin@cktutas.edu.gh',
    'System Administrator',
    'admin',
    'active',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RAISE NOTICE '✅ User profile created/updated';
  
END $$;

-- 4. Verify everything is set up correctly
SELECT 
  '✅ VERIFICATION' as status,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL 
      AND up.role = 'admin' 
      AND up.status = 'active' 
    THEN '✅ Ready to login!'
    ELSE '⚠️ Something might be wrong'
  END as ready_status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';

-- 5. Show login instructions
SELECT 
  '📋 LOGIN INSTRUCTIONS' as info,
  'http://localhost:4028/login' as url,
  'admin@cktutas.edu.gh' as email,
  'Admin@2026' as password,
  'Go to the URL above and use these credentials' as instructions;
