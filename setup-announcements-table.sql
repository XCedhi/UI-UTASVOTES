-- =====================================================
-- SETUP ANNOUNCEMENTS TABLE
-- =====================================================

-- Create announcements table if it doesn't exist
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

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read active announcements
CREATE POLICY "Anyone can view active announcements"
  ON public.announcements
  FOR SELECT
  USING (is_active = true);

-- Create policy for admins to manage announcements
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

-- Insert sample announcements
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

-- Verify announcements were created
SELECT 
  '✅ ANNOUNCEMENTS TABLE SETUP' as status,
  COUNT(*) as total_announcements,
  COUNT(*) FILTER (WHERE is_active = true) as active_announcements
FROM public.announcements;

-- Show sample announcements
SELECT 
  id,
  type,
  title,
  priority,
  is_active,
  published_at
FROM public.announcements
ORDER BY published_at DESC
LIMIT 5;
