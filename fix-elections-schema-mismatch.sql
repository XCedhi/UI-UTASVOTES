-- =====================================================
-- FIX ELECTIONS TABLE SCHEMA MISMATCH
-- =====================================================
-- The table has a 'title' column but API uses 'name'
-- We need to either rename or make title nullable
-- =====================================================

-- Step 1: Check current schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'elections' 
  AND column_name IN ('title', 'name', 'description')
ORDER BY ordinal_position;

-- Step 2: Make title nullable (if it exists and is NOT NULL)
ALTER TABLE elections 
ALTER COLUMN title DROP NOT NULL;

-- Step 2b: Make type nullable (if it exists and is NOT NULL)
ALTER TABLE elections 
ALTER COLUMN type DROP NOT NULL;

-- Step 3: Ensure name column exists and is NOT NULL
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE elections 
ALTER COLUMN name SET NOT NULL;

-- Step 4: If you want to migrate data from title to name:
-- UPDATE elections SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Step 5: Verify the fix
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'elections' 
  AND column_name IN ('title', 'name', 'description')
ORDER BY ordinal_position;

-- Step 6: Test insert (should work now)
-- This is just a test - you can delete this row after
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
  'Test Election Schema Fix',
  'Testing that name column works',
  'university-wide',
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '21 days',
  'upcoming'
) RETURNING id, name, description, status;

-- Clean up test row
DELETE FROM elections WHERE name = 'Test Election Schema Fix';
