# Candidate Application Submission - Final Fix

## Issue Resolved

**Problem**: Application submission was failing with database error:
```
Could not find the 'gpa' column of 'candidates' in the schema cache
```

**Root Cause**: 
1. API was trying to insert `cgpa` field into database, but the `candidates` table doesn't have a `gpa` or `cgpa` column
2. Column names in API didn't match database schema (`manifesto` vs `manifesto_url`, `student_id_doc_url` vs `student_id_document_url`)

## Changes Made

### 1. Fixed API Route (`src/app/api/candidate-application/submit/route.ts`)

**Removed:**
- `cgpa` from destructured body parameters
- Attempt to insert `gpa` field into database

**Fixed Column Names:**
- `manifesto` → `manifesto_url`
- `student_id_doc_url` → `student_id_document_url`

**Before:**
```typescript
if (manifestoUrl) candidateData.manifesto = manifestoUrl;
if (studentIdUrl) candidateData.student_id_doc_url = studentIdUrl;
```

**After:**
```typescript
if (manifestoUrl) candidateData.manifesto_url = manifestoUrl;
if (studentIdUrl) candidateData.student_id_document_url = studentIdUrl;
```

### 2. Database Schema Alignment

The API now correctly maps to these database columns:

| Frontend Field | API Parameter | Database Column |
|---------------|---------------|-----------------|
| fullName | fullName | name |
| studentId | studentId | student_id |
| email | email | email |
| phone | phone | phone |
| department | department | department |
| level | level | level |
| cgpa | cgpa | *(not stored - removed)* |
| transactionId | transactionId | transaction_id |
| applicationFee | applicationFee | application_fee |
| photoUrl | photoUrl | photo_url |
| manifestoUrl | manifestoUrl | manifesto_url |
| studentIdUrl | studentIdUrl | student_id_document_url |
| transcriptUrl | transcriptUrl | transcript_url |

## Testing the Fix

### Method 1: Manual Testing

1. **Log in as a student** (e.g., `scoffie23.stu@cktutas.edu.gh`)

2. **Navigate to Candidate Registration**
   - URL: `http://localhost:4028/candidate-registration`

3. **Complete all 6 steps:**
   - Step 1: Personal Information (auto-filled from profile)
   - Step 2: Position Selection (select an active election position)
   - Step 3: Eligibility Checklist (check all boxes)
   - Step 4: Document Upload (upload required documents)
   - Step 5: Payment (enter phone number, complete payment)
   - Step 6: Review & Submit

4. **Click "Submit Application"**

5. **Expected Result:**
   - Alert: "Application submitted successfully!"
   - Redirect to student dashboard after 2 seconds
   - Console log: "Application submitted successfully: { ... }"

### Method 2: Browser Console Test

1. Open browser console (F12)
2. Copy and paste content from `test-application-submission-fixed.js`
3. Press Enter
4. Check the output

### Method 3: Database Verification

Run these SQL queries in Supabase:

```sql
-- Check latest application
SELECT * FROM candidates 
ORDER BY created_at DESC 
LIMIT 1;

-- Check notifications created
SELECT * FROM notifications 
WHERE type = 'application' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check all pending applications
SELECT 
  id,
  name,
  position,
  status,
  email,
  submitted_at
FROM candidates 
WHERE status = 'pending'
ORDER BY submitted_at DESC;
```

## Success Checklist

After successful submission, verify:

- ✅ No console errors
- ✅ Alert message appears
- ✅ Redirect to dashboard occurs
- ✅ New record in `candidates` table with status='pending'
- ✅ Notifications created for all admin/commission users
- ✅ Application visible in admin panel (Admin System Control → Election → Applications)
- ✅ Application visible in commission panel (Electoral Commission → Applications)

## What Happens After Submission

1. **Database Insert**
   - New record created in `candidates` table
   - Status set to 'pending'
   - All form data saved

2. **Notifications Created**
   - System finds all users with role='admin' or role='commission'
   - Creates notification for each user
   - Notification type: 'application'
   - Message: "{fullName} has submitted an application for {positionTitle}"

3. **Admin/Commission Review**
   - Admins and commission members see notification
   - Can view application details
   - Can approve or reject application
   - Can add review notes

4. **Student Notification**
   - Student receives confirmation (future enhancement)
   - Can view application status in dashboard (future enhancement)

## Common Issues & Solutions

### Issue 1: "Missing required fields"

**Cause**: One of the required fields is empty
- userId, electionId, positionTitle, fullName, email, or transactionId

**Solution**: 
- Ensure you're logged in (userId exists)
- Complete all form steps
- Complete payment step (transactionId exists)

### Issue 2: "You have already applied for this position"

**Cause**: Duplicate application detected

**Solution**: 
- Check database: `SELECT * FROM candidates WHERE user_id = 'YOUR_USER_ID';`
- Either delete the existing application or apply for a different position

### Issue 3: No active elections/positions

**Cause**: No elections with status='active'

**Solution**:
1. Log in as commission or admin
2. Create a new election or activate an existing one
3. Set status to 'active'
4. Try application again

### Issue 4: Payment not working

**Cause**: Payment API not configured or failing

**Solution**:
- Check `.env` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check `payment_transactions` table exists
- For testing, you can bypass payment (see TROUBLESHOOT_APPLICATION_SUBMIT.md)

## Files Modified

1. `src/app/api/candidate-application/submit/route.ts` - Fixed column names, removed cgpa
2. `test-application-submission-fixed.js` - New test script
3. `CANDIDATE_APPLICATION_FIX_FINAL.md` - This documentation

## Related Documentation

- `CANDIDATE_APPLICATION_SUBMISSION_COMPLETE.md` - Full feature documentation
- `SETUP_CANDIDATE_APPLICATIONS.md` - Setup guide
- `TROUBLESHOOT_APPLICATION_SUBMIT.md` - Detailed troubleshooting
- `update-candidates-table-for-applications.sql` - Database schema
- `MOMO_PAYMENT_INTEGRATION_COMPLETE.md` - Payment integration docs

## Next Steps

1. **Test the submission** using one of the methods above
2. **Verify in database** that the application was saved
3. **Check admin/commission panels** to see if application appears
4. **Test approval workflow** (admin/commission can approve/reject)

## Status

✅ **FIXED** - Application submission should now work correctly

The API now correctly maps all fields to the database schema without trying to insert non-existent columns.
