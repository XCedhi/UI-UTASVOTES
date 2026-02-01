# Election Creation Permission Error - Complete Fix

## Problem
Error 42501: "permission denied for table elections" - even with RLS disabled.

## Root Cause
The Supabase client is using the ANON key, but the user's authentication session isn't being properly recognized by Supabase. This causes all database operations to fail with permission errors.

## Solution

### Step 1: Re-enable RLS (Important!)
Run this in Supabase SQL Editor:

```sql
-- Re-enable RLS on elections table
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
```

### Step 2: Grant Direct Table Permissions
The RLS policies alone aren't enough. We need to grant the `authenticated` role direct permissions:

```sql
-- Grant permissions to authenticated users
GRANT ALL ON elections TO authenticated;
GRANT ALL ON positions TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- Grant usage on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### Step 3: Verify User Authentication
Run this query while logged in to check if Supabase recognizes your session:

```sql
-- Check current user
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;
```

If this returns NULL, your session isn't being recognized.

### Step 4: Fix Session Persistence (if needed)
If the session isn't persisting, log out and log back in:

1. Clear browser localStorage: F12 → Application → Local Storage → Clear All
2. Go to http://localhost:4028/login
3. Login again with: jkorkugah23.stu@cktutas.edu.gh / Admin@2026
4. Try creating an election

### Step 5: Test Election Creation
1. Go to Admin System Control → Election Management
2. Click "Create Election"
3. Fill in the form
4. Submit

It should work now!

## Why This Happens

The ANON key has limited permissions and relies on:
1. **RLS policies** - to control row-level access
2. **Table grants** - to control table-level access
3. **Valid auth session** - to identify the user

If any of these are missing, you get permission errors.

## Prevention

Always ensure:
- Users are properly authenticated with `supabase.auth.signInWithPassword()`
- The authenticated role has table-level grants
- RLS policies check `auth.uid()` correctly
- The user's role in `user_profiles` matches the policy requirements
