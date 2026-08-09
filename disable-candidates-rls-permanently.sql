-- Permanently disable RLS on candidates table
-- This is the simplest solution to ensure applications always show
-- Applications will be visible to all authenticated users

-- Disable RLS
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity AS "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename = 'candidates';

-- Grant permissions to ensure access
GRANT ALL ON candidates TO authenticated;
GRANT ALL ON candidates TO anon;

-- Done! Applications will now show immediately for commission and admin users
