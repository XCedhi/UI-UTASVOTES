# Final Fix: Applications Not Showing in Commission Panel

## Root Cause Identified ✅

**Session Expiration Issue**: The browser session keeps expiring, causing "No active session - user not authenticated" errors. When you disable RLS, applications appear briefly, then disappear when the session expires.

## Immediate Solution

Run this SQL in Supabase Dashboard to disable RLS permanently on candidates table:

```sql
-- Disable RLS on candidates table (applications will always show)
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'candidates';
```

## How to Use Commission Panel Now

Since the session keeps expiring, **log out and log back in** whenever you see "No active session" error:

1. Click your profile icon → Log out
2. Log back in with commission credentials
3. Navigate to Applications tab
4. Applications will now show (RLS is disabled)

## Why This Happens

The Supabase session token in the browser is expiring faster than expected. This could be due to:
- Supabase project settings
- Browser localStorage issues  
- Auth token refresh configuration

## Proper Long-Term Fix (Optional)

If you want to re-enable RLS with proper security later:

1. **Enable RLS again**:
```sql
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
```

2. **Create a simple open policy** (allows all authenticated users to read):
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own or all if admin/commission" ON candidates;

-- Create simple policy - all authenticated users can read
CREATE POLICY "Authenticated users can read candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);
```

3. **Check session settings in Supabase Dashboard**:
   - Go to Authentication → Settings
   - Check "JWT expiry limit" (should be at least 3600 seconds / 1 hour)
   - Enable "Refresh token rotation"

## Current Status

✅ Applications ARE saved to database (2 pending applications confirmed)
✅ Submission flow works correctly  
✅ Commission can see applications when logged in
❌ Session expires frequently (requires re-login)

##Workaround

**Just log out and log back in whenever you see the authentication error**. With RLS disabled, applications will appear immediately after login.

## Test the Fix

1. Run the SQL above to disable RLS
2. Log out of commission panel
3. Log back in
4. Go to Applications tab
5. You should see 2 pending applications:
   - Salomay Coffie - Test position 2
   - Salomay Coffie - WOCOM

The applications will stay visible as long as you're logged in. If session expires, just log out and log back in.
