# Quick Fix - Admin Profile Not Found in Database

## The Problem

Your mock login stores `admin@cktutas.edu.gh` in localStorage, but this user doesn't exist in the Supabase `user_profiles` table. That's why you get "Failed to get user information".

## Solution: Add Admin User to Database

### Option 1: Simple SQL (Run in Supabase SQL Editor)

```sql
-- Insert admin user into user_profiles table
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
  gen_random_uuid(),
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
ON CONFLICT (email) DO UPDATE SET
  full_name = 'System Administrator',
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Verify it was created
SELECT * FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';
```

### Option 2: Using Supabase Dashboard

1. Go to Supabase Dashboard
2. Click "Table Editor" in left sidebar
3. Select `user_profiles` table
4. Click "Insert" → "Insert row"
5. Fill in:
   - `id`: (leave blank, will auto-generate)
   - `email`: `admin@cktutas.edu.gh`
   - `full_name`: `System Administrator`
   - `role`: `admin`
   - `status`: `active`
   - `department`: `IT & Systems`
   - `position`: `System Administrator`
   - `phone`: `+233 24 123 4567`
6. Click "Save"

## After Adding the User

1. **Refresh your browser** (F5)
2. **Log in again** with `admin@cktutas.edu.gh` / `Admin@2026`
3. **Go to `/admin-profile`**
4. **Try editing and saving** - it should work now!

## Verify It Worked

Run this in Supabase SQL Editor:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  department,
  position
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';
```

You should see one row with the admin user.

## Why This Happened

Your app uses **mock authentication** (localStorage) for login, but the profile page needs to look up the user in the **real database**. The mock login doesn't create database records, so we need to add them manually.

## Alternative: Create All Mock Users

If you want to create all the mock users in the database:

```sql
-- Create all mock users
INSERT INTO user_profiles (id, email, full_name, role, status, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'admin@cktutas.edu.gh', 'System Administrator', 'admin', 'active', NOW(), NOW()),
  (gen_random_uuid(), 'student@cktutas.edu.gh', 'John Mensah', 'student', 'active', NOW(), NOW()),
  (gen_random_uuid(), 'candidate@cktutas.edu.gh', 'Ama Osei', 'candidate', 'active', NOW(), NOW()),
  (gen_random_uuid(), 'commission@cktutas.edu.gh', 'Dr. Kwame Nkrumah', 'commission', 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
```

This creates all 4 mock users so they can all edit their profiles!
