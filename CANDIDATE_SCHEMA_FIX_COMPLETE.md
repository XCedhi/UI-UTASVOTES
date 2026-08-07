# Candidate Application Schema Fix - Complete

## Issue Resolved

**Error Message:**
```
Could not find the 'name' column of 'candidates' in the schema cache
```

**Root Cause:**
The API was trying to insert data into a `name` column that doesn't exist in the `candidates` table. The correct column name is `full_name`.

## Changes Made

### 1. API Route Fixed (`src/app/api/candidate-application/submit/route.ts`)

**Changed the base candidateData object:**

```typescript
// BEFORE (❌ Wrong)
const candidateData: any = {
  election_id: electionId,
  name: fullName,           // ❌ Column doesn't exist
  position: positionTitle,
  status: 'pending',
  email: email,
  submitted_at: new Date().toISOString(),
};

// AFTER (✅ Correct)
const candidateData: any = {
  election_id: electionId,
  user_id: userId,          // ✅ Required field
  position: positionTitle,
  status: 'pending',
  submitted_at: new Date().toISOString(),
};

// Add optional fields conditionally
if (fullName) candidateData.full_name = fullName;  // ✅ Correct column
if (email) candidateData.email = email;
if (studentId) candidateData.student_id = studentId;
// ... etc
```

### 2. Database Schema Alignment

Created `fix-candidates-schema-final.sql` to ensure all required columns exist:

| Field | Database Column | Type | Required |
|-------|----------------|------|----------|
| User ID | user_id | UUID | Yes |
| Election ID | election_id | BIGINT | Yes |
| Position | position | TEXT | Yes |
| Status | status | TEXT | Yes |
| Full Name | full_name | TEXT | No |
| Email | email | TEXT | No |
| Student ID | student_id | TEXT | No |
| Phone | phone | TEXT | No |
| Department | department | TEXT | No |
| Level | level | TEXT | No |
| Transaction ID | transaction_id | TEXT | No |
| Application Fee | application_fee | NUMERIC | No |
| Photo URL | photo_url | TEXT | No |
| Manifesto URL | manifesto_url | TEXT | No |
| Student ID Doc | student_id_document_url | TEXT | No |
| Transcript URL | transcript_url | TEXT | No |
| Submitted At | submitted_at | TIMESTAMPTZ | No |
| Reviewed By | reviewed_by | UUID | No |
| Reviewed At | reviewed_at | TIMESTAMPTZ | No |
| Review Notes | review_notes | TEXT | No |

## Required Action

### ⚠️ YOU MUST RUN THIS SQL SCRIPT

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy content from `fix-candidates-schema-final.sql`
4. Run the script
5. Verify you see: `✅ CANDIDATES TABLE READY`

**Why?** The API code is fixed, but your database might not have all the required columns yet.

## Testing After Fix

### Method 1: Manual Test

1. Log in as student
2. Navigate to candidate registration
3. Complete all 6 steps
4. Submit application
5. Should see success message

### Method 2: Database Check

```sql
-- Check if application was saved
SELECT * FROM candidates 
ORDER BY created_at DESC 
LIMIT 1;

-- Check notifications were created
SELECT * FROM notifications 
WHERE type = 'application' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Method 3: Browser Console Test

```javascript
// Test API directly
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
}).then(r => r.json()).then(console.log);
```

## Success Indicators

After successful submission:

- ✅ No console errors about missing columns
- ✅ Alert: "Application submitted successfully!"
- ✅ Redirect to student dashboard
- ✅ New record in `candidates` table
- ✅ Notifications created for admin/commission users
- ✅ Application visible in admin panel
- ✅ Application visible in commission panel

## Common Issues After Fix

### Issue 1: Still getting "Could not find column" error

**Cause:** SQL script wasn't run or didn't complete successfully

**Solution:**
1. Run `fix-candidates-schema-final.sql` in Supabase
2. Check output for errors
3. Verify columns exist:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'candidates';
   ```

### Issue 2: "Missing required fields" error

**Cause:** One of userId, electionId, positionTitle, fullName, email, or transactionId is null

**Solution:**
1. Ensure user is logged in (userId exists)
2. Complete all form steps
3. Complete payment step (transactionId exists)
4. Check browser console for which field is missing

### Issue 3: "You have already applied for this position"

**Cause:** Duplicate application detected

**Solution:**
1. Check existing applications:
   ```sql
   SELECT * FROM candidates WHERE user_id = 'YOUR_USER_ID';
   ```
2. Delete test applications or apply for different position

## Files Created/Modified

### Modified:
1. `src/app/api/candidate-application/submit/route.ts` - Fixed column names

### Created:
1. `fix-candidates-schema-final.sql` - Database schema fix
2. `check-candidates-actual-schema.sql` - Schema verification query
3. `RUN_THIS_SQL_NOW.md` - Quick setup guide
4. `CANDIDATE_SCHEMA_FIX_COMPLETE.md` - This documentation

## Related Documentation

- `CANDIDATE_APPLICATION_FIX_FINAL.md` - Previous fix (gpa column)
- `CANDIDATE_APPLICATION_SUBMISSION_COMPLETE.md` - Full feature docs
- `update-candidates-table-for-applications.sql` - Original schema update
- `TROUBLESHOOT_APPLICATION_SUBMIT.md` - Troubleshooting guide

## Timeline of Fixes

1. **First Issue**: `gpa` column didn't exist
   - **Fix**: Removed cgpa from API
   
2. **Second Issue**: Column name mismatches (`manifesto` vs `manifesto_url`)
   - **Fix**: Updated API to use correct column names
   
3. **Third Issue**: `name` column doesn't exist
   - **Fix**: Changed API to use `full_name` and made fields optional

## Current Status

✅ **API CODE FIXED** - All column names now match database schema
⏳ **DATABASE UPDATE NEEDED** - Run `fix-candidates-schema-final.sql`
🎯 **READY TO TEST** - After SQL script runs, submission should work

## Next Steps

1. **Run SQL script** in Supabase (see `RUN_THIS_SQL_NOW.md`)
2. **Restart dev server** if running
3. **Test submission** with a student account
4. **Verify in database** that application was saved
5. **Check admin/commission panels** to see application

---

**Status**: ✅ Code fixed, awaiting database update
**Action Required**: Run `fix-candidates-schema-final.sql` in Supabase SQL Editor
