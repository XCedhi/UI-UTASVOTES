# Dashboard Password Reset Guide - GUARANTEED TO WORK

## Why SQL Password Resets Failed

SQL-based password resets using `crypt()` haven't been working because:
1. Supabase Auth uses a specific password hashing algorithm (GoTrue)
2. Direct SQL updates to `auth.users.encrypted_password` may not use the correct format
3. The Dashboard method uses the proper Auth API which handles everything correctly

---

## ✅ SOLUTION: Use Supabase Dashboard (100% Reliable)

### Step 1: Check Current Status

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run the query from `check-admin-status.sql`
4. Note the results - especially the user ID

### Step 2: Reset Password via Dashboard

#### Option A: If User Exists (RECOMMENDED)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user with email `admin@cktutas.edu.gh`
3. Click the **three dots (...)** menu on the right
4. Select **"Send Password Recovery"** OR **"Reset Password"**
5. If "Reset Password" option:
   - Enter new password: `Admin@2026`
   - Click **Save**
6. If "Send Password Recovery":
   - Check the email inbox for recovery link
   - OR manually set password using Option B below

#### Option B: Delete and Recreate (If Reset Doesn't Work)

1. Go to **Authentication** → **Users**
2. Find `admin@cktutas.edu.gh`
3. Click **three dots (...)** → **Delete User**
4. Confirm deletion
5. Click **"Add User"** button
6. Fill in the form:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ✅ Auto Confirm User (CHECK THIS BOX!)
   ```
7. Click **Create User**
8. **IMPORTANT**: Copy the new User ID that appears

### Step 3: Update/Create Profile

After creating the user, you need to ensure the profile exists.

1. Go to **SQL Editor**
2. Run this query (replace `YOUR_NEW_USER_ID` with the ID from Step 2):

```sql
-- Create or update profile for the new user
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
  'YOUR_NEW_USER_ID', -- Replace with actual user ID from Dashboard
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

-- Verify it worked
SELECT 
  '✅ VERIFICATION' as status,
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

### Step 4: Test Login

1. **Clear browser cache and cookies** (important!)
2. Go to `http://localhost:4028/login`
3. Enter credentials:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
4. Click **Sign In**

---

## 🔍 Troubleshooting

### Issue: "User already exists" when trying to create

**Solution**: Use Option A (Reset Password) instead of Option B (Delete and Recreate)

### Issue: Can't find user in Dashboard

**Solution**: 
1. Check you're in the correct project
2. Try searching by email in the Users list
3. Run `check-admin-status.sql` to see if user exists in database

### Issue: Still getting "Invalid credentials"

**Checklist**:
- [ ] Did you check "Auto Confirm User" when creating?
- [ ] Did you clear browser cache/cookies?
- [ ] Is dev server running on port 4028?
- [ ] Are environment variables correct in `.env`?
- [ ] Did you restart the dev server after changes?

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for error messages starting with ❌
5. Share the exact error message

### Issue: Profile not loading after login

**Solution**: Make sure the profile was created with the correct user ID:

```sql
-- Check if profile exists with correct ID
SELECT 
  au.id as auth_user_id,
  up.id as profile_id,
  CASE 
    WHEN au.id = up.id THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

If they don't match, delete the old profile and create a new one with the correct ID.

---

## 📋 Quick Reference

### Default Credentials
```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

### Login URL
```
http://localhost:4028/login
```

### Expected Redirect After Login
```
http://localhost:4028/admin-dashboard
```

---

## ✅ Success Checklist

After following the steps above, verify:

- [ ] User exists in Supabase Dashboard → Authentication → Users
- [ ] Email shows as "Confirmed" (green checkmark)
- [ ] Profile exists in `user_profiles` table with matching ID
- [ ] Can login at `/login` without errors
- [ ] Redirected to `/admin-dashboard` after login
- [ ] Profile name shows "System Administrator" in header
- [ ] Profile picture displays correctly

---

## 🚨 If Nothing Works

If you've tried everything and still can't login:

1. **Check Environment Variables**:
   ```bash
   # In your terminal
   type .env
   ```
   Verify:
   - `NEXT_PUBLIC_SUPABASE_URL` is correct
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - `SUPABASE_SERVICE_ROLE_KEY` is set

2. **Check Supabase Project Status**:
   - Go to Supabase Dashboard → Settings → General
   - Ensure project is not paused
   - Check API URL matches your `.env`

3. **Test Supabase Connection**:
   ```bash
   node test-connection.js
   ```

4. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Share the exact error

5. **Nuclear Option - Fresh Start**:
   ```sql
   -- Delete everything and start fresh
   DELETE FROM public.user_profiles WHERE email = 'admin@cktutas.edu.gh';
   DELETE FROM auth.users WHERE email = 'admin@cktutas.edu.gh';
   ```
   Then follow Step 2 Option B to recreate from scratch.

---

## 📞 Need More Help?

If you're still stuck, provide:
1. Output from `check-admin-status.sql`
2. Browser console errors (F12 → Console)
3. Screenshot of Supabase Dashboard → Authentication → Users page
4. Output from `type .env` (hide sensitive keys)

This will help diagnose the exact issue.
