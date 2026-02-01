# Fix Election Creation Error - Final Solution

## Problem
Getting error when creating elections. Initially appeared as `42501: permission denied` but actual issue is **schema mismatch**.

## Root Cause (DISCOVERED!)
The `elections` table has a `title` column marked as NOT NULL, but the API is trying to insert into a `name` column instead. This is a **schema mismatch**, not a permission issue.

**Test results show:**
- ✅ Service role key is working correctly
- ✅ Read access works
- ❌ Insert fails because of missing `title` column value

## Solution Steps

### Step 1: Fix Schema Mismatch (THE ACTUAL FIX!)

The `elections` table has a `title` column but the API uses `name`. We need to fix this mismatch.

Run this SQL script in **Supabase SQL Editor**:

```sql
-- Copy and paste the contents of: fix-elections-schema-mismatch.sql
```

This will:
- Make the `title` column nullable (so it doesn't cause errors)
- Ensure the `name` column exists and is NOT NULL
- Test that inserts work correctly

**To run:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy the entire contents of `fix-elections-schema-mismatch.sql`
4. Paste and click "Run"
5. You should see the test insert succeed

### Step 2: (Optional) Fix RLS Policies

If you want to ensure proper RLS policies are in place, run this SQL script:

```sql
-- Copy and paste the contents of: fix-elections-permissions-final.sql
```

This creates proper bypass policies for service_role and user policies for authenticated users.

### Step 3: Test Service Role Key (Verification)

Run the test script to verify the key works:

```bash
node test-service-role-direct.js
```

**Expected output after schema fix:**
```
✅ Read successful!
✅ Insert successful!
✅ All tests passed!
```

### Step 4: Restart Dev Server

After making changes to database schema:

```bash
# No need to restart - just test!
```

### Step 5: Test Election Creation

1. Go to http://localhost:4028/admin-system-control/election/new
2. Fill in the election form:
   - Name: "Test Election"
   - Description: "Testing election creation"
   - Type: "University-wide"
   - Set dates (nomination, voting)
   - Add at least one position
3. Click "Create Election"

**Expected result:**
- Success message appears
- Redirected to elections list
- New election appears in the list

## Troubleshooting

### Error: "null value in column 'title' violates not-null constraint"

This is the schema mismatch error. **Solution:**
- Run `fix-elections-schema-mismatch.sql` in Supabase SQL Editor
- This makes `title` nullable and ensures `name` column exists

### Still getting permission denied after schema fix?

**Check 1: Is RLS actually bypassed for service_role?**

Run in Supabase SQL Editor:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'elections' 
AND policyname LIKE '%service_role%';
```

Should return a policy named `service_role_bypass_elections`.

**Check 2: Are you using the correct Supabase client?**

In `src/app/api/elections/create/route.ts`, verify:
```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ← Must be service_role key!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Check 3: Is the environment variable loading?**

Check terminal output when creating election:
```
🔑 Service Role Key length: 219  ← Should be ~219 characters
```

If it shows a different length, the wrong key is in `.env`.

### Error: "Lock broken by another request"

This happens when running multiple SQL queries simultaneously in Supabase.

**Solution:**
- Wait a few seconds
- Run the SQL script again
- Or run queries one at a time

### Elections table doesn't exist?

Run this first:
```sql
-- Copy and paste: fix-elections-table-complete.sql
```

Then run Step 3 again.

### Positions table doesn't exist?

Run this first:
```sql
-- Copy and paste: create-positions-table-fixed.sql
```

Then run Step 3 again.

## Success Checklist

- [ ] `fix-elections-schema-mismatch.sql` executed successfully in Supabase
- [ ] Test script passes (`node test-service-role-direct.js`)
- [ ] Test insert in SQL script succeeded
- [ ] Election creation works in UI
- [ ] New election appears in elections list
- [ ] Positions are created with the election
- [ ] Notifications are sent to users

## Next Steps After Fix

Once election creation works:

1. **Test Fee Management**
   - Go to Elections tab
   - Click "Manage Fees"
   - Set fees for positions
   - Verify fees save to database

2. **Test Complete Flow**
   - Create election with multiple positions
   - Set different fees for each position
   - Verify candidates can see fees when applying
   - Test payment integration

3. **Verify Notifications**
   - Check that all users receive notification
   - Verify notification appears in UI
   - Test marking notifications as read

## Files Reference

- `fix-elections-schema-mismatch.sql` - **MAIN FIX** for schema mismatch
- `test-service-role-direct.js` - Test service role key and schema
- `fix-elections-permissions-final.sql` - (Optional) Fix RLS policies
- `verify-table-ownership.sql` - Verify database setup
- `fix-elections-table-complete.sql` - Add missing columns to elections
- `create-positions-table-fixed.sql` - Create positions table
- `src/app/api/elections/create/route.ts` - API route using service role

## Support

If you're still stuck after following all steps:

1. Run `node test-service-role-direct.js` and share the output
2. Run the verification SQL and share results
3. Share the exact error message from terminal
4. Check browser console for any client-side errors
