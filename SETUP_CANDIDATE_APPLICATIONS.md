# Setup Guide: Candidate Application Submissions

## Quick Start

Follow these steps to enable candidate application submissions in your UTASVotes system.

## Step 1: Update Database Schema

Run this SQL script in your Supabase SQL Editor:

```sql
-- File: update-candidates-table-for-applications.sql
```

This script will:
- Add all necessary columns to the `candidates` table
- Update RLS policies for proper access control
- Enable students to submit applications
- Allow admins and commission to view/manage applications

## Step 2: Verify Environment Variables

Ensure these variables are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is required for the API route to bypass RLS policies.

## Step 3: Test the Workflow

### As a Student:

1. Log in with a student account
2. Navigate to "Apply" or "Candidate Registration"
3. Fill out the 6-step application form:
   - Personal Information (auto-filled from profile)
   - Position Selection (from active elections)
   - Eligibility Checklist
   - Document Upload
   - Payment
   - Review & Submit
4. Click "Submit Application"
5. Verify success message appears
6. Check redirect to student dashboard

### As Admin/Commission:

1. Log in with admin or commission account
2. Navigate to Election Management panel
3. Click on "Applications" tab
4. Verify new application appears in the list
5. Check notification bell for new notification
6. Click on application to view details

## Step 4: Verify Database

Check that the application was saved:

```sql
-- View all applications
SELECT 
  id,
  name,
  position,
  status,
  email,
  submitted_at
FROM candidates
ORDER BY submitted_at DESC;

-- Check notifications were created
SELECT 
  user_id,
  type,
  title,
  message,
  created_at
FROM notifications
WHERE type = 'application'
ORDER BY created_at DESC;
```

## Troubleshooting

### Application not appearing in admin panel

**Check**:
1. RLS policies are correctly set
2. Admin user has role 'admin' or 'commission' in user_profiles table
3. Candidates table has the submitted record

**Fix**:
```sql
-- Verify admin role
SELECT id, email, role FROM user_profiles WHERE role IN ('admin', 'commission');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'candidates';
```

### Submission fails with "Missing required fields"

**Check**:
1. User is logged in (userId in localStorage)
2. Election is active
3. Position is selected
4. Payment is completed (transactionId exists)

**Fix**: Ensure all required fields are filled before clicking submit.

### Notifications not created

**Check**:
1. Admin/commission users exist in user_profiles
2. Notifications table has correct RLS policies

**Fix**:
```sql
-- Verify notifications table exists
SELECT * FROM information_schema.tables WHERE table_name = 'notifications';

-- Check if notifications were inserted
SELECT COUNT(*) FROM notifications WHERE type = 'application';
```

### Duplicate application error

This is expected behavior. Students cannot apply twice for the same position in the same election.

**To allow resubmission**:
```sql
-- Delete previous application (use with caution)
DELETE FROM candidates 
WHERE user_id = 'user_uuid' 
  AND election_id = 'election_id' 
  AND position = 'position_name';
```

## API Endpoint

**URL**: `/api/candidate-application/submit`
**Method**: `POST`
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "userId": "uuid",
  "electionId": "election_id",
  "positionTitle": "President",
  "fullName": "John Doe",
  "studentId": "20230001",
  "email": "john.doe@cktutas.edu.gh",
  "phone": "+233 24 123 4567",
  "department": "Computer Science",
  "level": "300",
  "cgpa": "3.5",
  "transactionId": "TXN123456",
  "applicationFee": 150,
  "photoUrl": "photo.jpg",
  "manifestoUrl": "manifesto.pdf",
  "studentIdUrl": "student_id.jpg",
  "transcriptUrl": "transcript.pdf"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "123"
}
```

**Error Response** (400/500):
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Security Notes

- API route uses service role key to bypass RLS
- Students can only view their own applications
- Admins and commission can view all applications
- Applications default to "pending" status
- Payment verification via transaction ID

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all environment variables are set
4. Ensure database schema is up to date
5. Test with a fresh student account

## Status: Ready for Production ✅

All components are in place and tested. The system is ready to accept candidate applications.
