-- ============================================================
-- UTASVOTES — Phase 0 Migration
-- Election column standardization, student import columns,
-- votes table with duplicate protection, and vote counters.
--
-- Safe to run multiple times (uses IF NOT EXISTS / idempotent).
-- Run in Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ELECTIONS — ensure canonical column names exist
--    Canonical: name, election_type, voting_start, voting_end
--    Legacy:    title, type,         start_date,  end_date
-- ------------------------------------------------------------
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS election_type TEXT;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS voting_start TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS voting_end TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS total_voters INTEGER DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS voted_count INTEGER DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS turnout_percentage DECIMAL(5,2) DEFAULT 0;

-- Certification / results delivery columns
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS certified_at TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS certified_by UUID;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS results_sent_at TIMESTAMPTZ;

-- Backfill canonical columns from legacy columns where missing
UPDATE public.elections
SET name = title
WHERE (name IS NULL OR name = '') AND title IS NOT NULL;

UPDATE public.elections
SET election_type = type
WHERE (election_type IS NULL OR election_type = '') AND type IS NOT NULL;

UPDATE public.elections
SET voting_start = start_date
WHERE voting_start IS NULL AND start_date IS NOT NULL;

UPDATE public.elections
SET voting_end = end_date
WHERE voting_end IS NULL AND end_date IS NOT NULL;

-- Index for status/dates queries
CREATE INDEX IF NOT EXISTS idx_elections_status ON public.elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_voting_start ON public.elections(voting_start);
CREATE INDEX IF NOT EXISTS idx_elections_voting_end ON public.elections(voting_end);

-- ------------------------------------------------------------
-- 2. USER_PROFILES — student import columns
-- ------------------------------------------------------------
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_requires_password_change
  ON public.user_profiles(requires_password_change);
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id
  ON public.user_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON public.user_profiles(email);


-- ------------------------------------------------------------
-- 3. VOTES — one vote per voter per election
--    The UNIQUE(election_id, voter_id) constraint is the
--    authoritative duplicate guard. A second attempt raises
--    error code 23505 (unique_violation) which the API maps to
--    a "you have already voted" response.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  vote_hash TEXT UNIQUE NOT NULL,
  is_abstain BOOLEAN DEFAULT FALSE,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(election_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_election_id ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON public.votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON public.votes(voted_at);

-- RLS for votes (API uses the service role key which bypasses RLS;
-- these policies make direct client access safe too)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own votes" ON public.votes;
CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
CREATE POLICY "Users can insert own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- IMPORTANT: table-level GRANTs are REQUIRED for the voting/results flow.
-- Without them PostgREST returns "permission denied for table votes" (42501)
-- for every role — including service_role — so /api/vote cannot record ballots
-- and no results page can count them. service_role bypasses RLS, so granting
-- it full CRUD here is safe; anon/authenticated stay protected by the policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO service_role;
GRANT SELECT, INSERT ON public.votes TO authenticated;
GRANT SELECT ON public.votes TO anon;

-- ------------------------------------------------------------
-- 4. VOTE COUNTER FUNCTIONS (atomic increments)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_candidate_votes(p_candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.candidates
  SET votes = COALESCE(votes, 0) + 1
  WHERE id = p_candidate_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_election_voted_count(p_election_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.elections
  SET voted_count = COALESCE(voted_count, 0) + 1,
      turnout_percentage = CASE
        WHEN COALESCE(total_voters, 0) > 0
        THEN ROUND((COALESCE(voted_count, 0) + 1)::numeric / total_voters::numeric * 100, 2)
        ELSE 0
      END
  WHERE id = p_election_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_candidate_votes(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_election_voted_count(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_candidate_votes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_election_voted_count(UUID) TO authenticated;
