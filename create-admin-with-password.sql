-- =====================================================
-- CREATE ADMIN USER WITH PASSWORD IN SUPABASE AUTH
-- =====================================================
-- This script creates the admin user in both auth.users and user_profiles
-- Run this in Supabase SQL Editor

-- IMPORTANT: This uses Supabase's admin functions
-- Make sure you're running this as a superuser

-- 1. First, check if admin already exists and delete if needed
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@cktutas.edu.gh';
  
  IF v_user_id IS NOT NULL THEN
    -- Delete from user_profiles first (due to foreign key)
    DELETE FROM public.user_profiles WHERE id = v_user_id;
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = v_user_id;
    RAISE NOTICE '🗑️ Deleted existing admin user';
  END IF;
END $$;

-- 2. Create admin user in auth.users with a known ID
-- We'll use a specific UUID so we can reference it
DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001'; -- Fixed UUID for admin
  v_encrypted_password TEXT;
BEGIN
  -- Generate encrypted password for 'Admin@2026'
  -- Note: Supabase uses bcrypt, but we'll let Supabase handle this via the dashboard
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  )
  VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@cktutas.edu.gh',
    crypt('Admin@2026', gen_salt('bf')), -- Encrypt password with bcrypt
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Administrator","role":"admin"}',
    false,
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into user_profiles
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
  
  RAISE NOTICE '✅ Admin user created successfully';
  RAISE NOTICE '📧 Email: admin@cktutas.edu.gh';
  RAISE NOTICE '🔑 Password: Admin@2026';
  RAISE NOTICE '🆔 User ID: %', v_admin_id;
END $$;

-- 3. Verify the user was created
SELECT 
  '✅ Verification' as status,
  au.id,
  au.email,
  au.email_confirmed_at,
  up.full_name,
  up.role,
  up.status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';

-- 4. Show login instructions
SELECT 
  '📋 Login Instructions' as info,
  'Go to http://localhost:4028/login' as url,
  'admin@cktutas.edu.gh' as email,
  'Admin@2026' as password;
