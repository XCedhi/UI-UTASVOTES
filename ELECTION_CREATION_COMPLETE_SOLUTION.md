# Election Creation - Complete Solution

## Summary
We've successfully created the election creation feature with database integration, but we're encountering a persistent "permission denied" error even when using the service role key.

## What We've Built

### ✅ Database Schema
- Added all required columns to `elections` table
- Created `positions` table with proper relationships
- Added `application_fee` column for fee management
- All tables have proper RLS policies

### ✅ Server-Side API Route
- Created `/api/elections/create` endpoint
- Uses service role key (bypasses RLS)
- Handles election creation, positions, and notifications
- Proper error logging and validation

### ✅ Frontend Integration
- 3-step election creation wizard
- Form validation
- Calls API route instead of direct Supabase
- Proper error handling

## The Remaining Issue

**Error:** "permission denied for table elections" (Error code 42501)
**Even with:** Service role key loaded correctly (219 characters)

## Possible Causes

1. **Wrong API Key** - The `SUPABASE_SERVICE_ROLE_KEY` in `.env` might actually be the anon key
2. **Supabase Project Settings** - Table permissions might be restricted at project level
3. **Schema/Table Ownership** - The elections table might be owned by a different role

## Final Solution Steps

### Step 1: Verify Service Role Key

1. Go to Supabase Dashboard → Your Project → Settings → API
2. Find the **service_role** key (NOT the anon key)
3. Copy it completely
4. Open your `.env` file
5. Replace `SUPABASE_SERVICE_ROLE_KEY=` with the new key
6. Restart dev server: `Ctrl+C` then `npm run dev`

### Step 2: Grant Permissions in Supabase

Run this in Supabase SQL Editor:

```sql
-- Grant ALL permissions to service_role
GRANT ALL ON TABLE elections TO service_role;
GRANT ALL ON TABLE positions TO service_role;
GRANT ALL ON TABLE notifications TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

### Step 3: Test with Direct SQL

Before testing the app, verify you can insert directly in Supabase:

```sql
-- Test insert (should work)
INSERT INTO elections (
  name,
  description,
  election_type,
  status,
  nomination_start,
  nomination_end,
  voting_start,
  voting_end
) VALUES (
  'Test Election',
  'Testing',
  'university-wide',
  'upcoming',
  '2026-02-01 00:00:00',
  '2026-02-15 23:59:59',
  '2026-02-16 00:00:00',
  '2026-02-20 23:59:59'
);
```

If this works, the database is fine. If it fails, there's a deeper permission issue.

### Step 4: Alternative - Disable RLS Temporarily

If nothing else works, temporarily disable RLS for testing:

```sql
ALTER TABLE elections DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
```

Then try creating an election. If it works, the issue is definitely RLS-related.

## Files Created

- `src/app/api/elections/create/route.ts` - API endpoint
- `src/app/admin-system-control/election/new/page.tsx` - Page wrapper
- `src/app/admin-system-control/election/new/components/CreateElectionInteractive.tsx` - Form component
- `src/app/admin-system-control/election/components/DatabaseFeeManager.tsx` - Fee management

## SQL Scripts to Run

1. `fix-elections-table-complete.sql` - Adds all missing columns
2. `create-positions-table-fixed.sql` - Creates positions table
3. `add-fee-to-positions.sql` - Adds fee column
4. `grant-service-role-permissions.sql` - Grants permissions

## Next Steps After Fix

Once election creation works:

1. Test the complete flow:
   - Create election
   - View in Elections tab
   - Set fees in Fees tab
   - Verify notifications sent

2. Integrate with candidate registration:
   - Candidates can see available positions
   - Candidates pay the set fee when applying

3. Add election management features:
   - Edit elections
   - Delete elections
   - Change election status

## Contact for Help

If the issue persists, we may need to:
1. Check Supabase project settings
2. Verify table ownership
3. Contact Supabase support
4. Consider recreating the elections table from scratch

The core functionality is built and ready - we just need to resolve this final permission issue!
