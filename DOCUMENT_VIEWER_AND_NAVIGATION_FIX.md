# Document Viewer and Application Details Navigation Fix

## Issues Fixed

### Issue 1: ID Card Shows Red "Canceled" Icon Despite File Upload
**Problem**: The ID card document showed a red X icon in the commission panel even though the file was uploaded during submission.

**Root Cause**: Field name mismatch between submission API and display component:
- Submission API saves as: `student_id_document_url`
- Display component checks for: `student_id_doc_url`

**Solution**: Updated the display component to check for both field names:
```typescript
idCard: !!(candidate.student_id_doc_url || candidate.student_id_document_url)
```

**Files Modified**:
- `src/app/electoral-commission-panel/components/ElectoralCommissionInteractive.tsx`
- `src/app/electoral-commission-panel/election-management/components/ElectionManagementInteractive.tsx`
- `src/app/admin-system-control/election/components/ElectionManagementInteractive.tsx`

---

### Issue 2: View Details Shows Hardcoded Data Instead of Actual Application
**Problem**: Clicking "View Details" on an application showed hardcoded placeholder data instead of fetching the actual application from the database.

**Root Cause**: The `ApplicationDetailsInteractive.tsx` component loaded mock data in the `useEffect` hook instead of fetching real data using the application ID from the URL parameters.

**Solution**: 
1. Created `fetchApplicationDetails()` function that:
   - Gets the application ID from URL params
   - Fetches candidate data from the `candidates` table
   - Transforms database fields to match component interface
   - Checks for both old and new field names for document URLs

2. Updated approve/reject handlers to:
   - Update database status (`approved` / `rejected`)
   - Store verification notes for rejections
   - Update local state to reflect changes
   - Provide user feedback

**Files Modified**:
- `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx`

**Database Fields Mapping**:
```typescript
{
  candidateName: candidate.name || candidate.full_name
  studentId: candidate.student_id
  email: candidate.email
  phone: candidate.phone
  position: candidate.position
  department: candidate.department
  level: candidate.level
  avatar: candidate.avatar || candidate.photo_url
  submittedAt: candidate.submitted_at || candidate.created_at
  
  documents: {
    idCard: {
      uploaded: !!(candidate.student_id_doc_url || candidate.student_id_document_url),
      url: candidate.student_id_doc_url || candidate.student_id_document_url,
      verified: candidate.status === 'approved'
    },
    transcript: {
      uploaded: !!candidate.transcript_url,
      url: candidate.transcript_url,
      verified: candidate.status === 'approved'
    },
    manifesto: {
      uploaded: !!(candidate.manifesto_url || candidate.manifesto_doc_url),
      url: candidate.manifesto_url || candidate.manifesto_doc_url,
      verified: candidate.status === 'approved'
    }
  },
  
  eligibilityStatus: candidate.status === 'pending' ? 'pending' : 
                     candidate.status === 'approved' ? 'verified' : 'rejected',
  paymentStatus: candidate.transaction_id ? 'completed' : 'pending',
  applicationFee: candidate.application_fee || 0,
  verificationNotes: candidate.verification_notes || ''
}
```

---

### Issue 3: Approve/Reject Buttons Only Updated Local State
**Problem**: Approve and reject actions only updated the UI but didn't persist to the database.

**Solution**: Updated both components to:
1. Update the database via Supabase
2. Store rejection reasons in `verification_notes` field
3. Update `status` field (`pending` → `approved` or `rejected`)
4. Update `updated_at` timestamp
5. Then update local state to reflect changes

**Files Modified**:
- `src/app/electoral-commission-panel/components/ElectoralCommissionInteractive.tsx`
- `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx`

---

## Testing

1. **Test ID Card Display**:
   - Submit a new application with ID card upload
   - Navigate to commission panel → Applications tab
   - Verify ID card shows green checkmark ✓ instead of red X

2. **Test View Details Navigation**:
   - Click "View Details" on any application
   - Verify it shows ACTUAL application data, not hardcoded data
   - Confirm all fields match the submitted application:
     - Candidate name, student ID, email
     - Position and department
     - Uploaded documents
     - Payment status

3. **Test Approve Action**:
   - On details page, click "Approve" button
   - Confirm approval in modal
   - Verify status changes to "Verified"
   - Go back to applications list
   - Verify application moves to "Approved Applications" section

4. **Test Reject Action**:
   - On details page, click "Reject" button
   - Enter rejection reason in modal
   - Verify status changes to "Rejected"
   - Verify rejection reason displays in "Verification Notes" section

5. **Test Quick Actions from List**:
   - In applications list, use "Approve" button
   - Verify database updates correctly
   - Try "Reject" button with reason prompt
   - Verify changes persist after page refresh

---

## Important Notes

### Field Name Variations
The system now checks for multiple field name variations due to schema evolution:
- `student_id_doc_url` OR `student_id_document_url`
- `name` OR `full_name`
- `photo_url` OR `avatar`
- `manifesto_url` OR `manifesto_doc_url`

This ensures backward compatibility if old records exist.

### Document Storage
Currently, document URLs are stored as file names. In production, these should be:
1. Uploaded to Supabase Storage
2. Public URLs stored in database
3. Retrieved for display in viewer modal

### Duplicate Application Check
The system prevents students from applying for the same position in the same election multiple times. This is working as intended.

---

## Current Status

✅ **ID card icon fixed** - Now shows correct status based on upload  
✅ **View Details navigation fixed** - Shows actual application data from database  
✅ **Approve/Reject actions fixed** - Updates persist to database  
✅ **Field name compatibility** - Handles both old and new field names  
✅ **User feedback** - Alert messages confirm successful operations  

---

## Next Steps (If Needed)

1. **Document Upload Integration**:
   - Implement actual file upload to Supabase Storage
   - Store public URLs in database
   - Add download functionality

2. **Email Notifications**:
   - Send email when application approved
   - Send email when application rejected (with reason)
   - Add notification system integration

3. **Audit Trail**:
   - Track who approved/rejected
   - Log timestamp of actions
   - Create approval history table

4. **Enhanced Document Viewer**:
   - PDF preview support
   - Zoom/pan functionality
   - Multi-document comparison view
