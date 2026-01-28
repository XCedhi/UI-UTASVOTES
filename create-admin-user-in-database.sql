-- Create admin user in Supabase database
-- Run this in your Supabase SQL Editor

-- First, create the auth user (if not exists)
-- Note: You'll need to do this in Supabase Dashboard > Authentication > Users
-- Or use this SQL (requires proper permissions):

-- Insert into auth.users if not exists
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
  role
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@cktutas.edu.gh',
  crypt('Admin@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@cktutas.edu.gh'
);

-- Get the user ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@cktutas.edu.gh';

  -- Insert into user_profiles if not exists
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    status,
    department,
    position,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    admin_user_id,
    'admin@cktutas.edu.gh',
    'System Administrator',
    'admin',
    'active',
    'IT & Systems',
    'System Administrator',
    '+233 24 123 4567',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'System Administrator',
    role = 'admin',
    status = 'active',
    department = 'IT & Systems',
    position = 'System Administrator',
    updated_at = NOW();

  RAISE NOTICE 'Admin user created/updated with ID: %', admin_user_id;
END $$;

-- Verify the admin user was created
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  department,
  position,
  created_at
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';
