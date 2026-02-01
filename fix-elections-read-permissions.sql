-- =====================================================
-- FIX READ PERMISSIONS FOR ELECTIONS AND POSITIONS
-- =====================================================
-- Allow everyone to read elections and positions
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view elections" ON elections;
DROP POLICY IF EXISTS "Anyone can view positions" ON positions;

-- Create new policies that allow everyone to read
CREATE POLICY "Anyone can view elections" ON elections
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view positions" ON positions
  FOR SELECT
  USING (true);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('elections', 'positions')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Test read access
SELECT 'Testing elections read...' as test;
SELECT id, name, title, election_type, status FROM elections LIMIT 5;

SELECT 'Testing positions read...' as test;
SELECT id, title, election_id, application_fee FROM positions LIMIT 5;

SELECT '✅ If you see data above, read permissions are working!' as result;
