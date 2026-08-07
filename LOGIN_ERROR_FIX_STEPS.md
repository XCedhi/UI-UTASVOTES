# Login Error Fix - Step by Step Guide

## 🔴 Current Error
**"Profile fetch error: {}"** after successful authentication

## 🎯 Root Cause
The user authenticated successfully with Supabase Auth, but the system cannot fetch their profile from the `user_profiles` table due to:
1. Missing RLS policies for authenticated users
2. Possibly missing user profile in the database

## ✅ Solution Steps

### Step 1: Fix RLS Policies (REQUIRED)

Go to **Supabase Dashboard** → **SQL Editor** and run:

**File: `diagnose-and-fix-profile-access.sql`**

This will:
- ✅ Check current policies
- ✅ Drop problematic policies
- ✅ Create correct policies for authenticated users
- ✅ Allow users to read their own profiles

### Step 2: Verify Student Profile Exists (REQUIRED)

Run this script in **Supabase SQL Editor**:

**File: `verify-student-profile.sql`**

This will:
- ✅ Check if student user exists in auth.users
- ✅ Check if profile exists in user_profiles
- ✅ Automatically create profile if missing
- ✅ Verify everything is ready

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test Login

1. Go to `http://localhost:4028/login`
2. Enter credentials:
   - Email: `student@cktutas.edu.gh`
   - Password: `Student@2026`
3. Click "Sign In"
4. Should redirect to `/student-dashboard` ✅

## 🔍 What Was Fixed

### Code Changes:
1. **Enhanced Supabase client** (`src/lib/supabase.ts`)
   - Added proper auth configuration
   - Enabled session persistence
   - Added PKCE flow

2. **Improved error handling** (`src/app/login/components/LoginForm.tsx`)
   - Increased session wait time to 1 second
   - Added detailed error logging
   - Specific error messages for different failure types

3. **Better timeout handling** (`src/app/login/components/ElectionAnnouncements.tsx`)
   - Added 10-second timeout for announcements
   - Graceful degradation if announcements fail

### Database Changes:
1. **Fixed RLS policies** on `user_profiles` table
   - Allow authenticated users to read their own profile
   - Allow service role full access
   - Proper INSERT policies for new users

2. **Ensured profiles exist** for all auth users
   - Created missing profiles
   - Verified data integrity

## 🧪 Verification Checklist

After running the SQL scripts, verify:

- [ ] RLS policies exist for `user_profiles`
- [ ] Student user exists in `auth.users`
- [ ] Student profile exists in `user_profiles`
- [ ] Profile ID matches auth user ID
- [ ] Dev server restarted
- [ ] Login works without errors
- [ ] Redirects to correct dashboard

## 🐛 Troubleshooting

### If login still fails:

1. **Check browser console** for detailed error:
   ```
   Look for: "❌ Profile fetch error:" with details
   ```

2. **Verify in Supabase Dashboard**:
   ```sql
   -- Check if user exists
   SELECT * FROM auth.users WHERE email = 'student@cktutas.edu.gh';
   
   -- Check if profile exists
   SELECT * FROM user_profiles WHERE email = 'student@cktutas.edu.gh';
   
   -- Check if IDs match
   SELECT 
       au.id as auth_id,
       up.id as profile_id,
       CASE WHEN au.id = up.id THEN '✅ MATCH' ELSE '❌ MISMATCH' END as status
   FROM auth.users au
   LEFT JOIN user_profiles up ON au.id = up.id
   WHERE au.email = 'student@cktutas.edu.gh';
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```

4. **Test query as authenticated user**:
   ```sql
   -- This should work when you're logged in
   SELECT * FROM user_profiles WHERE id = auth.uid();
   ```

### Common Issues:

**Issue**: "Permission denied for table user_profiles"
**Fix**: RLS policies not set correctly. Re-run `diagnose-and-fix-profile-access.sql`

**Issue**: "No rows returned" (PGRST116)
**Fix**: Profile doesn't exist. Run `verify-student-profile.sql`

**Issue**: "Email not confirmed"
**Fix**: In Supabase Dashboard → Authentication → Users → Click user → Confirm email

**Issue**: "Invalid login credentials"
**Fix**: Password might be wrong. Reset it in Supabase Dashboard

## 📝 Test Credentials

```
Email:    student@cktutas.edu.gh
Password: Student@2026
Role:     student
Expected: Redirect to /student-dashboard
```

## 🎉 Success Indicators

When everything works, you should see in browser console:
```
✅ User authenticated: [user-id]
✅ User profile loaded: [profile-object]
✅ Login tracked in database
```

And the page should redirect to the student dashboard.

## 📞 Need Help?

If issues persist after following all steps:
1. Check all SQL scripts ran successfully
2. Verify no errors in Supabase Dashboard → Logs
3. Clear browser cache and cookies
4. Try in incognito/private browsing mode
5. Check network tab for failed requests

---

**Files Created:**
- ✅ `diagnose-and-fix-profile-access.sql` - Fix RLS policies
- ✅ `verify-student-profile.sql` - Verify/create student profile
- ✅ `FIX_PROFILE_FETCH_ERROR.md` - Detailed troubleshooting guide
- ✅ `LOGIN_ERROR_FIX_STEPS.md` - This file

**Last Updated**: January 2026
