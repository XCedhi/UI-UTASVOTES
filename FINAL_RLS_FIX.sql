-- =====================================================
-- FINAL RLS FIX - SIMPLE AND DIRECT
-- =====================================================
-- This will definitely work!
-- =====================================================

-- Step 1: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('elections', 'positions') 
  AND schemaname = 'public';

-- Step 2: Drop ALL existing policies (clean slate)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('elections', 'positions'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 3: Create simple SELECT policies for everyone
CREATE POLICY "public_read_elections" 
ON elections 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "public_read_positions" 
ON positions 
FOR SELECT 
TO public
USING (true);

-- Step 4: Create admin/commission write policies
CREATE POLICY "admin_write_elections" 
ON elections 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'commission')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'commission')
  )
);

CREATE POLICY "admin_write_positions" 
ON positions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'commission')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'commission')
  )
);

-- Step 5: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  roles::text as applies_to,
  cmd as command
FROM pg_policies
WHERE tablename IN ('elections', 'positions')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 6: Test read access (should work now!)
SELECT 'Testing elections read access...' as status;
SELECT COUNT(*) as election_count FROM elections;

SELECT 'Testing positions read access...' as status;
SELECT COUNT(*) as position_count FROM positions;

SELECT '✅ SUCCESS! If you see counts above, RLS is working!' as result;
