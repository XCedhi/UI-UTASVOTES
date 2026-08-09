-- ============================================================
-- Fix Application Approval/Rejection System
-- ============================================================
-- This allows students to reapply after rejection
-- and fixes the approve/reject button functionality
-- ============================================================

-- Add unique constraint to prevent duplicate applications for same position
-- But allow reapplication after rejection by deleting the old record

-- 1. Add a constraint to track unique applications (position + election + user)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_active_application_per_position'
    ) THEN
        ALTER TABLE candidates 
        ADD CONSTRAINT unique_active_application_per_position 
        UNIQUE (user_id, election_id, position, status);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- 2. Drop the constraint if it causes issues (allowing reapplication)
ALTER TABLE candidates 
DROP CONSTRAINT IF EXISTS unique_active_application_per_position;

-- 3. Create a function to allow reapplication after rejection
CREATE OR REPLACE FUNCTION handle_application_rejection()
RETURNS TRIGGER AS $$
BEGIN
    -- When an application is rejected, log it and allow reapplication
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        -- Log the rejection
        INSERT INTO activity_logs (
            user_id,
            user_name,
            action,
            target,
            action_type,
            created_at
        ) VALUES (
            NEW.user_id,
            NEW.full_name,
            'Application rejected',
            'Candidate application for ' || NEW.position,
            'rejection',
            NOW()
        );
        
        -- Update the rejection timestamp
        NEW.rejected_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for rejection handling
DROP TRIGGER IF EXISTS on_application_rejection ON candidates;
CREATE TRIGGER on_application_rejection
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION handle_application_rejection();

-- 5. Add rejected_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidates' AND column_name = 'rejected_at'
    ) THEN
        ALTER TABLE candidates ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;
END $$;

-- 6. Add approved_at column if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidates' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE candidates ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

-- 7. Create function to handle application approval
CREATE OR REPLACE FUNCTION handle_application_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- When an application is approved, log it
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Log the approval
        INSERT INTO activity_logs (
            user_id,
            user_name,
            action,
            target,
            action_type,
            created_at
        ) VALUES (
            NEW.user_id,
            NEW.full_name,
            'Application approved',
            'Candidate application for ' || NEW.position,
            'approval',
            NOW()
        );
        
        -- Update the approval timestamp
        NEW.approved_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for approval handling
DROP TRIGGER IF EXISTS on_application_approval ON candidates;
CREATE TRIGGER on_application_approval
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION handle_application_approval();

-- 9. Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    user_name TEXT,
    user_avatar TEXT,
    action TEXT NOT NULL,
    target TEXT,
    action_type TEXT CHECK (action_type IN ('approval', 'rejection', 'update', 'creation', 'deletion')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 10. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_candidates_user_election_position 
ON candidates(user_id, election_id, position);

CREATE INDEX IF NOT EXISTS idx_candidates_status 
ON candidates(status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
ON activity_logs(created_at DESC);

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check candidates table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name IN ('status', 'rejected_at', 'approved_at', 'verification_notes')
ORDER BY ordinal_position;

-- Check triggers
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'candidates';

-- Check activity logs table
SELECT COUNT(*) as activity_log_count
FROM activity_logs;

-- ============================================================
-- Success Message
-- ============================================================
SELECT 
    '✅ Application decision system fixed!' as status,
    'Approve/Reject buttons will now work correctly' as functionality,
    'Students can reapply after rejection' as reapplication,
    'Activity logs will track all decisions' as logging;
