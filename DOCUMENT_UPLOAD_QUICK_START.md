# Document Upload Fix - Quick Start Guide

## Problem Fixed
✅ Documents now upload to Supabase Storage instead of just storing filenames
✅ Public URLs generated and saved to database
✅ Documents can be viewed by clicking "View" button
✅ All 4 documents supported: Photo, Manifesto, ID Card, Transcript

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Storage Bucket in Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste the content from: `create-candidate-documents-storage-bucket.sql`
4. Click **RUN** (or press F5)
5. Wait for success message

**Expected Output:**
```
✅ Candidate documents storage bucket created successfully!
```

### Step 2: Verify Setup

Run the verification script in your terminal:

```bash
node verify-storage-setup.js
```

**Expected Output:**
```
✅ Bucket "candidate-documents" exists!
✅ Found 0 files in storage (normal for new setup)
✅ Verification Complete!
```

### Step 3: Test Upload Flow

1. **Clear cache:** Press `Ctrl+Shift+R` in browser
2. **Restart server:** Stop and run `npm run dev` again
3. **Login as student:** `student@cktutas.edu.gh` / `Student@2026`
4. **Go to:** Candidate Registration
5. **Upload documents:** All 4 required (photo, manifesto, ID, transcript)
6. **Complete payment:** Use any transaction ID
7. **Submit application**
8. **Check console:** Look for "✅ All files uploaded successfully!"

---

## 📋 Testing Checklist

### As Student (Submitting Application):
- [ ] Upload all 4 documents
- [ ] See green checkmarks for each uploaded file
- [ ] Complete payment step
- [ ] Submit application
- [ ] See "Application submitted successfully!" message
- [ ] Check browser console for upload success logs

### As Commission (Viewing Application):
- [ ] Login as commission: `commission@cktutas.edu.gh` / `Commission@2026`
- [ ] Go to Electoral Commission Panel
- [ ] See submitted applications in the list
- [ ] All documents show green checkmarks (not red X)
- [ ] Click "View Details" on an application
- [ ] Click "View" button on any document
- [ ] Document opens in new tab (not 400 error)

---

## 🔍 Console Logs to Watch For

### During Upload (Student Side):
```
📤 Starting file uploads to Supabase Storage...
📸 Uploading photo...
✅ Photo uploaded: https://...supabase.co/storage/v1/object/public/candidate-documents/...
📄 Uploading manifesto...
✅ Manifesto uploaded: https://...
🆔 Uploading student ID...
✅ Student ID uploaded: https://...
📋 Uploading transcript...
✅ Transcript uploaded: https://...
✅ All files uploaded successfully!
📤 Submitting application data...
✅ Application submitted successfully
```

### During View (Commission Side):
```
Fetching application details for ID: [application-id]
✅ Application loaded
Document URLs:
  - Photo: https://...
  - Manifesto: https://...
  - Student ID: https://...
  - Transcript: https://...
```

---

## 🐛 Troubleshooting

### Issue: "Bucket does not exist"
**Solution:**
```bash
# Run Step 1 again - create the bucket
# Check in Supabase Dashboard > Storage
```

### Issue: "Failed to upload: 404"
**Symptoms:** Console shows "bucket not found" or 404 errors
**Solution:**
1. Verify bucket exists: Run `node verify-storage-setup.js`
2. Check bucket name is exactly: `candidate-documents`
3. Re-run SQL script from Step 1

### Issue: "Failed to upload: 413 Payload Too Large"
**Symptoms:** Large files fail to upload
**Solution:**
- Check file sizes: Photo (2MB max), Documents (5MB max)
- Compress files before upload
- Or increase `file_size_limit` in bucket config

### Issue: "Permission denied"
**Symptoms:** 403 error when uploading
**Solution:**
```sql
-- Re-run storage policies from the SQL file
-- Check in Supabase Dashboard > Storage > Policies
```

### Issue: Files upload but URLs return 400
**Symptoms:** Upload succeeds but viewing fails
**Solution:**
1. Check bucket is public: `public = true`
2. Verify URL format in database (should start with `https://`)
3. Test URL manually in browser

### Issue: Old applications still show filenames
**Symptoms:** Previous applications don't have URLs
**Solution:**
- This is expected - only NEW applications will have URLs
- Old applications need to be re-submitted
- Or manually migrate data (advanced)

---

## 📁 Files Modified

### Updated Components:
1. `src/app/candidate-registration/components/DocumentUploadForm.tsx`
   - Added `file?: File` to UploadedFile interface
   
2. `src/app/candidate-registration/components/CandidateRegistrationInteractive.tsx`
   - Store actual File objects in state
   - Upload files to Supabase Storage in `handleSubmit()`
   - Generate public URLs before API submission

### New Files Created:
1. `create-candidate-documents-storage-bucket.sql` - SQL setup script
2. `verify-storage-setup.js` - Verification script
3. `DOCUMENT_UPLOAD_TO_STORAGE_FIX.md` - Detailed documentation
4. `DOCUMENT_UPLOAD_QUICK_START.md` - This file

---

## 🎯 Expected Behavior

### Before Fix:
- ❌ Documents: Only filenames stored (e.g., "repoooorrt.pdf")
- ❌ Database: `student_id_document_url: "repoooorrt.pdf"`
- ❌ View Button: 400 error when clicked
- ❌ Commission: Cannot view uploaded documents

### After Fix:
- ✅ Documents: Uploaded to Supabase Storage
- ✅ Database: `student_id_document_url: "https://...supabase.co/storage/v1/object/public/..."`
- ✅ View Button: Opens document in new tab
- ✅ Commission: Can view all documents properly

---

## 📊 Storage Structure

Files are organized by user:
```
candidate-documents/
├── user-id-1/
│   ├── 1709123456789-photo.jpg
│   ├── 1709123456790-manifesto.pdf
│   ├── 1709123456791-student-id.pdf
│   └── 1709123456792-transcript.pdf
├── user-id-2/
│   └── ...
```

**Benefits:**
- Easy to find files by user
- Timestamp prevents filename conflicts
- Clean organization for storage management

---

## 🔐 Security

- ✅ **Public bucket** for easy viewing by commission/admin
- ✅ **Upload restricted** to authenticated users
- ✅ **File type validation** (JPEG, PNG, PDF only)
- ✅ **Size limits** prevent abuse (10MB max)
- ✅ **URL-based access** (no database queries needed for viewing)

---

## ✨ Success Criteria

You'll know it's working when:

1. ✅ No console errors during upload
2. ✅ Success message after application submission
3. ✅ Files visible in Supabase Storage (Dashboard > Storage > candidate-documents)
4. ✅ Database shows full URLs (not just filenames)
5. ✅ Commission users can click "View" and see documents
6. ✅ No 400 or 404 errors when viewing documents

---

## 🎉 You're Done!

The document upload system is now fully functional. Applications submitted after this fix will have proper document storage and viewing capabilities.

For questions or issues, check:
- Console logs for detailed error messages
- Supabase Dashboard > Storage for uploaded files
- Database `candidates` table for stored URLs
- `DOCUMENT_UPLOAD_TO_STORAGE_FIX.md` for detailed technical docs
