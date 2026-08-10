-- ============================================================================
-- UTASVOTES — votes permissions + live-results fix
-- WHY: the `votes` table was created (phase 0) WITHOUT table-level GRANTs.
--      As a result PostgREST returns "permission denied for table votes"
--      (SQLSTATE 42501) for EVERY role — including service_role — so:
--        * /api/vote cannot INSERT ballots  -> votes are never recorded
--        * no page can count votes          -> results always show 0
--        * the "already voted" check in ElectionContext silently fails
--
-- This script is idempotent and safe to re-run. Run it in the
-- Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================================

-- 1) Ensure roles can use the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2) Table-level grants on votes.
--    - service_role: full CRUD (the voting API + results API run with this key).
--    - authenticated: SELECT (own-vote check, counting) + INSERT (RLS applies).
--    - anon: SELECT only (own-vote check for logged-out reads, never writes).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO service_role;
GRANT SELECT, INSERT ON public.votes TO authenticated;
GRANT SELECT ON public.votes TO anon;

-- 3) Re-assert RLS and the vote policies (idempotent).
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own votes" ON public.votes;
CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  USING (auth.uid() = voter_id);

DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
CREATE POLICY "Users can insert own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- 4) Ensure the denormalized counter columns used by results pages exist.
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS votes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS voted_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS total_voters INTEGER NOT NULL DEFAULT 0;

-- 5) Ensure the counter RPCs exist (identical signatures to phase 0) and are
--    executable by the service role and authenticated users.
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

GRANT EXECUTE ON FUNCTION public.increment_candidate_votes(UUID) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_election_voted_count(UUID) TO service_role, authenticated;

-- 6) Repair the AFTER INSERT vote triggers created by schema_security_fixes.sql.
--    update_election_stats() queries `COUNT(DISTINCT user_id) FROM public.votes`,
--    but the column is named `voter_id`, so EVERY vote insert failed with
--    `column "user_id" does not exist` (Postgres 42703) and the whole insert
--    was rolled back. /api/vote already maintains candidates.votes and
--    elections.voted_count via the RPCs above, so these triggers are dropped:
--    (a) unblocks inserts, (b) prevents double counting.
DROP TRIGGER IF EXISTS update_election_stats_trigger ON public.votes;
DROP TRIGGER IF EXISTS update_candidate_votes_trigger ON public.votes;

-- Defensive repair: correct the function to the real column so any future
-- re-run of schema_security_fixes.sql (which recreates the triggers) neither
-- fails nor miscounts if those triggers are re-enabled.
CREATE OR REPLACE FUNCTION update_election_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;
