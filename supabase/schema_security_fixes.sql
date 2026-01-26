-- =====================================================
-- SECURITY FIXES FOR UTASVOTES DATABASE SCHEMA
-- =====================================================
-- This file contains fixes for security warnings from Supabase linter
-- Run this AFTER running schema_comprehensive.sql

-- =====================================================
-- FIX 1: Function Search Path Mutable
-- =====================================================
-- Add SECURITY DEFINER and SET search_path to all functions

-- Drop existing functions first
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_election_stats() CASCADE;
DROP FUNCTION IF EXISTS update_candidate_votes() CASCADE;
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comments_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_shares_count() CASCADE;
DROP FUNCTION IF EXISTS check_commission_access_expiry() CASCADE;

-- Recreate with security fixes

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to update election statistics
CREATE OR REPLACE FUNCTION update_election_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.elections
  SET 
    voted_count = (SELECT COUNT(DISTINCT user_id) FROM public.votes WHERE election_id = NEW.election_id),
    turnout_percentage = (
      SELECT ROUND((COUNT(DISTINCT user_id)::DECIMAL / NULLIF(total_voters, 0)) * 100, 2)
      FROM public.votes 
      WHERE election_id = NEW.election_id
    )
  WHERE id = NEW.election_id;
  
  RETURN NEW;
END;
$$;

-- Function to update candidate vote counts
CREATE OR REPLACE FUNCTION update_candidate_votes()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.candidates
  SET 
    votes = (SELECT COUNT(*) FROM public.votes WHERE candidate_id = NEW.candidate_id),
    vote_percentage = (
      SELECT ROUND((COUNT(*)::DECIMAL / NULLIF(
        (SELECT COUNT(*) FROM public.votes WHERE election_id = NEW.election_id), 0
      )) * 100, 2)
      FROM public.votes 
      WHERE candidate_id = NEW.candidate_id
    )
  WHERE id = NEW.candidate_id;
  
  RETURN NEW;
END;
$$;

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.feed_items
  SET likes_count = (SELECT COUNT(*) FROM public.post_likes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id))
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.feed_items
  SET comments_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = COALESCE(NEW.post_id, OLD.post_id))
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update share counts
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.feed_items
  SET shares_count = shares_count + 1
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$;

-- Function to automatically downgrade commission access after end date
CREATE OR REPLACE FUNCTION check_commission_access_expiry()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_profiles
  SET role = 'student'
  WHERE role = 'commission' 
    AND access_end_date IS NOT NULL 
    AND access_end_date < NOW();
END;
$$;

-- Recreate all triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_items_updated_at BEFORE UPDATE ON public.feed_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_election_stats_trigger AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_election_stats();

CREATE TRIGGER update_candidate_votes_trigger AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_candidate_votes();

CREATE TRIGGER update_post_likes_count_trigger AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_post_comments_count_trigger AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER update_post_shares_count_trigger AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

-- =====================================================
-- FIX 2: RLS Policy Always True - Account Requests
-- =====================================================
-- Replace overly permissive policies with proper restrictions

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create account request" ON public.account_requests;
DROP POLICY IF EXISTS "Anyone can view account requests" ON public.account_requests;

-- Create more restrictive policies
-- Allow unauthenticated users to create account requests (for registration)
CREATE POLICY "Unauthenticated can create account request" 
  ON public.account_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NULL);

-- Only authenticated users with admin/commission role can view all requests
CREATE POLICY "Admin/Commission can view all requests" 
  ON public.account_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'commission')
    )
  );

-- Users can view their own pending request
CREATE POLICY "Users can view own request" 
  ON public.account_requests 
  FOR SELECT 
  USING (email = auth.jwt()->>'email');

-- =====================================================
-- FIX 3: RLS Policy Always True - Notifications
-- =====================================================
-- Replace overly permissive insert policy

-- Drop existing policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create more restrictive policy
-- Only admin/commission can create notifications
CREATE POLICY "Admin/Commission can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'commission')
    )
  );

-- Allow system-level inserts via service role (not through RLS)
-- This is handled by using the service_role key in backend code

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the fixes were applied

-- Check functions have search_path set
-- SELECT 
--   p.proname as function_name,
--   pg_get_function_identity_arguments(p.oid) as arguments,
--   p.prosecdef as is_security_definer,
--   p.proconfig as config_settings
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname IN (
--   'update_updated_at_column',
--   'update_election_stats',
--   'update_candidate_votes',
--   'update_post_likes_count',
--   'update_post_comments_count',
--   'update_post_shares_count',
--   'check_commission_access_expiry'
-- );

-- Check RLS policies
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE tablename IN ('account_requests', 'notifications')
-- ORDER BY tablename, policyname;
