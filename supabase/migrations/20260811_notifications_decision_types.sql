-- ============================================================
-- Extend notifications.type to support per-student application
-- decision notifications (approved / rejected).
--
-- Run this in Supabase Dashboard → SQL Editor.
-- It is idempotent and reversible (drop constraint + re-add).
-- ============================================================

-- 1. Relax the type CHECK constraint to accept the new decision types
--    while preserving every type the live table already uses.
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'election',
    'deadline',
    'result',
    'approval',
    'application',
    'application_approved',
    'application_rejected',
    'comment',
    'like',
    'mention',
    'system'
  ));

COMMENT ON CONSTRAINT notifications_type_check ON public.notifications IS
  'Allowed notification types. application_approved / application_rejected are per-student candidate application decisions.';

-- 2. Make sure the per-user indexes exist (fast bell / notifications page).
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Verify the constraint is in place.
SELECT
  conname,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.notifications'::regclass
  AND contype = 'c';
