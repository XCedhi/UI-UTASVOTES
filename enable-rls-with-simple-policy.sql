-- Clean RLS setup for candidates table
-- This script enables RLS with a simple policy that allows all authenticated users to read

-- Step 1: Drop ALL existing policies on candidates table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'candidates'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON candidates', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple read policy - all authenticated users can read
CREATE POLICY "authenticated_read_candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);

-- Step 4: Allow authenticated users to insert (for student applications)
CREATE POLICY "authenticated_insert_candidates"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 5: Allow authenticated users to update (for commission/admin to approve/reject)
CREATE POLICY "authenticated_update_candidates"
ON candidates
FOR UPDATE
TO authenticated
USING (true);

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON candidates TO authenticated;

-- Step 7: Verify the setup
SELECT 
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'candidates';

SELECT 
    policyname AS "Policy Name",
    cmd AS "Command"
FROM pg_policies 
WHERE tablename = 'candidates'
ORDER BY policyname;
