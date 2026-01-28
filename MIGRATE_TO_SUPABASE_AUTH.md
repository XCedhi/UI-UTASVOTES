# Migrate from Mock Auth to Real Supabase Authentication

## Current Situation
- Login uses **mock credentials** stored in code
- Session stored in **localStorage** (custom implementation)
- Profile data fetched from database using email lookup

## Goal
- Use **Supabase Authentication** for login
- Session managed by **Supabase** (stored in localStorage automatically)
- All data comes from database via Supabase session

## Benefits
- ✅ Real authentication with password hashing
- ✅ Built-in session management
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Secure token-based auth
- ✅ No need for custom localStorage management

## Implementation Steps

### Step 1: Create Auth Users in Supabase

First, create the users in Supabase Auth (not just user_profiles):

```sql
-- This creates users in auth.users table
-- Run in Supabase SQL Editor

-- Create admin user
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
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID and create profile
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'admin@cktutas.edu.gh';
  
  INSERT INTO user_profiles (
    id, email, full_name, role, status, department, position, phone
  ) VALUES (
    user_id,
    'admin@cktutas.edu.gh',
    'System Administrator',
    'admin',
    'active',
    'IT & Systems',
    'System Administrator',
    '+233 24 123 4567'
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = 'System Administrator',
    role = 'admin',
    status = 'active';
END $$;
```

### Step 2: Update Login Form

The login form needs to use `supabase.auth.signInWithPassword()` instead of mock credentials.

### Step 3: Update Auth Utils

Replace localStorage session management with Supabase session methods.

### Step 4: Update All Components

Components that check session need to use `supabase.auth.getSession()`.

## Quick Implementation

I'll update the key files to use real Supabase auth. This will:
1. Use Supabase's built-in authentication
2. Store session in Supabase's localStorage format
3. Fetch all data from database using Supabase session
4. Work with password reset, email verification, etc.

## Testing After Migration

1. **Create users in Supabase Dashboard**:
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `admin@cktutas.edu.gh`
   - Password: `Admin@2026`
   - Confirm email automatically

2. **Ensure user_profiles exists**:
   - The user ID from auth.users must match user_profiles.id

3. **Test login**:
   - Go to `/login`
   - Enter: `admin@cktutas.edu.gh` / `Admin@2026`
   - Should redirect to dashboard
   - Profile picture should load from database

## Files That Need Updating

1. `src/app/login/components/LoginForm.tsx` - Use Supabase auth
2. `src/lib/auth-utils.ts` - Use Supabase session methods
3. `src/hooks/useAdminProfile.ts` - Already updated to use Supabase session
4. `src/components/common/ProtectedRoute.tsx` - Use Supabase session check
5. `src/app/admin-profile/components/AdminProfileInteractive.tsx` - Already updated

## Do You Want Me To Implement This?

This is a significant change that will:
- ✅ Make your app production-ready
- ✅ Use real authentication
- ✅ All data from database
- ✅ Proper session management
- ✅ Security best practices

But it will require:
- Creating users in Supabase Dashboard or via SQL
- Testing login with real credentials
- Updating password reset flow

Should I proceed with implementing real Supabase authentication?
