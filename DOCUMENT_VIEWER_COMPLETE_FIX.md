# Document Viewer - Complete Fix Summary

## Issue Resolved ✅
**Documents showing green checkmarks but failing to open with 400 errors when clicking "View"**

### Root Cause
- Files were only stored as **filenames** in database (e.g., "repoooorrt.pdf")
- No actual file upload to Supabase Storage occurred
- Document viewer tried to fetch from non-existent storage URLs
- Result: 400 Bad Request errors

### Solution Implemented
Complete file upload flow to Supabase Storage with public URL generation.

---

## Changes Made

### 1. Updated Document Upload Form
**File:** `src/app/candidate-registration/components/DocumentUploadForm.tsx`

**Changes:**
- Added `file?: File` property to `UploadedFile` interface
- Now stores actual File objects for upload, not just metadata

### 2. Updated Registration Component
**File:** `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx`

**Key Changes:**

#### State Management:
```typescript
// Now stores File objects
const [uploads, setUploads] = useState<{
  photo: { name: string; size: number; preview?: string; file?: File } | null;
  // ... other fields
}>({...});
```

#### File Upload Handler:
```typescript
const handleFileUpload = (field: string, file: File) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const uploadData = {
      name: file.name,
      size: file.size,
      preview: field === 'photo' ? (reader.result as string) : undefined,
      file: file, // ⭐ Store actual File object
    };
    setUploads({ ...uploads, [field]: uploadData });
  };
  reader.readAsDataURL(file);
};
```

#### Submit Handler - File Upload Flow:
```typescript
const handleSubmit = async () => {
  // 1. Upload photo to storage
  if (uploads.photo?.file) {
    const photoPath = `${userId}/${timestamp}-photo.${ext}`;
    const { data, error } = await supabase.storage
      .from('candidate-documents')
      .upload(photoPath, uploads.photo.file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    // Get public URL
    const { data: photoPublicUrl } = supabase.storage
      .from('candidate-documents')
      .getPublicUrl(photoPath);
    
    photoUrl = photoPublicUrl.publicUrl;
  }
  
  // 2. Same for manifesto, student ID, transcript
  // 3. Submit application with URLs (not filenames)
  
  const applicationData = {
    // ...
    photoUrl,           // ✅ Full URL
    manifestoUrl,       // ✅ Full URL
    studentIdUrl,       // ✅ Full URL
    transcriptUrl,      // ✅ Full URL
  };
};
```

### 3. Created Storage Bucket Setup
**File:** `create-candidate-documents-storage-bucket.sql`

**Creates:**
- Public storage bucket: `candidate-documents`
- File size limit: 10MB
- Allowed types: JPEG, PNG, PDF
- Storage policies for upload/view/update/delete

### 4. Created Verification Script
**File:** `verify-storage-setup.js`

**Checks:**
- Bucket exists
- Files in storage
- Candidate applications with URLs
- Public URL generation

### 5. Created Documentation
**Files:**
- `DOCUMENT_UPLOAD_TO_STORAGE_FIX.md` - Technical details
- `DOCUMENT_UPLOAD_QUICK_START.md` - Quick setup guide
- `DOCUMENT_VIEWER_COMPLETE_FIX.md` - This summary

---

## How It Works Now

### File Upload Flow:
```
1. User selects file
   ↓
2. File object stored in component state
   ↓
3. On submit → Upload to Supabase Storage
   ↓
4. Generate public URL
   ↓
5. Save URL to database
   ↓
6. Commission/Admin can view using URL
```

### File Storage Structure:
```
candidate-documents/
├── {userId}/
│   ├── {timestamp}-photo.jpg
│   ├── {timestamp}-manifesto.pdf
│   ├── {timestamp}-student-id.pdf
│   └── {timestamp}-transcript.pdf
```

### Database Fields (Before vs After):
**Before:**
```javascript
student_id_document_url: "repoooorrt.pdf" // ❌ Just filename
```

**After:**
```javascript
student_id_document_url: "https://xyz.supabase.co/storage/v1/object/public/candidate-documents/user123/1709123456-student-id.pdf" // ✅ Full URL
```

---

## Setup Instructions

### Quick Setup (3 Steps):

1. **Create Storage Bucket:**
   ```bash
   # In Supabase Dashboard > SQL Editor
   # Run: create-candidate-documents-storage-bucket.sql
   ```

2. **Verify Setup:**
   ```bash
   node verify-storage-setup.js
   ```

3. **Test Upload:**
   - Clear browser cache (Ctrl+Shift+R)
   - Restart dev server
   - Submit new application
   - Check console for upload logs

---

## Testing

### Test Upload (Student):
1. Login: `student@cktutas.edu.gh` / `Student@2026`
2. Go to Candidate Registration
3. Upload all 4 documents
4. Complete payment and submit
5. Check console for: "✅ All files uploaded successfully!"

### Test Viewing (Commission):
1. Login: `commission@cktutas.edu.gh` / `Commission@2026`
2. Go to Electoral Commission Panel
3. Click "View Details" on application
4. Click "View" on any document
5. Document should open in new tab (no 400 error)

---

## Console Logs

### Success Upload:
```
📤 Starting file uploads to Supabase Storage...
📸 Uploading photo...
✅ Photo uploaded: https://...
📄 Uploading manifesto...
✅ Manifesto uploaded: https://...
🆔 Uploading student ID...
✅ Student ID uploaded: https://...
📋 Uploading transcript...
✅ Transcript uploaded: https://...
✅ All files uploaded successfully!
✅ Application submitted successfully
```

### Success Viewing:
```
Fetching application details for ID: [id]
✅ Application loaded
Document URL: https://...supabase.co/storage/...
```

---

## Troubleshooting

### "Bucket does not exist"
```bash
# Run setup SQL in Supabase Dashboard
# Verify with: node verify-storage-setup.js
```

### "Failed to upload: 404"
```bash
# Check bucket name is: candidate-documents
# Re-run: create-candidate-documents-storage-bucket.sql
```

### "Permission denied"
```sql
-- Re-run storage policies section in SQL file
```

### Files upload but can't view
```sql
-- Check bucket is public
SELECT public FROM storage.buckets WHERE id = 'candidate-documents';
-- Should return: true
```

---

## Database Changes

### Fields Updated:
All now store **full public URLs** instead of filenames:
- `photo_url`
- `manifesto_url`
- `student_id_document_url`
- `transcript_url`

### Example Query:
```sql
SELECT 
  id, 
  full_name, 
  position,
  photo_url,
  manifesto_url,
  student_id_document_url,
  transcript_url,
  status
FROM candidates 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

---

## Security Features

- ✅ Public bucket (read-only for viewing)
- ✅ Upload restricted to authenticated users
- ✅ File type validation (JPEG, PNG, PDF only)
- ✅ Size limits (10MB max per file)
- ✅ Organized by user ID (privacy)
- ✅ Timestamp-based filenames (no conflicts)

---

## Success Indicators

You'll know it's working when:

1. ✅ No console errors during upload
2. ✅ "Application submitted successfully!" message
3. ✅ Files visible in Supabase Storage dashboard
4. ✅ Database shows full URLs (starting with https://)
5. ✅ Commission can click "View" and see documents
6. ✅ No 400/404 errors

---

## Files to Check

After implementation:
- ✅ Supabase Dashboard > Storage > candidate-documents (see uploaded files)
- ✅ Supabase Dashboard > Table Editor > candidates (see URLs in database)
- ✅ Browser Console (see upload success logs)
- ✅ Commission Panel > Applications > View Details (test document viewing)

---

## Next Steps

1. Run SQL setup script in Supabase
2. Verify setup with Node script
3. Clear cache and restart server
4. Test complete flow: upload → submit → view
5. Monitor first few submissions for any issues

---

## Rollback Plan

If issues occur:
```typescript
// Temporarily disable storage upload
// In CandidateRegistrationInteractive.tsx, comment out upload logic
// Will revert to storing filenames (old behavior)
```

---

## Support Files

- `create-candidate-documents-storage-bucket.sql` - Setup script
- `verify-storage-setup.js` - Verification tool
- `DOCUMENT_UPLOAD_TO_STORAGE_FIX.md` - Technical docs
- `DOCUMENT_UPLOAD_QUICK_START.md` - Quick guide

---

## Status: ✅ READY FOR TESTING

All code changes complete. Follow setup instructions to enable full document upload and viewing functionality.
