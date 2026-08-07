# Troubleshooting: Application Submission Not Working

## Quick Diagnosis

### Step 1: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try submitting the application
4. Look for these messages:

**If you see**: `"Payment not completed. Please complete the payment step first."`
- **Problem**: Payment step (Step 5) wasn't completed
- **Solution**: Go back to Step 5 and complete the payment

**If you see**: `"User session not found. Please log in again."`
- **Problem**: Not logged in or session expired
- **Solution**: Log out and log back in

**If you see**: `"Selected position not found."`
- **Problem**: No position selected in Step 2
- **Solution**: Go back to Step 2 and select a position

**If you see**: `"API Error Response: ..."`
- **Problem**: Server-side error
- **Solution**: Check the error details (see below)

### Step 2: Check What Data Is Being Sent

Look for this console log:
```
Submitting application data: { userId: "...", electionId: "...", ... }
```

Verify:
- ✅ `userId` is not null
- ✅ `electionId` is not null
- ✅ `transactionId` is not null
- ✅ `fullName`, `email`, etc. are filled

### Step 3: Check API Response

Look for:
```
API Error Response: { error: "...", details: "..." }
```

Common errors:

**"Missing required fields"**
- One of: userId, electionId, positionTitle, fullName, email, or transactionId is missing
- Check Step 1 (personal info) and Step 5 (payment) are complete

**"You have already applied for this position"**
- You've already submitted an application for this position
- Check the database or try a different position

**"Failed to submit application"**
- Database error
- Check Supabase logs
- Verify database schema is correct

## Manual Testing

### Test 1: Run Test Script

1. Open browser console (F12)
2. Copy and paste content from `test-candidate-application-submit.js`
3. Press Enter
4. Check the output

### Test 2: Check Database Setup

Run this SQL in Supabase:

```sql
-- Check if candidates table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'candidates'
);

-- Check candidates table columns
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'candidates'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'candidates';
```

### Test 3: Check Notifications Table

```sql
-- Check if notifications table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
);

-- Check recent notifications
SELECT * FROM notifications 
WHERE type = 'application'
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 4: Check Admin/Commission Users

```sql
-- Check if there are admin/commission users
SELECT id, email, role 
FROM user_profiles 
WHERE role IN ('admin', 'commission');
```

If no results, notifications won't be created (but application will still be saved).

## Common Issues & Solutions

### Issue 1: Payment Step Not Working

**Symptoms**: Can't proceed past Step 5, or transactionId is null

**Solutions**:
1. Check if payment_transactions table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'payment_transactions'
);
```

2. If not, run: `create-payment-transactions-table.sql`

3. Try the payment again

### Issue 2: Application Saves But No Notifications

**Symptoms**: Application appears in database but admin/commission don't see it

**Solutions**:
1. Check if admin/commission users exist (see Test 4 above)
2. Check notifications table for errors
3. Manually create a notification:
```sql
INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
SELECT 
  id,
  'application',
  'New Candidate Application',
  'Test Candidate has submitted an application for President',
  false,
  NOW()
FROM user_profiles
WHERE role IN ('admin', 'commission');
```

### Issue 3: Database Schema Mismatch

**Symptoms**: Error about missing columns

**Solutions**:
1. Run: `update-candidates-table-for-applications.sql`
2. Verify all columns exist:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'candidates'
ORDER BY ordinal_position;
```

Expected columns:
- id, election_id, name, position, status, email, department, level, gpa
- user_id, student_id, phone, transaction_id, application_fee
- photo_url, manifesto, student_id_doc_url, transcript_url
- submitted_at, created_at, updated_at

### Issue 4: RLS Policy Blocking Insert

**Symptoms**: "permission denied" or "new row violates row-level security policy"

**Solutions**:
1. Check if service role key is set in `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Temporarily disable RLS for testing:
```sql
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
```

3. Try submission again
4. Re-enable RLS:
```sql
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
```

5. If it works, the issue is with RLS policies. Run:
```sql
-- File: update-candidates-table-for-applications.sql
-- (The RLS policy section)
```

## Step-by-Step Debug Process

1. **Open browser console** (F12)
2. **Clear console** (click trash icon)
3. **Fill out application form** (all 6 steps)
4. **Click "Submit Application"**
5. **Watch console output**
6. **Copy any errors**
7. **Check database**:
```sql
SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1;
```

8. **Check notifications**:
```sql
SELECT * FROM notifications WHERE type = 'application' ORDER BY created_at DESC LIMIT 5;
```

## Still Not Working?

### Collect This Information:

1. **Console errors** (screenshot or copy text)
2. **Network tab** (F12 → Network → filter by "submit")
   - Click on the request
   - Copy Response
3. **Database check**:
```sql
-- Last candidate
SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1;

-- Count of candidates
SELECT COUNT(*) FROM candidates;

-- Check if your user has any applications
SELECT * FROM candidates WHERE user_id = 'YOUR_USER_ID';
```

4. **Environment variables**:
   - Is `SUPABASE_SERVICE_ROLE_KEY` set in `.env`?
   - Is `NEXT_PUBLIC_SUPABASE_URL` correct?

### Quick Fix: Bypass Payment for Testing

If you just want to test the submission without payment:

1. Open `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx`
2. Find the `handleSubmit` function
3. Comment out the payment check:
```typescript
// Check if payment was completed
// if (!transactionId) {
//   alert('Payment not completed. Please complete the payment step first.');
//   return;
// }
```

4. Set a test transaction ID:
```typescript
const testTransactionId = transactionId || 'TEST_TXN_' + Date.now();
```

5. Use `testTransactionId` in applicationData instead of `transactionId`

6. Try submitting again

## Success Checklist

After successful submission, you should see:

- ✅ Alert: "Application submitted successfully!"
- ✅ Console log: "Application submitted successfully: { ... }"
- ✅ Redirect to student dashboard after 2 seconds
- ✅ New record in `candidates` table
- ✅ New records in `notifications` table (one per admin/commission user)
- ✅ Application visible in admin panel (Applications tab)
- ✅ Application visible in commission panel (Applications tab)

## Need More Help?

Check these files for reference:
- `CANDIDATE_APPLICATION_SUBMISSION_COMPLETE.md` - Full documentation
- `SETUP_CANDIDATE_APPLICATIONS.md` - Setup guide
- `test-candidate-application-submit.js` - Test script
