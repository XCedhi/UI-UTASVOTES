# 🎯 IMMEDIATE FIX - Run These Steps Now

## Current Situation
- SQL password resets haven't worked
- Need to use Supabase Dashboard UI (most reliable method)
- Your code is working fine - just need to set up the admin user correctly

---

## ✅ STEP 1: Check Current Status

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project (inogysmdiergapyvavbx)
3. Go to **SQL Editor**
4. Click **New Query**
5. Paste and run this:

```sql
-- Check if admin user exists
SELECT 
  '1️⃣ AUTH USER' as check,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';

-- Check if profile exists
SELECT 
  '2️⃣ PROFILE' as check,
  id,
  email,
  full_name,
  role,
  status
FROM public.user_profiles
WHERE email = 'admin@cktutas.edu.gh';
```

**What to look for:**
- If both queries return results → User exists, just need password reset (go to Step 2A)
- If only first query returns results → Need to create profile (go to Step 2B)
- If no results → Need to create user (go to Step 2C)

---

## ✅ STEP 2A: Reset Password (If User Exists)

### Using Dashboard UI (EASIEST - RECOMMENDED):

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Find user: `admin@cktutas.edu.gh`
3. Click the **three dots (...)** on the right side
4. Look for one of these options:
   - **"Reset Password"** → Click it, enter `Admin@2026`, click Save
   - **"Send Password Recovery"** → Skip this, use Option B below instead

### Option B - Manual Password Update:

If the Dashboard doesn't have a direct reset option, use SQL:

1. Go to **SQL Editor**
2. Run this:

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update password
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin@2026', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';

-- Verify
SELECT 
  '✅ UPDATED' as status,
  id,
  email,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';
```

**Then skip to Step 3 (Test Login)**

---

## ✅ STEP 2B: Create Profile (If User Exists But No Profile)

1. Go to **SQL Editor**
2. Run this:

```sql
-- Create profile for existing user
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
  updated_at = NOW();

-- Verify
SELECT 
  '✅ PROFILE CREATED' as status,
  up.id,
  up.email,
  up.full_name,
  up.role
FROM public.user_profiles up
WHERE up.email = 'admin@cktutas.edu.gh';
```

**Then go back to Step 2A to reset password**

---

## ✅ STEP 2C: Create User from Scratch (If No User Exists)

### Using Dashboard UI (EASIEST - RECOMMENDED):

1. Go to **Authentication** → **Users**
2. Click **"Add User"** button (top right)
3. Fill in:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
4. **IMPORTANT**: Check ✅ **"Auto Confirm User"**
5. Click **Create User**
6. **Copy the User ID** that appears (you'll need it)

### Then Create Profile:

1. Go to **SQL Editor**
2. Run this (replace `YOUR_USER_ID_HERE` with the ID you copied):

```sql
-- Create profile (replace YOUR_USER_ID_HERE with actual ID)
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
  'YOUR_USER_ID_HERE', -- REPLACE THIS!
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
  updated_at = NOW();

-- Verify everything is set up
SELECT 
  '✅ READY' as status,
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

You should see a result with `✅ READY` status.

---

## ✅ STEP 3: Test Login

1. **Clear browser cache and cookies**:
   - Press `Ctrl + Shift + Delete`
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Click "Clear data"

2. **Ensure dev server is running**:
   ```bash
   npm run dev
   ```
   Should show: `ready - started server on 0.0.0.0:4028`

3. **Open browser and go to**:
   ```
   http://localhost:4028/login
   ```

4. **Enter credentials**:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```

5. **Click "Sign In"**

6. **Expected result**:
   - ✅ No error message
   - ✅ Redirected to: `http://localhost:4028/admin-dashboard`
   - ✅ Header shows "System Administrator"
   - ✅ Profile picture displays

---

## 🔍 If Login Still Fails

### Check Browser Console:

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Try logging in again
4. Look for messages with ❌ or red text
5. **Share the exact error message**

### Common Issues:

#### "Invalid email or password"
- Password wasn't set correctly
- Go back to Step 2A and use Dashboard UI method

#### "Failed to load user profile"
- Profile doesn't exist or IDs don't match
- Run Step 1 queries again to check
- Go to Step 2B to create profile

#### "Email not confirmed"
```sql
-- Run this in SQL Editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@cktutas.edu.gh';
```

#### Nothing happens / blank page
- Check dev server is running on port 4028
- Check browser console for errors
- Try different browser

---

## 📋 Quick Verification Checklist

Run this in **SQL Editor** to verify everything:

```sql
-- Complete verification
SELECT 
  '✅ VERIFICATION' as status,
  au.id,
  au.email,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '❌ Email NOT confirmed'
  END as email_status,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match'
    ELSE '❌ IDs mismatch'
  END as id_match,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL 
      AND up.role = 'admin' 
      AND up.status = 'active'
      AND au.id = up.id
    THEN '🎉 READY TO LOGIN!'
    ELSE '⚠️ Something needs fixing'
  END as ready_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

**All checks should show ✅ and final status should be: 🎉 READY TO LOGIN!**

---

## 🚨 Nuclear Option (Last Resort)

If absolutely nothing works, completely reset:

```sql
-- Delete everything
DELETE FROM public.user_profiles WHERE email = 'admin@cktutas.edu.gh';
DELETE FROM auth.users WHERE email = 'admin@cktutas.edu.gh';

-- Verify deletion
SELECT COUNT(*) as remaining_users 
FROM auth.users 
WHERE email = 'admin@cktutas.edu.gh';
-- Should return 0
```

Then go back to **Step 2C** and create from scratch.

---

## 📞 Still Stuck?

If you're still having issues after following these steps, provide:

1. **Output from Step 1 queries** (both queries)
2. **Screenshot of Authentication → Users page** in Supabase Dashboard
3. **Browser console errors** (F12 → Console tab)
4. **Which step you completed** (2A, 2B, or 2C)

This will help me diagnose the exact issue!

---

## 🎯 Expected Final State

When everything is working:

✅ User exists in `auth.users` with email confirmed  
✅ Profile exists in `user_profiles` with role='admin'  
✅ IDs match between both tables  
✅ Can login at http://localhost:4028/login  
✅ Redirected to http://localhost:4028/admin-dashboard  
✅ Header shows "System Administrator"  
✅ Profile picture displays  
✅ No errors in browser console  

---

## 📚 Reference

**Login Credentials:**
```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

**Login URL:**
```
http://localhost:4028/login
```

**Supabase Project:**
```
URL: https://inogysmdiergapyvavbx.supabase.co
Project ID: inogysmdiergapyvavbx
```

**Dev Server:**
```bash
npm run dev
# Runs on port 4028
```
