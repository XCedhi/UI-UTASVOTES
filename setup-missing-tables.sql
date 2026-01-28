-- =====================================================
-- SETUP MISSING TABLES FOR LOGIN PAGE
-- =====================================================
-- This script creates the tables needed for the login page components

-- 1. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('election', 'deadline', 'result', 'system', 'fee_update', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active announcements
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements"
  ON public.announcements
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 2. ELECTIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.elections (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add election_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'elections' 
    AND column_name = 'election_type'
  ) THEN
    ALTER TABLE public.elections 
    ADD COLUMN election_type TEXT NOT NULL DEFAULT 'general' 
    CHECK (election_type IN ('general', 'departmental', 'faculty'));
  END IF;
END $$;

-- Enable RLS for elections
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view elections
DROP POLICY IF EXISTS "Anyone can view elections" ON public.elections;
CREATE POLICY "Anyone can view elections"
  ON public.elections
  FOR SELECT
  USING (true);

-- Policy: Admins and commission can manage elections
DROP POLICY IF EXISTS "Admins and commission can manage elections" ON public.elections;
CREATE POLICY "Admins and commission can manage elections"
  ON public.elections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- 3. CANDIDATES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.candidates (
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

-- Enable RLS for candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved candidates
DROP POLICY IF EXISTS "Anyone can view approved candidates" ON public.candidates;
CREATE POLICY "Anyone can view approved candidates"
  ON public.candidates
  FOR SELECT
  USING (status = 'approved');

-- Policy: Users can view their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.candidates;
CREATE POLICY "Users can view own applications"
  ON public.candidates
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins and commission can manage candidates
DROP POLICY IF EXISTS "Admins and commission can manage candidates" ON public.candidates;
CREATE POLICY "Admins and commission can manage candidates"
  ON public.candidates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample announcements
INSERT INTO public.announcements (type, title, message, priority, is_active, published_at) VALUES
  (
    'system',
    'Welcome to UTASVotes',
    'The digital electoral system for UTAS is now live! Students can now participate in elections remotely.',
    'high',
    true,
    NOW()
  ),
  (
    'election',
    'Student Union Elections 2026',
    'Nominations are now open for the 2026 Student Union Elections. Visit the candidate registration page to submit your application.',
    'high',
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    'deadline',
    'Application Deadline Approaching',
    'Candidate applications close on February 15, 2026. Make sure to submit all required documents before the deadline.',
    'medium',
    true,
    NOW() - INTERVAL '2 days'
  ),
  (
    'fee_update',
    'Application Fee Structure',
    'The application fee for presidential candidates is GHS 50, and GHS 30 for other positions. Payment can be made via the integrated payment gateway.',
    'low',
    true,
    NOW() - INTERVAL '3 days'
  ),
  (
    'general',
    'Campaign Guidelines Released',
    'Please review the campaign guidelines in the Election Guidelines section. All candidates must adhere to these rules.',
    'medium',
    true,
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT DO NOTHING;

-- Sample election
DO $$
BEGIN
  -- Check if election_type column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'elections' 
    AND column_name = 'election_type'
  ) THEN
    -- Insert with election_type
    INSERT INTO public.elections (title, description, status, start_date, end_date, election_type) VALUES
      (
        'Student Union Elections 2026',
        'Annual elections for Student Union Executive positions including President, Vice President, Secretary, and other key roles.',
        'upcoming',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '14 days',
        'general'
      )
    ON CONFLICT DO NOTHING;
  ELSE
    -- Insert without election_type
    INSERT INTO public.elections (title, description, status, start_date, end_date) VALUES
      (
        'Student Union Elections 2026',
        'Annual elections for Student Union Executive positions including President, Vice President, Secretary, and other key roles.',
        'upcoming',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '14 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check announcements
SELECT 
  '✅ ANNOUNCEMENTS' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_active = true) as active_records
FROM public.announcements;

-- Check elections
SELECT 
  '✅ ELECTIONS' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM public.elections;

-- Check candidates
SELECT 
  '✅ CANDIDATES' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_records
FROM public.candidates;

-- Check user_profiles
SELECT 
  '✅ USER_PROFILES' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM public.user_profiles;

-- Final summary
SELECT 
  '🎉 SETUP COMPLETE' as status,
  'Login page should now display data correctly' as message;
