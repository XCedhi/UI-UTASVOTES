-- ============================================================
-- Migrate Notifications Table to New Schema
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- This updates the notifications table with user_id, type, action_url, is_read fields
-- ============================================================

-- Step 1: Drop the old notifications table if it doesn't have the new columns
-- Check if the new columns exist, if not, alter the table

-- First, let's check if user_id column exists, if not add it
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Add type column with proper check constraint
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system';

-- Update type check constraint
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check CHECK (type IN ('election', 'deadline', 'result', 'approval', 'system', 'comment', 'like', 'mention'));
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Add action_url column
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Add is_read column
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add read_at column
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Step 3: Drop old RLS policies and create new ones
DROP POLICY IF EXISTS "allow read" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Re-enable RLS if it's disabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage all notifications" ON public.notifications
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Step 4: Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Notifications table migrated successfully!' as message;
