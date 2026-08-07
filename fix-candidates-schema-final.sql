-- =====================================================
-- FIX CANDIDATES TABLE SCHEMA - FINAL
-- =====================================================
-- This ensures all required columns exist for application submission

-- First, check if the table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.candidates (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id),
      election_id BIGINT REFERENCES public.elections(id),
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
      manifesto TEXT,
      campaign_slogan TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Now add all the application-specific columns
DO $$ 
BEGIN
  -- Add full_name (required for applications)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN full_name TEXT;
  END IF;

  -- Add email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN email TEXT;
  END IF;

  -- Add student_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN student_id TEXT;
  END IF;

  -- Add phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN phone TEXT;
  END IF;

  -- Add department
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN department TEXT;
  END IF;

  -- Add level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'level'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN level TEXT;
  END IF;

  -- Add transaction_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN transaction_id TEXT;
  END IF;

  -- Add application_fee
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'application_fee'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN application_fee NUMERIC(10, 2);
  END IF;

  -- Add photo_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN photo_url TEXT;
  END IF;

  -- Add manifesto_url (different from manifesto text field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'manifesto_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN manifesto_url TEXT;
  END IF;

  -- Add student_id_document_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'student_id_document_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN student_id_document_url TEXT;
  END IF;

  -- Add transcript_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'transcript_url'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN transcript_url TEXT;
  END IF;

  -- Add submitted_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add reviewed_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add reviewed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  -- Add review_notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'candidates' 
    AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN review_notes TEXT;
  END IF;

END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view approved candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can view own applications" ON public.candidates;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can view all applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can update applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Service role full access" ON public.candidates;

-- Create new policies
CREATE POLICY "Anyone can view approved candidates"
  ON public.candidates
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own applications"
  ON public.candidates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
  ON public.candidates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

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

-- Verify the schema
SELECT 
  '✅ CANDIDATES TABLE READY' as status,
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
