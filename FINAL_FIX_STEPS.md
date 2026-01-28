# Final Fix Steps - Admin Profile & Notifications from Database

## Current Situation
On `/admin-system-control/users/manage` page, the Header shows:
- ❌ Hardcoded notification count (5)
- ❌ Generic profile picture
- ✅ We've already updated the code to use `useAdminProfile` hook
- ❌ The changes aren't taking effect due to build cache

## What We Fixed
1. ✅ Created `useAdminProfile` hook to fetch real data from database
2. ✅ Updated all 12 admin pages to use the hook
3. ✅ Fixed the hook to not query non-existent `profile_picture_url` column
4. ✅ Added console logging for debugging
5. ✅ Cleared `.next` build cache

## What You Need to Do Now

### Step 1: Restart Dev Server
```bash
# Stop the current dev server (Ctrl+C)
# Then run:
npm run dev
```

### Step 2: Hard Refresh Browser
After the server restarts:
1. Go to the page: `http://localhost:4028/admin-system-control/users/manage`
2. Press `Ctrl + Shift + R` (hard refresh to clear browser cache)

### Step 3: Check Console Logs
Open browser console (F12) and you should now see:
```
🔍 useAdminProfile - Session: [your-user-id]
👤 useAdminProfile - Profile data: {full_name: "...", avatar_url: "...", email: "..."}
🔔 useAdminProfile - Notification count: [number]
```

### Step 4: Verify RLS Policies
If you see 401 errors in Network tab, run this SQL in Supabase:

```sql
-- Fix RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Step 5: Ensure Profile Exists
Run this SQL to check if admin profile exists:

```sql
-- Check if profile exists
SELECT id, email, full_name, role, avatar_url
FROM user_profiles
WHERE email = 'admin@cktutas.edu.gh';

-- If no results, create the profile:
INSERT INTO user_profiles (id, email, full_name, role, status)
SELECT 
  id,
  'admin@cktutas.edu.gh',
  'System Administrator',
  'admin',
  'active'
FROM auth.users
WHERE email = 'admin@cktutas.edu.gh'
ON CONFLICT (id) DO NOTHING;
```

## Expected Result

After completing these steps, on `/admin-system-control/users/manage` you should see:
- ✅ Your actual name from database (not "System Administrator")
- ✅ Your profile picture if you've uploaded one
- ✅ Actual notification count from database (not hardcoded 5)

## If It Still Doesn't Work

1. **Check console logs** - Share what you see
2. **Check Network tab** - Look for 401 errors on user_profiles requests
3. **Try logging out and back in** - Sometimes session needs refresh
4. **Check if profile exists** - Run the SQL query above

## Files That Were Updated
- `src/hooks/useAdminProfile.ts` - Hook to fetch data
- `src/app/admin-system-control/users/manage/components/UserManagementInteractive.tsx` - Uses the hook
- All other 11 admin pages - Also use the hook

## Why This Happened
The `useAdminProfile` hook was trying to fetch a column (`profile_picture_url`) that doesn't exist in your database, causing the query to fail silently. We fixed this, but Next.js caches the build, so you need to restart the dev server for changes to take effect.
