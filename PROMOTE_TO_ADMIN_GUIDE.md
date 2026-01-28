# 🚀 Promote Existing User to Admin

## Goal
Give admin access to: **jkorkugah23.stu@cktutas.edu.gh**

This is much simpler than creating a new admin user since the account already exists!

---

## ✅ Quick Steps (2 minutes)

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **inogysmdiergapyvavbx**
3. Go to **SQL Editor**
4. Click **New Query**

### Step 2: Run the Promotion Script

Paste and run this SQL:

```sql
-- Check if user exists
SELECT 
  '1️⃣ USER CHECK' as step,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role as current_role,
  up.status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Promote to admin
UPDATE public.user_profiles
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Verify
SELECT 
  '✅ ADMIN PROMOTED' as status,
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN up.role = 'admin' AND up.status = 'active' 
    THEN '🎉 Ready to login as admin!'
    ELSE '⚠️ Something went wrong'
  END as ready_status
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### Step 3: Check the Results

You should see:
- **1️⃣ USER CHECK**: Shows current user details
- **✅ ADMIN PROMOTED**: Shows `role = 'admin'` and status `🎉 Ready to login as admin!`

### Step 4: Test Login

1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to: http://localhost:4028/login
3. Login with:
   ```
   Email: jkorkugah23.stu@cktutas.edu.gh
   Password: [your existing password]
   ```
4. You should be redirected to: http://localhost:4028/admin-dashboard

---

## 🔍 What If User Doesn't Exist?

If the first query returns no results, the user needs to be created first.

### Option A: User Creates Account

1. User goes to the login page
2. If there's a signup option, they create an account
3. Then you run the promotion script above

### Option B: Admin Creates User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   ```
   Email: jkorkugah23.stu@cktutas.edu.gh
   Password: [choose a password]
   ```
4. Check ✅ **"Auto Confirm User"**
5. Click **Create User**
6. Then run the promotion script above

---

## 🔍 What If Profile Doesn't Exist?

If the user exists in `auth.users` but not in `user_profiles`, create the profile first:

```sql
-- Create profile for existing auth user
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  'Admin User', -- You can change this name
  'admin',
  'active',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Verify
SELECT * FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

---

## 📋 Verification Checklist

Run this to verify everything is set up correctly:

```sql
SELECT 
  '✅ VERIFICATION' as check,
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN au.id = up.id THEN '✅ IDs match'
    ELSE '❌ IDs mismatch'
  END as id_status,
  CASE 
    WHEN up.role = 'admin' THEN '✅ Is admin'
    ELSE '❌ Not admin'
  END as role_status,
  CASE 
    WHEN up.status = 'active' THEN '✅ Active'
    ELSE '❌ Not active'
  END as status_check,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL 
      AND up.role = 'admin' 
      AND up.status = 'active'
      AND au.id = up.id
    THEN '🎉 READY TO LOGIN AS ADMIN!'
    ELSE '⚠️ Something needs fixing'
  END as final_status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';
```

All checks should show ✅ and final status should be: **🎉 READY TO LOGIN AS ADMIN!**

---

## 🔄 Demote Back to Student (If Needed)

If you ever need to remove admin access:

```sql
-- Demote back to student
UPDATE public.user_profiles
SET 
  role = 'student',
  updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Verify
SELECT email, role, status 
FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

---

## 🎯 Expected Result

When working correctly:
- ✅ User can login with their existing credentials
- ✅ Redirected to: http://localhost:4028/admin-dashboard
- ✅ Has access to all admin features
- ✅ Header shows their name with admin privileges
- ✅ Can access Admin System Control panel

---

## 📞 Troubleshooting

### Issue: "User not found"
- User doesn't exist in database
- Follow "Option B: Admin Creates User" above

### Issue: "Profile not found"
- Profile doesn't exist
- Follow "What If Profile Doesn't Exist?" section above

### Issue: Still redirected to student dashboard
- Clear browser cache and cookies
- Logout and login again
- Check that role is actually 'admin' in database

### Issue: "Access denied" on admin pages
- Role might not have updated
- Run verification checklist above
- Ensure role is exactly 'admin' (lowercase)

---

## 📚 Quick Reference

**New Admin Credentials:**
```
Email: jkorkugah23.stu@cktutas.edu.gh
Password: [user's existing password]
```

**Login URL:**
```
http://localhost:4028/login
```

**Expected Redirect:**
```
http://localhost:4028/admin-dashboard
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard
Project: inogysmdiergapyvavbx
```

---

## ✅ Advantages of This Approach

1. **No password issues** - User already has a working password
2. **Faster** - Just update one field in database
3. **Cleaner** - No orphaned records or mismatched IDs
4. **Reversible** - Easy to demote back to student if needed

---

**This is much simpler than creating a new admin user! Just run the SQL and you're done.**
