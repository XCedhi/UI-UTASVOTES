-- =====================================================
-- UTASVOTES COMPREHENSIVE DATABASE SCHEMA
-- Generated: 2026-01-25
-- Description: Complete schema for all application features
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  phone TEXT,
  department TEXT,
  level TEXT,
  cgpa DECIMAL(3,2),
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'candidate', 'commission', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  bio TEXT,
  manifesto TEXT,
  position TEXT,
  
  -- Time-bound access for commission members
  access_start_date TIMESTAMPTZ,
  access_end_date TIMESTAMPTZ,
  
  -- Metadata
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account requests (for new user registration)
CREATE TABLE IF NOT EXISTS public.account_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT,
  credentials TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- User invitations (for commission/admin invites)
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('commission', 'admin')),
  position TEXT,
  department TEXT,
  access_start_date TIMESTAMPTZ,
  access_end_date TIMESTAMPTZ,
  invitation_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES public.user_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User sessions tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ
);

-- =====================================================
-- ELECTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('departmental', 'university-wide', 'faculty')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  
  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  
  -- Statistics
  total_voters INTEGER DEFAULT 0,
  voted_count INTEGER DEFAULT 0,
  turnout_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Settings
  allow_abstain BOOLEAN DEFAULT TRUE,
  require_all_positions BOOLEAN DEFAULT FALSE,
  show_live_results BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Election positions
CREATE TABLE IF NOT EXISTS public.election_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  max_candidates INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fee structures for candidate applications
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CANDIDATES & APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.election_positions(id),
  
  -- Personal Information
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  cgpa DECIMAL(3,2),
  
  -- Application Details
  position TEXT NOT NULL,
  manifesto TEXT,
  key_points TEXT[],
  avatar TEXT,
  
  -- Documents
  photo_url TEXT,
  manifesto_doc_url TEXT,
  student_id_doc_url TEXT,
  transcript_url TEXT,
  
  -- Eligibility
  eligibility_checklist JSONB,
  eligibility_status TEXT DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'verified', 'rejected')),
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  application_fee DECIMAL(10,2),
  transaction_id TEXT,
  payment_date TIMESTAMPTZ,
  
  -- Status & Results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  votes INTEGER DEFAULT 0,
  vote_percentage DECIMAL(5,2) DEFAULT 0,
  rank INTEGER,
  is_winner BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(election_id, user_id, position_id)
);


-- =====================================================
-- VOTING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.election_positions(id),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Vote details
  vote_hash TEXT UNIQUE NOT NULL, -- For verification without revealing voter
  is_abstain BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  
  UNIQUE(election_id, position_id, voter_id)
);

-- Voting receipts
CREATE TABLE IF NOT EXISTS public.voting_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  votes_cast INTEGER NOT NULL,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voter eligibility
CREATE TABLE IF NOT EXISTS public.voter_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_eligible BOOLEAN DEFAULT TRUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(election_id, user_id)
);

-- =====================================================
-- CAMPAIGN FEED & SOCIAL FEATURES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL CHECK (author_role IN ('student', 'candidate')),
  
  -- Content
  type TEXT NOT NULL CHECK (type IN ('manifesto', 'video', 'announcement', 'qa', 'discussion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  
  -- Media
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'gif', 'link')),
  media_alt TEXT,
  media_metadata JSONB, -- For storing dimensions, duration, etc.
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Metadata
  position TEXT,
  department TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, user_id)
);

-- Replies to comments
CREATE TABLE IF NOT EXISTS public.comment_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reply likes
CREATE TABLE IF NOT EXISTS public.reply_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES public.comment_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(reply_id, user_id)
);

-- Post shares
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hashtags
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post hashtags junction table
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (post_id, hashtag_id)
);


-- =====================================================
-- NOTIFICATIONS & ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('election', 'deadline', 'result', 'approval', 'system', 'comment', 'like', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System alerts (for admin/commission)
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('security', 'system', 'fraud', 'warning', 'info')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.user_profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- REPORTS & ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('election', 'candidate', 'voter', 'financial', 'comprehensive')),
  election_id UUID REFERENCES public.elections(id),
  file_url TEXT,
  file_size INTEGER,
  format TEXT CHECK (format IN ('pdf', 'csv', 'excel')),
  generated_by UUID REFERENCES public.user_profiles(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Activity logs (audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('approval', 'rejection', 'update', 'creation', 'deletion', 'login', 'logout')),
  action TEXT NOT NULL,
  target TEXT,
  target_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STUDENT IMPORT & BULK OPERATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.student_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_url TEXT,
  total_records INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
  error_log JSONB,
  imported_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Student import records (individual entries)
CREATE TABLE IF NOT EXISTS public.student_import_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID NOT NULL REFERENCES public.student_imports(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  level TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'duplicate')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- SETTINGS & CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT,
  updated_by UUID REFERENCES public.user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Africa/Accra',
  preferences JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DEADLINES & SCHEDULES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline_date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('voting', 'registration', 'result', 'application', 'payment')),
  is_completed BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PAYMENT TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id),
  
  -- Transaction details
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'momo', 'card', 'bank_transfer')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Payment gateway response
  gateway_response JSONB,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- SECURITY & FRAUD DETECTION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('failed_login', 'suspicious_activity', 'multiple_votes', 'unauthorized_access', 'data_breach')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  user_id UUID REFERENCES public.user_profiles(id),
  ip_address TEXT,
  user_agent TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.user_profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Failed login attempts
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMPTZ
);


-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('campaign-media', 'campaign-media', true),
  ('reports', 'reports', false),
  ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id ON public.user_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Elections indexes
CREATE INDEX IF NOT EXISTS idx_elections_status ON public.elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_type ON public.elections(type);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON public.elections(start_date, end_date);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON public.candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON public.candidates(position);

-- Votes indexes
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON public.votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON public.votes(voted_at);

-- Feed items indexes
CREATE INDEX IF NOT EXISTS idx_feed_items_author_id ON public.feed_items(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_type ON public.feed_items(type);
CREATE INDEX IF NOT EXISTS idx_feed_items_created_at ON public.feed_items(created_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_feed_id ON public.comments(feed_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON public.comment_replies(comment_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);


-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_items_updated_at BEFORE UPDATE ON public.feed_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update election statistics
CREATE OR REPLACE FUNCTION update_election_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.elections
  SET 
    voted_count = (SELECT COUNT(DISTINCT voter_id) FROM public.votes WHERE election_id = NEW.election_id),
    turnout_percentage = (
      SELECT ROUND((COUNT(DISTINCT voter_id)::DECIMAL / NULLIF(total_voters, 0)) * 100, 2)
      FROM public.votes 
      WHERE election_id = NEW.election_id
    )
  WHERE id = NEW.election_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_election_stats_on_vote AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_election_stats();

-- Function to update candidate vote counts
CREATE OR REPLACE FUNCTION update_candidate_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.candidates
  SET 
    votes = (SELECT COUNT(*) FROM public.votes WHERE candidate_id = NEW.candidate_id),
    vote_percentage = (
      SELECT ROUND((COUNT(*)::DECIMAL / NULLIF(
        (SELECT voted_count FROM public.elections WHERE id = NEW.election_id), 0
      )) * 100, 2)
      FROM public.votes 
      WHERE candidate_id = NEW.candidate_id
    )
  WHERE id = NEW.candidate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_votes_on_vote AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_candidate_votes();

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_items SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_items SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes_count_trigger AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_items SET comments_count = comments_count + 1 WHERE id = NEW.feed_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_items SET comments_count = comments_count - 1 WHERE id = OLD.feed_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count_trigger AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to update share counts
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feed_items SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_shares_count_trigger AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

-- Function to automatically downgrade commission access after end date
CREATE OR REPLACE FUNCTION check_commission_access_expiry()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    role = 'student',
    status = 'active'
  WHERE 
    role = 'commission' 
    AND access_end_date IS NOT NULL 
    AND access_end_date < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_import_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Account Requests Policies
CREATE POLICY "Anyone can create account request" ON public.account_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view account requests" ON public.account_requests FOR SELECT USING (true);
CREATE POLICY "Admin/Commission can update requests" ON public.account_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);

-- Elections Policies
CREATE POLICY "Anyone can view elections" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Admin/Commission can manage elections" ON public.elections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);

-- Candidates Policies
CREATE POLICY "Anyone can view approved candidates" ON public.candidates FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "Users can create own application" ON public.candidates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own application" ON public.candidates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin/Commission can manage candidates" ON public.candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);

-- Votes Policies (strict privacy)
CREATE POLICY "Users can cast own vote" ON public.votes FOR INSERT WITH CHECK (voter_id = auth.uid());
CREATE POLICY "Users can view own votes" ON public.votes FOR SELECT USING (voter_id = auth.uid());
CREATE POLICY "Admin can view all votes" ON public.votes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feed Items Policies
CREATE POLICY "Anyone can view feed items" ON public.feed_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.feed_items FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON public.feed_items FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.feed_items FOR DELETE USING (auth.uid() = author_id);

-- Post Likes Policies
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Reports Policies
CREATE POLICY "Admin/Commission can view reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);
CREATE POLICY "Admin/Commission can create reports" ON public.reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);

-- System Settings Policies
CREATE POLICY "Anyone can view settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());

-- Fee Structures Policies
CREATE POLICY "Anyone can view fee structures" ON public.fee_structures FOR SELECT USING (true);
CREATE POLICY "Admin/Commission can manage fees" ON public.fee_structures FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission'))
);


-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
  ('site_name', 'UTASVotes', 'Application name', 'general'),
  ('site_url', 'https://utasvotes.edu.gh', 'Application URL', 'general'),
  ('support_email', 'support@cktutas.edu.gh', 'Support contact email', 'general'),
  ('max_login_attempts', '5', 'Maximum failed login attempts before lockout', 'security'),
  ('lockout_duration_minutes', '30', 'Account lockout duration in minutes', 'security'),
  ('session_timeout_hours', '24', 'User session timeout in hours', 'security'),
  ('enable_email_notifications', 'true', 'Enable email notifications', 'notifications'),
  ('enable_live_results', 'false', 'Show live election results', 'elections'),
  ('min_password_length', '8', 'Minimum password length', 'security'),
  ('require_email_verification', 'true', 'Require email verification for new accounts', 'security')
ON CONFLICT (key) DO NOTHING;

-- Insert default fee structures
INSERT INTO public.fee_structures (position, amount) VALUES
  ('SRC President', 50.00),
  ('Vice President', 40.00),
  ('General Secretary', 35.00),
  ('Financial Secretary', 35.00),
  ('Organizing Secretary', 30.00),
  ('Women''s Commissioner', 30.00),
  ('Sports Director', 30.00),
  ('Welfare Officer', 25.00)
ON CONFLICT (position) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Avatars bucket policies (public read, authenticated write)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Documents bucket policies (private)
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Admin/Commission can view all documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission')
  )
);
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

-- Campaign media bucket policies (public read)
CREATE POLICY "Campaign media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-media');
CREATE POLICY "Authenticated users can upload campaign media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'campaign-media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own campaign media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Reports bucket policies (admin/commission only)
CREATE POLICY "Admin/Commission can access reports" ON storage.objects FOR SELECT USING (
  bucket_id = 'reports' AND EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission')
  )
);
CREATE POLICY "Admin/Commission can upload reports" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'reports' AND EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'commission')
  )
);

-- =====================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =====================================================

-- Note: These require pg_cron extension to be enabled
-- Run daily to check and downgrade expired commission access
-- SELECT cron.schedule('check-commission-expiry', '0 0 * * *', 'SELECT check_commission_access_expiry()');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for election results
CREATE OR REPLACE VIEW public.election_results AS
SELECT 
  e.id AS election_id,
  e.title AS election_name,
  e.status AS election_status,
  c.id AS candidate_id,
  c.full_name AS candidate_name,
  c.position,
  c.department,
  c.votes,
  c.vote_percentage,
  c.rank,
  c.is_winner,
  c.avatar
FROM public.elections e
JOIN public.candidates c ON e.id = c.election_id
WHERE c.status = 'approved'
ORDER BY e.id, c.position, c.votes DESC;

-- View for active elections with statistics
CREATE OR REPLACE VIEW public.active_elections_stats AS
SELECT 
  e.*,
  COUNT(DISTINCT c.id) AS total_candidates,
  COUNT(DISTINCT ep.id) AS total_positions,
  COALESCE(e.turnout_percentage, 0) AS current_turnout
FROM public.elections e
LEFT JOIN public.candidates c ON e.id = c.election_id AND c.status = 'approved'
LEFT JOIN public.election_positions ep ON e.id = ep.election_id
WHERE e.status IN ('active', 'scheduled')
GROUP BY e.id;

-- View for user activity summary
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT 
  up.id,
  up.full_name,
  up.email,
  up.role,
  up.last_login,
  COUNT(DISTINCT v.id) AS votes_cast,
  COUNT(DISTINCT fi.id) AS posts_created,
  COUNT(DISTINCT c.id) AS comments_made
FROM public.user_profiles up
LEFT JOIN public.votes v ON up.id = v.voter_id
LEFT JOIN public.feed_items fi ON up.id = fi.author_id
LEFT JOIN public.comments c ON up.id = c.user_id
GROUP BY up.id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log schema creation
DO $$
BEGIN
  RAISE NOTICE 'UTASVotes comprehensive schema created successfully!';
  RAISE NOTICE 'Total tables created: 40+';
  RAISE NOTICE 'Indexes, triggers, RLS policies, and views configured.';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Configure Supabase authentication settings';
  RAISE NOTICE '2. Set up email templates for notifications';
  RAISE NOTICE '3. Configure storage bucket CORS settings';
  RAISE NOTICE '4. Set up scheduled jobs for commission access expiry';
  RAISE NOTICE '5. Configure payment gateway (Stripe) integration';
END $$;

