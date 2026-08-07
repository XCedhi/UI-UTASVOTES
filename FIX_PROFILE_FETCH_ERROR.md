# Fix Profile Fetch Error After Login

## Problem
After successful authentication, the system shows "Profile fetch error: {}" because RLS policies are blocking the profile read.

## Solution

### Step 1: Run the Diagnostic and Fix SQL Script

Go to your **Supabase Dashboard** → **SQL Editor** and run this script:

```sql
-- File: diagnose-and-fix-profile-access.sql
```

This script will:
1. ✅ Check if user_profiles table exists
2. ✅ Show current RLS policies
3. ✅ List all users and their profile status
4. ✅ Drop problematic policies
5. ✅ Create correct policies for authenticated users
6. ✅ Verify the fix

### Step 2: Verify User Profiles Exist

After running the script, check the output to ensure:
- All users in `auth.users` have corresponding entries in `user_profiles`
- The profile status shows "✅ HAS PROFILE" for all users

### Step 3: Create Missing Profiles (if needed)

If any users are missing profiles, run:

```sql
-- Create profile for user without one
INSERT INTO user_profiles (
    id,
    email,
    role,
    full_name,
    student_id,
    department,
    requires_password_change,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    'student' as role,
    SPLIT_PART(au.email, '@', 1) as full_name,
    NULL as student_id,
    NULL as department,
    true as requires_password_change,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
```

### Step 4: Test Login

1. Restart your dev server:
```bash
npm run dev
```

2. Try logging in with student credentials
3. Check browser console for detailed error messages

## What Changed

### Code Changes:
- ✅ Enhanced error logging in LoginForm.tsx
- ✅ Increased session establishment wait time to 1 second
- ✅ Added specific error messages for different failure types

### Database Changes:
- ✅ Fixed RLS policies to allow authenticated users to read their own profiles
- ✅ Added service role access for admin operations
- ✅ Ensured all users have corresponding profiles

## Expected Behavior After Fix

1. User enters credentials
2. Authentication succeeds ✅
3. Session is established (1 second wait)
4. Profile is fetched successfully ✅
5. User is redirected to appropriate dashboard ✅

## Troubleshooting

If the error persists:

1. **Check browser console** for the detailed error message
2. **Verify in Supabase Dashboard** that the user has a profile:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'user@cktutas.edu.gh';
   ```
3. **Check RLS policies** are active:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```
4. **Test the query directly** in SQL Editor:
   ```sql
   -- This should work when logged in as the user
   SELECT * FROM user_profiles WHERE id = auth.uid();
   ```

## Student Test Credentials

From your DEFAULT_LOGIN_CREDENTIALS.md:
- Email: `student@cktutas.edu.gh`
- Password: Check your documentation

Make sure this user has a profile in the database!
