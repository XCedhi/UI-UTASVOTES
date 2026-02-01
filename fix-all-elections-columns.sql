-- =====================================================
-- COMPREHENSIVE FIX FOR ELECTIONS TABLE
-- =====================================================
-- Makes all problematic columns nullable so API can work
-- =====================================================

-- Step 1: Check current schema
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'elections' 
ORDER BY ordinal_position;

-- Step 2: Make ALL potentially problematic columns nullable
-- This allows the API to insert without providing values for these columns

ALTER TABLE elections ALTER COLUMN title DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN type DROP NOT NULL;
ALTER TABLE elections ALTER COLUMN description DROP NOT NULL;

-- Step 3: Ensure the columns the API DOES use exist
ALTER TABLE elections ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS election_type TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS voting_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS voting_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE elections ADD COLUMN IF NOT EXISTS created_by UUID;

-- Step 4: Make the API columns NOT NULL (these are required)
ALTER TABLE elections ALTER COLUMN name SET NOT NULL;
ALTER TABLE elections ALTER COLUMN election_type SET NOT NULL;
ALTER TABLE elections ALTER COLUMN nomination_start SET NOT NULL;
ALTER TABLE elections ALTER COLUMN nomination_end SET NOT NULL;
ALTER TABLE elections ALTER COLUMN voting_start SET NOT NULL;
ALTER TABLE elections ALTER COLUMN voting_end SET NOT NULL;
ALTER TABLE elections ALTER COLUMN status SET NOT NULL;

-- Step 5: Add constraints
ALTER TABLE elections DROP CONSTRAINT IF EXISTS elections_election_type_check;
ALTER TABLE elections ADD CONSTRAINT elections_election_type_check 
  CHECK (election_type IN ('university-wide', 'departmental'));

ALTER TABLE elections DROP CONSTRAINT IF EXISTS elections_status_check;
ALTER TABLE elections ADD CONSTRAINT elections_status_check 
  CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'));

-- Step 6: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'elections' 
  AND column_name IN ('title', 'type', 'name', 'description', 'election_type', 'status')
ORDER BY ordinal_position;

-- Step 7: Test insert (should work now!)
INSERT INTO elections (
  name,
  description,
  election_type,
  nomination_start,
  nomination_end,
  voting_start,
  voting_end,
  status
) VALUES (
  'Test Election ' || NOW()::TEXT,
  'Testing schema fix',
  'university-wide',
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '21 days',
  'upcoming'
) RETURNING id, name, election_type, status;

-- Step 8: Clean up test data
DELETE FROM elections WHERE name LIKE 'Test Election%';

-- Success message
SELECT 'Schema fix completed successfully! You can now create elections.' as message;
