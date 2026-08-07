# 🚨 URGENT: Run This SQL Script Now

## The Problem

The API was trying to insert into a `name` column that doesn't exist in the `candidates` table.

## The Solution

I've fixed the API to use `full_name` instead of `name`, but you need to run this SQL script to ensure your database has all the required columns.

## Steps to Fix

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard

### 2. Navigate to SQL Editor

- Click on your project
- Click "SQL Editor" in the left sidebar
- Click "New query"

### 3. Copy and Paste This SQL

Copy the entire content of `fix-candidates-schema-final.sql` and paste it into the SQL editor.

### 4. Run the Script

Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)

### 5. Verify Success

You should see output like:
```
✅ CANDIDATES TABLE READY
total_columns: 20+
```

And a list of all columns including:
- id
- user_id
- election_id
- position
- status
- full_name ← This is the key one!
- email
- student_id
- phone
- department
- level
- transaction_id
- application_fee
- photo_url
- manifesto_url
- student_id_document_url
- transcript_url
- submitted_at
- reviewed_by
- reviewed_at
- review_notes
- created_at
- updated_at

## What Changed in the Code

### API Route (`src/app/api/candidate-application/submit/route.ts`)

**Before:**
```typescript
const candidateData: any = {
  election_id: electionId,
  name: fullName,  // ❌ This column doesn't exist!
  position: positionTitle,
  status: 'pending',
  email: email,
  submitted_at: new Date().toISOString(),
};
```

**After:**
```typescript
const candidateData: any = {
  election_id: electionId,
  user_id: userId,  // ✅ Required field
  position: positionTitle,
  status: 'pending',
  submitted_at: new Date().toISOString(),
};

// Add optional fields
if (fullName) candidateData.full_name = fullName;  // ✅ Correct column name
if (email) candidateData.email = email;
// ... etc
```

## After Running the SQL

1. **Restart your dev server** (if it's running):
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Test the application submission**:
   - Log in as student: `scoffie23.stu@cktutas.edu.gh`
   - Go to: `http://localhost:4028/candidate-registration`
   - Complete all 6 steps
   - Click "Submit Application"

3. **Expected result**:
   - ✅ Success alert appears
   - ✅ Redirects to dashboard
   - ✅ No console errors

4. **Verify in database**:
   ```sql
   SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1;
   ```

## If You Still Get Errors

### Error: "Could not find the 'X' column"

This means the SQL script didn't run properly or the column wasn't created.

**Solution:**
1. Run this to check what columns exist:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'candidates'
   ORDER BY ordinal_position;
   ```

2. Compare with the list above
3. If columns are missing, run `fix-candidates-schema-final.sql` again

### Error: "permission denied" or "RLS policy"

**Solution:**
1. Check your `.env` file has:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. The service role key bypasses RLS policies

### Error: "duplicate key value violates unique constraint"

This means you're trying to apply for the same position twice.

**Solution:**
1. Check existing applications:
   ```sql
   SELECT * FROM candidates WHERE user_id = 'YOUR_USER_ID';
   ```

2. Either delete the existing application or apply for a different position

## Quick Test After Fix

Run this in browser console (F12) after logging in:

```javascript
// Quick test
fetch('/api/candidate-application/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: localStorage.getItem('userId'),
    electionId: 'test-id',
    positionTitle: 'President',
    fullName: 'Test User',
    email: localStorage.getItem('userEmail'),
    transactionId: 'TEST_' + Date.now(),
  })
}).then(r => r.json()).then(console.log);
```

If successful, you'll see:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": 123
}
```

## Files Modified

1. ✅ `src/app/api/candidate-application/submit/route.ts` - Fixed to use `full_name`
2. ✅ `fix-candidates-schema-final.sql` - SQL to add missing columns
3. ✅ `RUN_THIS_SQL_NOW.md` - This guide

## Status

🔧 **CODE FIXED** - API now uses correct column names
⏳ **DATABASE PENDING** - You need to run the SQL script
✅ **READY TO TEST** - After running SQL, test the submission

---

**Next Step**: Run `fix-candidates-schema-final.sql` in Supabase SQL Editor NOW!
