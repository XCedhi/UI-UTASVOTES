-- TEMPORARY: Disable RLS on candidates table to test if applications show
-- This will allow commission panel to see applications immediately
-- WARNING: This removes security temporarily - use only for testing

ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'candidates';
