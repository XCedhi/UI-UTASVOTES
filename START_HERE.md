# 🚀 START HERE - Fix Admin Login

## What's the Problem?

You're getting "Invalid email or password" when trying to login as admin. The issue is that SQL-based password resets haven't been working properly with Supabase Auth.

## ✅ The Solution

Use the **Supabase Dashboard UI** to manage the admin user - it's the most reliable method.

---

## 📋 Quick Steps (5 minutes)

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: **inogysmdiergapyvavbx**

### 2. Check if Admin User Exists
- Go to **Authentication** → **Users**
- Look for: `admin@cktutas.edu.gh`

### 3A. If User Exists:
- Click the **three dots (...)** next to the user
- Select **"Reset Password"**
- Enter: `Admin@2026`
- Click **Save**
- ✅ Done! Go to Step 4

### 3B. If User Doesn't Exist:
- Click **"Add User"** button
- Enter:
  ```
  Email: admin@cktutas.edu.gh
  Password: Admin@2026
  ```
- Check ✅ **"Auto Confirm User"**
- Click **Create User**
- Copy the User ID
- Go to **SQL Editor** and run:
  ```sql
  INSERT INTO public.user_profiles (
    id, email, full_name, role, status, created_at, updated_at
  )
  SELECT 
    au.id, au.email, 'System Administrator', 'admin', 'active', NOW(), NOW()
  FROM auth.users au
  WHERE au.email = 'admin@cktutas.edu.gh'
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin', status = 'active', updated_at = NOW();
  ```
- ✅ Done! Go to Step 4

### 4. Test Login
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure dev server is running: `npm run dev`
- Go to: http://localhost:4028/login
- Login with:
  ```
  Email: admin@cktutas.edu.gh
  Password: Admin@2026
  ```
- You should be redirected to the admin dashboard!

---

## 📚 Detailed Guides

If you need more detailed instructions:

1. **RUN_IN_SUPABASE_DASHBOARD.md** - Complete step-by-step guide with SQL queries
2. **DASHBOARD_PASSWORD_RESET_GUIDE.md** - Detailed password reset instructions
3. **FIX_LOGIN_NOW.md** - Comprehensive troubleshooting guide

---

## 🔍 Quick Verification

Run this in **Supabase Dashboard → SQL Editor** to check everything:

```sql
SELECT 
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
      AND au.id = up.id
    THEN '🎉 READY TO LOGIN!'
    ELSE '⚠️ Something needs fixing'
  END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

Should show: **🎉 READY TO LOGIN!**

---

## ❓ Still Having Issues?

If login still fails:

1. Press **F12** in browser
2. Go to **Console** tab
3. Try logging in
4. Share any **red error messages**

Also share:
- Which step you completed (3A or 3B)
- Output from the verification query above
- Screenshot of Authentication → Users page

---

## 🎯 Expected Result

When working correctly:
- ✅ Login succeeds without errors
- ✅ Redirected to: http://localhost:4028/admin-dashboard
- ✅ Header shows "System Administrator"
- ✅ Profile picture displays
- ✅ No console errors

---

## 📞 Quick Reference

**Credentials:**
```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

**Login URL:**
```
http://localhost:4028/login
```

**Dev Server:**
```bash
npm run dev
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard
Project: inogysmdiergapyvavbx
```

---

## 🚨 Why SQL Password Resets Didn't Work

Supabase Auth (GoTrue) uses a specific password hashing algorithm. Direct SQL updates to `auth.users.encrypted_password` may not use the correct format. The Dashboard UI uses the proper Auth API, which is why it's more reliable.

---

**Start with the Quick Steps above. If you need more help, check the detailed guides!**
