# Fix: Applications Not Showing in Commission Panel

## Problem Diagnosed ✅

The candidate application **IS saved in the database**, but **RLS (Row Level Security) policies** are preventing the Electoral Commission panel from reading it.

**Test Results:**
- ✅ Service Role (admin access): Sees 1 application
- ❌ Anon Key (user access): Sees 0 applications
- **Application Details:**
  - Name: Salomay Coffie
  - Student ID: 20220411032
  - Position: WOCOM
  - Status: pending
  - Election ID: bfe2d635-ef57-4e22-8d5a-2c9ee5a50d4a

## Root Cause

The `candidates` table has RLS enabled, but the policies don't allow commission/admin users to read candidate applications.

## Solution

Run this SQL script in your **Supabase SQL Editor**:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run This SQL

```sql
-- Fix RLS policies for candidates table to allow commission and admin to read applications

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Allow commission and admin to read all candidates" ON candidates;
DROP POLICY IF EXISTS "Commission can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Admin can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Users can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Authenticated users can read candidates" ON candidates;
DROP POLICY IF EXISTS "Users can view own applications" ON candidates;

-- Create policy: Users can view their own applications OR if they're admin/commission
CREATE POLICY "Users can view own or all if admin/commission"
ON candidates
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'commission')
  )
);

-- Allow commission and admin to update candidate status (approve/reject)
DROP POLICY IF EXISTS "Commission and admin can update candidates" ON candidates;
CREATE POLICY "Commission and admin can update candidates"
ON candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'commission')
  )
);

-- Allow students to insert their own applications
DROP POLICY IF EXISTS "Students can insert their applications" ON candidates;
CREATE POLICY "Students can insert their applications"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Grant necessary permissions
GRANT SELECT ON candidates TO authenticated;
GRANT INSERT ON candidates TO authenticated;
GRANT UPDATE ON candidates TO authenticated;

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'candidates'
ORDER BY policyname;
```

### Step 3: Verify the Fix

After running the SQL:

1. **Hard refresh your browser** (Ctrl + Shift + R)
2. Navigate to Electoral Commission Panel
3. Click on the "Applications" tab
4. You should now see the pending application from Salomay Coffie

## What This Fix Does

1. **Allows students** to view their own applications
2. **Allows commission and admin users** to view ALL applications
3. **Allows commission and admin** to update application status (approve/reject)
4. **Maintains security** by checking user roles from the `user_profiles` table

## Expected Result

After applying this fix:
- ✅ Commission panel will show all pending applications
- ✅ Admin panel will show all pending applications  
- ✅ Students can only see their own applications
- ✅ Approve/Reject buttons will work for commission/admin users

## Files Modified (Already Done)

- ✅ `src/app/electoral-commission-panel/components/ElectoralCommissionInteractive.tsx` - Fixed to use `created_at`
- ✅ `src/app/admin-system-control/election/components/ElectionManagementInteractive.tsx` - Fixed to use `created_at`

## Test Scripts Created

- `test-actual-submission.js` - Confirms the RLS issue
- `check-submitted-applications.js` - Verifies data exists in database
- `fix-candidates-read-access.sql` - The SQL fix to run in Supabase
