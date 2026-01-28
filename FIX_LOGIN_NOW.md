# Fix Admin Login - Complete Guide

## 🎯 Goal
Get admin@cktutas.edu.gh logged in with password Admin@2026

## 📊 Current Situation
- SQL password resets haven't worked
- Need to use Supabase Dashboard (most reliable method)
- Code is working correctly - issue is just password authentication

---

## ✅ STEP-BY-STEP SOLUTION

### Step 1: Check Current Status

Run this verification script:
```bash
node verify-admin-setup.js
```

This will tell you:
- ✅ If admin user exists
- ✅ If profile exists
- ✅ If IDs match
- ❌ What's missing

### Step 2: Fix via Supabase Dashboard

#### Option A: Reset Password (If User Exists)

1. Open **Supabase Dashboard** (https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Users**
4. Find user: `admin@cktutas.edu.gh`
5. Click **three dots (...)** on the right
6. Select **"Reset Password"** or **"Send Password Recovery"**
7. If "Reset Password" option appears:
   - Enter: `Admin@2026`
   - Click **Save**
8. Done! Skip to Step 3

#### Option B: Delete and Recreate (If Reset Doesn't Work)

1. In **Authentication** → **Users**
2. Find `admin@cktutas.edu.gh`
3. Click **three dots (...)** → **Delete User**
4. Confirm deletion
5. Click **"Add User"** button (top right)
6. Fill in:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
7. **IMPORTANT**: Check ✅ **"Auto Confirm User"**
8. Click **Create User**
9. **Copy the User ID** that appears (you'll need it)

### Step 3: Ensure Profile Exists

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Paste this (replace `USER_ID_HERE` with the ID from Step 2):

```sql
-- If you know the user ID, use it. Otherwise, this will auto-fetch it
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'admin@cktutas.edu.gh';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users';
  END IF;
  
  -- Create or update profile
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
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile created/updated for user: %', v_user_id;
END $$;

-- Verify everything
SELECT 
  '✅ READY TO LOGIN' as status,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role,
  up.status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

4. Click **Run**
5. You should see: `✅ READY TO LOGIN`

### Step 4: Test Login

1. **Clear browser cache and cookies** (Ctrl+Shift+Delete)
2. Make sure dev server is running:
   ```bash
   npm run dev
   ```
3. Go to: http://localhost:4028/login
4. Enter:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
5. Click **Sign In**
6. You should be redirected to: http://localhost:4028/admin-dashboard

---

## 🔍 Troubleshooting

### Still Getting "Invalid Credentials"?

**Check Browser Console:**
1. Press F12 to open DevTools
2. Go to **Console** tab
3. Try logging in again
4. Look for messages starting with ❌
5. Share the exact error message

**Common Issues:**

#### Issue: "Email not confirmed"
```sql
-- Run in SQL Editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@cktutas.edu.gh';
```

#### Issue: "User not found"
- User doesn't exist in auth.users
- Follow Step 2 Option B to create

#### Issue: "Profile not found"
- Profile doesn't exist or IDs don't match
- Follow Step 3 to create profile

#### Issue: Wrong environment variables
```bash
# Check your .env file
type .env
```

Verify these exist:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Issue: Dev server not running
```bash
# Stop any running servers (Ctrl+C)
# Clear Next.js cache
rmdir /s /q .next
# Restart
npm run dev
```

---

## 📋 Verification Checklist

Run these checks in **SQL Editor**:

```sql
-- 1. User exists and is confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not confirmed'
  END as status
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';

-- 2. Profile exists with admin role
SELECT 
  id,
  email,
  full_name,
  role,
  status
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- 3. IDs match
SELECT 
  au.id as auth_id,
  up.id as profile_id,
  CASE 
    WHEN au.id = up.id THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM auth.users au
JOIN public.user_profiles up ON au.email = up.email
WHERE au.email = 'admin@cktutas.edu.gh';
```

All three should return results with ✅ status.

---

## 🚨 Nuclear Option (Last Resort)

If nothing else works, completely reset:

```sql
-- Delete everything
DELETE FROM public.user_profiles WHERE email = 'admin@cktutas.edu.gh';
DELETE FROM auth.users WHERE email = 'admin@cktutas.edu.gh';
```

Then follow Step 2 Option B from the beginning.

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Login page accepts credentials without error
- ✅ Redirected to `/admin-dashboard`
- ✅ Header shows "System Administrator"
- ✅ Profile picture displays
- ✅ No errors in browser console

---

## 📞 Still Stuck?

If you're still having issues, provide:

1. **Output from verification script:**
   ```bash
   node verify-admin-setup.js
   ```

2. **Browser console errors:**
   - Press F12
   - Go to Console tab
   - Try logging in
   - Copy any red error messages

3. **SQL verification results:**
   - Run the verification checklist queries above
   - Share the results

4. **Environment check:**
   ```bash
   type .env
   ```
   (Hide the actual keys, just confirm they exist)

This will help diagnose the exact issue!

---

## 📚 Related Files

- `DASHBOARD_PASSWORD_RESET_GUIDE.md` - Detailed dashboard instructions
- `check-admin-status.sql` - SQL queries to check status
- `verify-admin-setup.js` - Automated verification script
- `CREATE_ADMIN_USER_GUIDE.md` - Original creation guide

---

## 🎯 Quick Reference

**Credentials:**
```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

**Login URL:**
```
http://localhost:4028/login
```

**Expected Redirect:**
```
http://localhost:4028/admin-dashboard
```

**Dev Server:**
```bash
npm run dev
# Runs on port 4028
```

---

**Remember:** The Supabase Dashboard method is the most reliable. SQL password updates haven't been working, so always use the Dashboard UI for password management.
