# Header Data Issue - Troubleshooting Guide

## Current Issue
The Header component is showing data (notification count of 5 and a profile picture), but it's not the real data from the database.

## Diagnosis Steps

### Step 1: Check Console Logs
Open browser console (F12) and look for these logs:
- 🔍 useAdminProfile - Session: [user_id]
- 👤 useAdminProfile - Profile data: [data]
- 🔔 useAdminProfile - Notification count: [number]
- ❌ useAdminProfile - Profile error: [error]

**If you DON'T see these logs:**
- The `useAdminProfile` hook is not being called
- React might not be re-rendering the component
- There might be a build cache issue

**If you DO see these logs with errors:**
- Check what the error messages say
- Most likely RLS (Row Level Security) is blocking the queries

### Step 2: Check Network Tab
1. Open Network tab in browser DevTools
2. Filter by "user_profiles"
3. Look at the Status column:
   - **200**: Success - data is being fetched
   - **401**: Unauthorized - RLS is blocking
   - **404**: Not found - table doesn't exist
   - **500**: Server error - database issue

### Step 3: Verify RLS Policies
Run this in Supabase SQL Editor:

```sql
-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';
```

### Step 4: Check if Profile Exists
Run this in Supabase SQL Editor:

```sql
-- Check if admin profile exists
SELECT id, email, full_name, role, avatar_url
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';
```

## Quick Fix Options

### Option 1: Temporarily Disable RLS (NOT RECOMMENDED FOR PRODUCTION)
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Option 2: Add Proper RLS Policies
```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Option 3: Create Missing Profile
If the profile doesn't exist, create it:

```sql
-- Get admin user ID from auth
SELECT id, email FROM auth.users WHERE email = 'admin@cktutas.edu.gh';

-- Insert profile (replace USER_ID with actual ID from above)
INSERT INTO user_profiles (id, email, full_name, role, status)
VALUES (
  'USER_ID_HERE',
  'admin@cktutas.edu.gh',
  'System Administrator',
  'admin',
  'active'
);
```

## Expected Behavior

When working correctly, you should see:
1. Console logs showing the hook is fetching data
2. Network requests returning 200 status
3. Your actual name in the header (not "System Administrator")
4. Your actual notification count (not hardcoded 5)
5. Your profile picture if you've uploaded one

## Current Workaround

If the database approach isn't working, we can temporarily use localStorage data:

1. The login stores user data in localStorage
2. We can read from there instead of the database
3. This is less ideal but will work immediately

Let me know which approach you'd like to take!
