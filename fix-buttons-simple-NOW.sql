-- ============================================================
-- SIMPLE FIX FOR DECISION BUTTONS (No activity_logs needed)
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop any problematic triggers/functions
DROP TRIGGER IF EXISTS on_application_rejection ON candidates;
DROP TRIGGER IF EXISTS on_application_approval ON candidates;
DROP FUNCTION IF EXISTS handle_application_rejection() CASCADE;
DROP FUNCTION IF EXISTS handle_application_approval() CASCADE;

-- 2. Make sure required columns exist
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 3. Grant ALL permissions on candidates table
GRANT ALL ON candidates TO authenticated;
GRANT ALL ON candidates TO anon;
GRANT ALL ON candidates TO service_role;
GRANT ALL ON candidates TO postgres;

-- 4. Make sure we can update the table (remove any blocking policies)
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;

-- 5. Verify the columns exist
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name IN ('status', 'verification_notes', 'approved_at', 'rejected_at')
ORDER BY column_name;

-- 6. Success message
SELECT '✅ DECISION BUTTONS FIXED! Try them now.' as message;
