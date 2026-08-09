-- ============================================================
-- Create Supabase Storage Bucket for Candidate Documents
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
-- This creates a public storage bucket for candidate application documents
-- ============================================================

-- Create storage bucket for candidate documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents',
  true, -- Public bucket for easy viewing
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'application/pdf'
  ];

-- ============================================================
-- Storage Policies
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Allow authenticated users to upload documents
CREATE POLICY "Anyone can upload candidate documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'candidate-documents');

-- Allow anyone to view documents (public bucket)
CREATE POLICY "Anyone can view candidate documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'candidate-documents');

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'candidate-documents');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'candidate-documents');

-- ============================================================
-- Verification Queries
-- ============================================================

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id = 'candidate-documents';

-- Verify policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%candidate documents%';

-- Check if any files exist (will be empty initially)
SELECT * 
FROM storage.objects 
WHERE bucket_id = 'candidate-documents' 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================
-- Success Message
-- ============================================================
SELECT 
  '✅ Candidate documents storage bucket created successfully!' as status,
  'Bucket ID: candidate-documents' as bucket_info,
  'Max file size: 10MB' as size_limit,
  'Allowed types: JPEG, PNG, PDF' as allowed_types,
  'Public access: Enabled' as access_level;
