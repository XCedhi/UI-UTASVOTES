# 📧 Send Password Reset Email to User

## Goal
Send a password reset email to **jkorkugah23.stu@cktutas.edu.gh** so they can set a new password and login as admin.

---

## ✅ Method 1: Using Supabase Dashboard (EASIEST)

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **inogysmdiergapyvavbx**
3. Go to **Authentication** → **Users**

### Step 2: Find the User

1. Look for user: `jkorkugah23.stu@cktutas.edu.gh`
2. If user doesn't exist, see "Method 3: Create User First" below

### Step 3: Send Password Recovery Email

1. Click the **three dots (...)** next to the user
2. Select **"Send Password Recovery"** or **"Send Magic Link"**
3. Supabase will send an email to: jkorkugah23.stu@cktutas.edu.gh
4. Done!

### Step 4: User Resets Password

The user will:
1. Check their email inbox (jkorkugah23.stu@cktutas.edu.gh)
2. Click the reset link in the email
3. Set a new password
4. Be redirected to your app

### Step 5: Promote to Admin

After user sets their password, promote them to admin:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this:

```sql
-- Promote to admin
UPDATE public.user_profiles
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Verify
SELECT email, full_name, role, status 
FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

---

## ✅ Method 2: Using Your App's Forgot Password Page

### Step 1: User Goes to Forgot Password

1. User goes to: http://localhost:4028/forgot-password
2. Enters email: `jkorkugah23.stu@cktutas.edu.gh`
3. Clicks "Send Reset Link"
4. Checks email for reset link

### Step 2: User Resets Password

1. User clicks link in email
2. Sets new password
3. Logs in with new password

### Step 3: You Promote to Admin

Run the SQL from Method 1 Step 5 to promote them to admin.

---

## ✅ Method 3: Create User First (If User Doesn't Exist)

If the user doesn't exist in Supabase yet:

### Option A: Create with Temporary Password

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   ```
   Email: jkorkugah23.stu@cktutas.edu.gh
   Password: TempPassword123! (temporary)
   ```
4. Check ✅ **"Auto Confirm User"**
5. Click **Create User**
6. Then follow Method 1 to send password reset email

### Option B: Create and Send Invite

1. Go to **SQL Editor**
2. Run this to create user and profile:

```sql
-- This will create the user in a way that requires password reset
-- Note: This is a simplified version, actual implementation may vary

-- First check if user exists
SELECT id, email FROM auth.users WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- If no results, you need to create via Dashboard (Option A above)
```

---

## 🔍 Check Email Configuration

For password reset emails to work, Supabase needs to be configured:

### Check Email Settings:

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Check that "Reset Password" template exists
3. Go to **Settings** → **Auth** → **SMTP Settings**
4. Verify email provider is configured

### Default Behavior:

- Supabase uses their default email service
- Emails come from: noreply@mail.app.supabase.io
- Should work out of the box for development

### If Emails Aren't Sending:

Check spam folder or configure custom SMTP:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Use your email provider (Gmail, SendGrid, etc.)

---

## 📋 Complete Workflow

Here's the full process:

### 1. Check if User Exists

```sql
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.full_name,
  up.role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### 2. If User Exists:
- Send password reset via Dashboard (Method 1)
- User resets password
- You promote to admin

### 3. If User Doesn't Exist:
- Create user via Dashboard
- Send password reset
- User sets password
- You promote to admin

### 4. Promote to Admin:

```sql
UPDATE public.user_profiles
SET role = 'admin', status = 'active', updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### 5. User Logs In:
- Go to: http://localhost:4028/login
- Enter: jkorkugah23.stu@cktutas.edu.gh + new password
- Redirected to admin dashboard!

---

## 🚨 Alternative: Set Password Directly (Not Recommended)

If email isn't working, you can set a password directly:

### Step 1: Create User with Known Password

1. Go to **Authentication** → **Users** → **Add User**
2. Enter:
   ```
   Email: jkorkugah23.stu@cktutas.edu.gh
   Password: Admin@2026
   ```
3. Check ✅ **"Auto Confirm User"**
4. Click **Create User**

### Step 2: Create Profile

```sql
INSERT INTO public.user_profiles (
  id, email, full_name, role, status, created_at, updated_at
)
SELECT 
  au.id, au.email, 'Admin User', 'admin', 'active', NOW(), NOW()
FROM auth.users au
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin', status = 'active', updated_at = NOW();
```

### Step 3: Share Credentials

Tell the user:
```
Email: jkorkugah23.stu@cktutas.edu.gh
Password: Admin@2026
Login: http://localhost:4028/login
```

They can change the password after logging in via Settings.

---

## 📞 Troubleshooting

### Issue: "User not found" in Dashboard

**Solution**: User doesn't exist yet. Use Method 3 to create them first.

### Issue: Email not received

**Checklist**:
- [ ] Check spam/junk folder
- [ ] Verify email address is correct
- [ ] Check Supabase email settings
- [ ] Try Method 2 (app's forgot password page)
- [ ] Use Alternative method (set password directly)

### Issue: Reset link expired

**Solution**: Send another password reset email. Links expire after 1 hour.

### Issue: User can't access admin features after login

**Solution**: Make sure you ran the promotion SQL:
```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

---

## ✅ Success Checklist

- [ ] User exists in Supabase (auth.users)
- [ ] Password reset email sent
- [ ] User received email and reset password
- [ ] User promoted to admin role
- [ ] User can login at http://localhost:4028/login
- [ ] User redirected to admin dashboard
- [ ] User has access to all admin features

---

## 📚 Quick Reference

**User Email:**
```
jkorkugah23.stu@cktutas.edu.gh
```

**Login URL:**
```
http://localhost:4028/login
```

**Forgot Password URL:**
```
http://localhost:4028/forgot-password
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard
Project: inogysmdiergapyvavbx
```

**Promotion SQL:**
```sql
UPDATE public.user_profiles
SET role = 'admin', status = 'active', updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

---

## 🎯 Recommended Approach

**Best Option**: Method 1 (Supabase Dashboard)
- Fastest and most reliable
- Uses Supabase's built-in email system
- No manual password handling

**Backup Option**: Alternative Method (Set Password Directly)
- If email isn't working
- You set the password and share it
- User can change it later

Choose Method 1 first, fall back to Alternative if needed!
