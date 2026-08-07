-- =====================================================
-- UPDATE CANDIDATES TABLE FOR APPLICATION SUBMISSIONS
-- =====================================================
-- This script adds necessary columns for candidate applications

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add user_id if it doesn't exist (for linking to user_profiles)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;

  -- Add full_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN full_name TEXT;
  END IF;

  -- Add student_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN student_id TEXT;
  END IF;

  -- Add phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN phone TEXT;
  END IF;

  -- Add transaction_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN transaction_id TEXT;
  END IF;

  -- Add application_fee if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'application_fee'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN application_fee NUMERIC(10, 2);
  END IF;

  -- Add photo_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN photo_url TEXT;
  END IF;

  -- Add manifesto_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'manifesto_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN manifesto_url TEXT;
  END IF;

  -- Add student_id_document_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'student_id_document_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN student_id_document_url TEXT;
  END IF;

  -- Add transcript_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'transcript_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN transcript_url TEXT;
  END IF;

  -- Ensure submitted_at exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Ensure updated_at exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add reviewed_by if it doesn't exist (for tracking who approved/rejected)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add reviewed_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  -- Add review_notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN review_notes TEXT;
  END IF;

END $$;

-- Update RLS policies for candidates table
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can view own applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "allow read" ON public.candidates;

-- Policy: Anyone can view approved candidates
CREATE POLICY "Anyone can view approved candidates"
  ON public.candidates
  FOR SELECT
  USING (status = 'approved');

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.candidates
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.candidates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins and commission can view all applications
CREATE POLICY "Admins and commission can view all applications"
  ON public.candidates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy: Admins and commission can update applications
CREATE POLICY "Admins and commission can update applications"
  ON public.candidates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
  ON public.candidates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the changes
SELECT 
  '✅ CANDIDATES TABLE UPDATED' as status,
  COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'candidates';

-- Show all columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'candidates'
ORDER BY ordinal_position;
