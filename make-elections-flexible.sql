-- =====================================================
-- SIMPLE FIX: Make all old columns nullable
-- =====================================================
-- This allows the API to work with the new column names
-- without breaking existing data
-- =====================================================

-- Make ALL potentially conflicting columns nullable
ALTER TABLE elections ALTER COLUMN title DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN type DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN description DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN end_date DROP NOT NULL;

-- Add the new columns if they don't exist
ALTER TABLE elections ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS election_type TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS voting_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS voting_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE elections ADD COLUMN IF NOT EXISTS created_by UUID;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'elections' 
ORDER BY ordinal_position;

-- Success message
SELECT 'All columns are now flexible. Try creating an election!' as message;
