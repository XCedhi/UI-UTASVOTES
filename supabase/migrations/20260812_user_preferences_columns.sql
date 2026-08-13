-- ============================================================================
-- UTASVOTES — per-user preferences columns + grants
-- WHY: individualising student accounts means each student's notification
--      toggles must persist per-user. `user_preferences` only had
--      theme / email_notifications / language / timezone / preferences.
--      Add the remaining toggles the Settings page exposes.
--
-- This script is idempotent and safe to re-run. Run it in the
-- Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================================

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS election_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS result_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS campaign_updates BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure RLS remains on (it should already be enabled).
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Re-assert the per-user policies (idempotent).
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = auth.uid());

-- Table-level grants (matching the votes fix pattern).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT SELECT ON public.user_preferences TO anon;
