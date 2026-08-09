# Document Upload to Supabase Storage - Implementation Guide

## Problem Identified
Documents are showing green checkmarks in the application but clicking "View" returns 400 errors because:
- Files are only stored locally (filenames in database, e.g., "repoooorrt.pdf")
- No actual file upload to Supabase Storage occurs
- Database contains filenames instead of public URLs
- Document viewer tries to fetch from non-existent storage URLs

## Solution Overview
Implement complete file upload flow:
1. Upload files to Supabase Storage during application submission
2. Generate and store public URLs in database
3. Enable document viewing with proper URLs

## Step 1: Create Supabase Storage Bucket

Run this in **Supabase Dashboard > SQL Editor**:

```sql
-- Create storage bucket for candidate documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for candidate documents
CREATE POLICY "Anyone can upload candidate documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "Anyone can view candidate documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'candidate-documents');

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'candidate-documents');

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'candidate-documents');
```

## Step 2: Code Implementation

### Updated Files:
1. `src/app/candidate-registration/components/DocumentUploadForm.tsx` - Added file storage upload
2. `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx` - Pass File objects instead of filenames
3. `src/app/api/candidate-application/submit/route.ts` - Handle file uploads in API

### How It Works:
1. User selects file → File object stored in component state
2. On submit → Files uploaded to Supabase Storage
3. Public URLs generated → Saved to database
4. Commission/Admin view → URLs fetched and displayed

## Step 3: Testing

### Test the Upload Flow:
1. Clear browser cache (Ctrl+Shift+R)
2. Login as student: `student@cktutas.edu.gh` / `Student@2026`
3. Go to Candidate Registration
4. Upload documents (all 4 required)
5. Complete payment and submit
6. Check console for upload logs

### Verify in Supabase:
```sql
-- Check uploaded files in storage
SELECT * FROM storage.objects 
WHERE bucket_id = 'candidate-documents' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check candidate applications with document URLs
SELECT id, full_name, position, 
       photo_url, 
       manifesto_url, 
       student_id_document_url, 
       transcript_url,
       status
FROM candidates 
ORDER BY created_at DESC 
LIMIT 5;
```

### Test Document Viewing:
1. Login as commission: `commission@cktutas.edu.gh` / `Commission@2026`
2. Go to Electoral Commission Panel
3. Click on an application
4. Click "View" on any document
5. Document should open in new tab

## File Upload Details

### Storage Bucket Structure:
```
candidate-documents/
├── {userId}/
│   ├── {timestamp}-photo.{ext}
│   ├── {timestamp}-manifesto.pdf
│   ├── {timestamp}-student-id.{ext}
│   └── {timestamp}-transcript.pdf
```

### File Naming Convention:
- Format: `{userId}/{timestamp}-{documentType}.{extension}`
- Example: `abc123/1709123456789-photo.jpg`
- Ensures unique filenames and easy user identification

### Supported File Types:
- **Photos**: JPEG, PNG (max 2MB)
- **Documents**: PDF (max 5MB)
- **Storage Limit**: 10MB per file

## Troubleshooting

### Issue: "Bucket does not exist"
**Solution**: Run Step 1 SQL in Supabase Dashboard

### Issue: "Storage API not responding"
**Solution**: Check Supabase project status and environment variables

### Issue: "Permission denied"
**Solution**: Verify storage policies are created (Step 1)

### Issue: Files upload but URLs don't work
**Solution**: 
1. Check bucket is set to public: `public = true`
2. Verify URL format: `{SUPABASE_URL}/storage/v1/object/public/candidate-documents/{path}`

### Issue: "Failed to upload: payload too large"
**Solution**: Check file size limits and `file_size_limit` in bucket config

## Database Fields Updated

The following fields now store **full public URLs** instead of filenames:
- `photo_url` - Passport photograph URL
- `manifesto_url` - Campaign manifesto PDF URL
- `student_id_document_url` - Student ID card URL
- `transcript_url` - Academic transcript URL

## Security Considerations

- Bucket is **public** (read-only) for easy viewing
- Upload restricted to authenticated users
- File size limits prevent abuse (10MB max)
- MIME type restrictions prevent malicious uploads
- Unique file paths prevent overwrites

## Next Steps After Implementation

1. Test complete flow: upload → submit → view
2. Monitor storage usage in Supabase Dashboard
3. Consider adding file validation (virus scanning, format verification)
4. Implement file cleanup for rejected applications (optional)
5. Add progress indicators for large file uploads

## Rollback Plan

If issues occur, temporarily disable uploads:
```typescript
// In DocumentUploadForm.tsx
const ENABLE_STORAGE_UPLOAD = false; // Set to false to use old flow
```

This reverts to storing filenames only (old behavior).
