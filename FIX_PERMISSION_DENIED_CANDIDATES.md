# 🚨 FIX: Permission Denied for Candidates Table

## The Error

```
permission denied for table candidates
Error code: 42501
```

## The Problem

Even though the API uses the service role key (which should bypass RLS), the RLS policies on the `candidates` table are blocking the insert operation.

## The Solution

Run the SQL script to fix RLS policies and grant proper permissions.

## Steps to Fix

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard

### 2. Navigate to SQL Editor

- Click on your project
- Click "SQL Editor" in the left sidebar
- Click "New query"

### 3. Run This SQL Script

Copy the entire content of `fix-candidates-rls-permissions.sql` and run it.

### 4. Verify Success

You should see output like:
```
✅ RLS POLICIES CREATED
total_policies: 7
```

And a list of policies including:
- `service_role_all_access` ← This is the critical one!
- `authenticated_users_can_insert`
- `users_view_own_applications`
- `public_view_approved_candidates`
- `admin_commission_view_all`
- `admin_commission_update_all`
- `admin_commission_delete_all`

## What This Does

### 1. Service Role Full Access
```sql
CREATE POLICY "service_role_all_access"
  ON public.candidates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

This allows the API (using service role key) to bypass ALL RLS policies.

### 2. Grants Proper Permissions
```sql
GRANT ALL ON public.candidates TO service_role;
GRANT SELECT, INSERT ON public.candidates TO authenticated;
GRANT SELECT ON public.candidates TO anon;
```

This ensures the service role has full permissions at the database level.

## After Running the SQL

### 1. Restart Dev Server (Optional)

The fix is on the database side, so you don't need to restart, but it doesn't hurt:

```bash
# Press Ctrl+C to stop
npm run dev
```

### 2. Test Application Submission

1. Log in as student: `scoffie23.stu@cktutas.edu.gh`
2. Go to: `http://localhost:4028/candidate-registration`
3. Complete all 6 steps
4. Click "Submit Application"

### 3. Expected Result

- ✅ Success alert appears
- ✅ Redirects to dashboard
- ✅ No "permission denied" error
- ✅ Application saved in database

### 4. Verify in Database

```sql
-- Check latest application
SELECT * FROM candidates 
ORDER BY created_at DESC 
LIMIT 1;

-- Check notifications
SELECT * FROM notifications 
WHERE type = 'application' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Why This Happened

### The Issue

When you use the Supabase client with the service role key, it should bypass RLS. However, if the RLS policies don't explicitly allow the `service_role`, the database will still block the operation.

### The Fix

We added a specific policy for `service_role` that allows ALL operations:

```sql
FOR ALL TO service_role USING (true) WITH CHECK (true)
```

This ensures the API can insert, update, delete, and select without any restrictions.

## Common Issues After Fix

### Issue 1: Still getting "permission denied"

**Cause:** SQL script didn't run successfully or policies weren't created

**Solution:**
1. Check if policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'candidates';
```

2. If no policies, run the script again
3. Check for SQL errors in the output

### Issue 2: "Could not find column" error

**Cause:** Database schema still missing columns

**Solution:**
1. Run `fix-candidates-schema-final.sql` first
2. Then run `fix-candidates-rls-permissions.sql`
3. Try submission again

### Issue 3: "Missing required fields"

**Cause:** Form data not complete

**Solution:**
1. Ensure all 6 steps are completed
2. Check payment step (transactionId must exist)
3. Check browser console for which field is missing

## Testing the Fix

### Quick Test in Browser Console

After logging in as a student, run this in browser console (F12):

```javascript
// Test API with minimal data
fetch('/api/candidate-application/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: localStorage.getItem('userId'),
    electionId: 'test-election-id',
    positionTitle: 'President',
    fullName: 'Test Candidate',
    email: localStorage.getItem('userEmail'),
    transactionId: 'TEST_' + Date.now(),
  })
}).then(r => r.json()).then(result => {
  console.log('Result:', result);
  if (result.success) {
    console.log('✅ SUCCESS! Application ID:', result.applicationId);
  } else {
    console.error('❌ FAILED:', result.error);
  }
});
```

**Expected output:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": 123
}
```

## Files Created

1. ✅ `fix-candidates-rls-permissions.sql` - SQL to fix RLS policies
2. ✅ `FIX_PERMISSION_DENIED_CANDIDATES.md` - This guide

## Related Files

- `fix-candidates-schema-final.sql` - Adds missing columns
- `src/app/api/candidate-application/submit/route.ts` - API route
- `CANDIDATE_SCHEMA_FIX_COMPLETE.md` - Previous fix documentation

## Order of Operations

If you're setting up from scratch:

1. **First:** Run `fix-candidates-schema-final.sql` (adds columns)
2. **Second:** Run `fix-candidates-rls-permissions.sql` (fixes permissions)
3. **Third:** Test application submission

## Success Checklist

After running the SQL script:

- ✅ No "permission denied" errors
- ✅ Application saves to database
- ✅ Notifications created for admin/commission
- ✅ Application visible in admin panel
- ✅ Application visible in commission panel
- ✅ Student sees success message

## Status

🔧 **SQL SCRIPT READY** - Run `fix-candidates-rls-permissions.sql`
⏳ **WAITING FOR YOU** - Execute the script in Supabase
✅ **THEN TEST** - Try submitting an application

---

**Next Step:** Run `fix-candidates-rls-permissions.sql` in Supabase SQL Editor NOW!
