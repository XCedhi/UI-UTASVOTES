# ⚡ Quick Setup: Admin User with Password Reset

## 🎯 Goal
Set up **jkorkugah23.stu@cktutas.edu.gh** as admin with password reset email.

---

## 🚀 Do This Now (2 minutes)

### Step 1: Open Supabase Dashboard
https://supabase.com/dashboard → Select project → **Authentication** → **Users**

### Step 2: Check if User Exists
Look for: `jkorkugah23.stu@cktutas.edu.gh`

---

## If User EXISTS:

### A. Send Password Reset
1. Click **three dots (...)** next to user
2. Select **"Send Password Recovery"**
3. Done! Email sent ✅

### B. Promote to Admin
Go to **SQL Editor** and run:
```sql
UPDATE public.user_profiles
SET role = 'admin', status = 'active', updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### C. User Resets Password
1. User checks email
2. Clicks reset link
3. Sets new password
4. Logs in at: http://localhost:4028/login

---

## If User DOESN'T EXIST:

### A. Create User
1. Click **"Add User"** button
2. Enter:
   ```
   Email: jkorkugah23.stu@cktutas.edu.gh
   Password: Admin@2026
   ```
3. Check ✅ **"Auto Confirm User"**
4. Click **Create User**

### B. Create Profile & Promote to Admin
Go to **SQL Editor** and run:
```sql
-- Create profile and set as admin
INSERT INTO public.user_profiles (
  id, email, full_name, role, status, created_at, updated_at
)
SELECT 
  au.id, au.email, 'Admin User', 'admin', 'active', NOW(), NOW()
FROM auth.users au
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin', status = 'active', updated_at = NOW();

-- Verify
SELECT email, full_name, role, status 
FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### C. Share Credentials
Tell the user:
```
Email: jkorkugah23.stu@cktutas.edu.gh
Password: Admin@2026
Login: http://localhost:4028/login
```

They can change password after logging in.

---

## ✅ Verification

Run this to confirm everything is set up:

```sql
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as confirmed,
  up.full_name,
  up.role,
  up.status,
  CASE 
    WHEN up.role = 'admin' THEN '✅ Is Admin'
    ELSE '❌ Not Admin'
  END as admin_status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';
```

Should show: `✅ Is Admin`

---

## 🎯 Expected Result

- ✅ User can login at http://localhost:4028/login
- ✅ Redirected to http://localhost:4028/admin-dashboard
- ✅ Has access to all admin features
- ✅ Can manage users, elections, system settings

---

## 📞 If Email Doesn't Send

Use the "Create User" method above and set password directly to `Admin@2026`.

User can change it later via Settings page.

---

## 📚 Files for More Details

- **SEND_PASSWORD_RESET_EMAIL.md** - Complete email reset guide
- **PROMOTE_TO_ADMIN_GUIDE.md** - Detailed promotion instructions
- **QUICK_ADMIN_PROMOTION.md** - Quick promotion without email

---

**Choose your path based on whether user exists or not. Both work!**
