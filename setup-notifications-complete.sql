-- ============================================================
-- Complete Notifications Setup with Sample Data
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This:
-- 1. Migrates the notifications table schema
-- 2. Creates proper indexes
-- 3. Sets up RLS policies
-- 4. Inserts sample notifications for testing
-- ============================================================

-- STEP 1: MIGRATE TABLE SCHEMA
-- ============================================================

-- Add missing columns to notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add type check constraint
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('election', 'deadline', 'result', 'approval', 'system', 'application', 'comment', 'like', 'mention'));
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- STEP 2: CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- STEP 3: SET UP ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "allow read" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.notifications;

-- Create new policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage all notifications"
  ON public.notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STEP 4: INSERT SAMPLE NOTIFICATIONS
-- ============================================================

-- Get the student user ID
DO $$ 
DECLARE
  student_id UUID;
BEGIN
  -- Find student user
  SELECT id INTO student_id FROM public.user_profiles 
  WHERE email = 'student@cktutas.edu.gh' 
  LIMIT 1;

  IF student_id IS NOT NULL THEN
    -- Clear existing sample notifications for this user (optional)
    DELETE FROM public.notifications WHERE user_id = student_id AND created_at > NOW() - INTERVAL '1 month';

    -- Sample notification 1: Election announcement
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at)
    VALUES (
      student_id,
      'election',
      'New Election Announced',
      'Student Council 2026 Election has been scheduled. Voting opens on August 15, 2026.',
      '/student-dashboard',
      false,
      NOW() - INTERVAL '2 hours'
    );

    -- Sample notification 2: Application status
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at)
    VALUES (
      student_id,
      'application',
      'Application Submitted',
      'Your candidate application for WOCOM has been received and is under review.',
      '/profile',
      false,
      NOW() - INTERVAL '1 day'
    );

    -- Sample notification 3: Result available
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at)
    VALUES (
      student_id,
      'result',
      'Election Results Available',
      'Results for Student Council 2026 Election are now available. Click to view winners.',
      '/student-election-results',
      false,
      NOW() - INTERVAL '5 hours'
    );

    -- Sample notification 4: Deadline reminder
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at)
    VALUES (
      student_id,
      'deadline',
      'Voting Ends Soon',
      'Reminder: Voting for Student Council 2026 ends in 24 hours. Cast your vote now!',
      '/voting-interface',
      false,
      NOW() - INTERVAL '30 minutes'
    );

    -- Sample notification 5: System update (already read)
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at, read_at)
    VALUES (
      student_id,
      'system',
      'Platform Maintenance Complete',
      'UTASVotes platform maintenance has been completed. All systems are operational.',
      null,
      true,
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '3 days' + INTERVAL '10 minutes'
    );

    RAISE NOTICE 'Created 5 sample notifications for student@cktutas.edu.gh';
  ELSE
    RAISE NOTICE 'Student not found: student@cktutas.edu.gh';
  END IF;
END $$;

-- STEP 5: VERIFY SETUP
-- ============================================================

-- Show table structure
SELECT 
  '📋 Notifications Table Structure:' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Show created notifications
SELECT 
  '📬 Sample Notifications Created:' as info;

SELECT 
  COUNT(*) as total_notifications,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread,
  SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as read
FROM public.notifications;

-- Show recent notifications for student
SELECT 
  '📢 Recent Notifications for student@cktutas.edu.gh:' as info;

SELECT 
  n.id,
  n.type,
  n.title,
  n.is_read,
  n.created_at,
  up.email
FROM public.notifications n
JOIN public.user_profiles up ON n.user_id = up.id
WHERE up.email = 'student@cktutas.edu.gh'
ORDER BY n.created_at DESC
LIMIT 10;

-- Success message
SELECT '✅ Notifications setup complete! Sample data inserted.' as status;
