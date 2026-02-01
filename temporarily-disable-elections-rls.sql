-- TEMPORARY: Disable RLS on elections table to test if that's the issue
-- WARNING: This removes security! Only use for testing, then re-enable RLS

-- Disable RLS temporarily
ALTER TABLE elections DISABLE ROW LEVEL SECURITY;

-- You can now test creating an election
-- After testing, re-enable RLS by running: ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
