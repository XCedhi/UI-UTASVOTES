# Create Admin User - Step by Step Guide

## Problem
You're getting "Invalid email or password" because the admin user doesn't exist in Supabase Auth with a password.

## Solution
Create the admin user using Supabase Dashboard (easiest method).

---

## Method 1: Using Supabase Dashboard (RECOMMENDED)

### Step 1: Check Current Status

Run this in **Supabase Dashboard → SQL Editor**:

```sql
-- Check if admin exists
SELECT * FROM auth.users WHERE email = 'admin@cktutas.edu.gh';
SELECT * FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';
```

### Step 2: Create Admin User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** (or **Invite User**)
3. Fill in:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   Auto Confirm User: ✅ (check this box)
   ```
4. Click **Create User**

### Step 3: Get the User ID

After creating, you'll see the user in the list. Click on the user to see their ID, or run:

```sql
SELECT id, email FROM auth.users WHERE email = 'admin@cktutas.edu.gh';
```

Copy the `id` (it will be a UUID like `a1b2c3d4-...`).

### Step 4: Create/Update User Profile

Run this in **SQL Editor** (replace `YOUR_USER_ID_HERE` with the actual ID):

```sql
-- Insert or update user profile
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
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
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
```

### Step 5: Test Login

1. Go to `http://localhost:4028/login`
2. Enter:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
3. Click **Sign In**

You should be redirected to the admin dashboard!

---

## Method 2: Using SQL (Alternative)

If you prefer SQL, run this in **Supabase Dashboard → SQL Editor**:

```sql
-- This creates a user with a hashed password
-- Note: Requires pgcrypto extension

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin user
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  v_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'admin@cktutas.edu.gh',
    crypt('Admin@2026', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
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
    v_user_id,
    'admin@cktutas.edu.gh',
    'System Administrator',
    'admin',
    'active',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Admin user created with ID: %', v_user_id;
END $$;

-- Verify
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.full_name,
  up.role
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

---

## Method 3: Reset Password (If User Exists)

If the admin user already exists but you forgot the password:

### Option A: Using Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find `admin@cktutas.edu.gh`
3. Click the **...** menu → **Reset Password**
4. Set new password: `Admin@2026`

### Option B: Using SQL

```sql
-- Update password for existing user
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin@2026', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';
```

---

## Troubleshooting

### Issue: "User already exists"

If you get this error, the user exists but might not have a profile:

```sql
-- Get the user ID
SELECT id FROM auth.users WHERE email = 'admin@cktutas.edu.gh';

-- Create profile for existing user (use the ID from above)
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_HERE', -- Replace with actual ID
  'admin@cktutas.edu.gh',
  'System Administrator',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

### Issue: "Email not confirmed"

```sql
-- Confirm email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';
```

### Issue: Still can't login

Check browser console (F12) for detailed error messages. Common issues:

1. **Wrong Supabase URL/Keys**: Check `.env` file
2. **RLS Policies**: Temporarily disable to test
3. **CORS Issues**: Check Supabase Dashboard → Settings → API

---

## Verification Checklist

Run these queries to verify everything is set up correctly:

```sql
-- 1. User exists in auth.users
SELECT 
  '✅ Auth User' as check,
  id, 
  email, 
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';

-- 2. Profile exists
SELECT 
  '✅ User Profile' as check,
  id,
  email,
  full_name,
  role,
  status
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- 3. IDs match
SELECT 
  '✅ ID Match' as check,
  CASE 
    WHEN au.id = up.id THEN 'IDs match ✅'
    ELSE 'IDs DO NOT match ❌'
  END as status
FROM auth.users au
JOIN public.user_profiles up ON au.email = up.email
WHERE au.email = 'admin@cktutas.edu.gh';
```

All three checks should return results. If any are missing, follow the steps above to fix.

---

## Quick Test

After setup, test with this command in your terminal:

```bash
curl -X POST http://localhost:4028/api/auth/track-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","ipAddress":"127.0.0.1","userAgent":"Test"}'
```

Replace `USER_ID_HERE` with your admin user ID.

---

## Success Criteria

✅ Admin user exists in `auth.users`  
✅ Admin profile exists in `user_profiles`  
✅ IDs match between both tables  
✅ Email is confirmed  
✅ Can login at `/login`  
✅ Redirected to `/admin-dashboard`  
✅ Profile picture and name display correctly

---

## Default Credentials

```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

**Remember to change this password in production!**
