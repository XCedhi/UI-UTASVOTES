-- =====================================================
-- FINAL FIX FOR ELECTIONS TABLE PERMISSIONS
-- =====================================================
-- This script ensures the service_role can bypass RLS
-- and that all necessary permissions are granted
-- =====================================================

-- Step 1: Ensure RLS is enabled (required for Supabase)
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "service_role_bypass_elections" ON elections;
DROP POLICY IF EXISTS "Anyone can view elections" ON elections;
DROP POLICY IF EXISTS "Admins can manage elections" ON elections;
DROP POLICY IF EXISTS "Commission can manage elections" ON elections;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON elections;
DROP POLICY IF EXISTS "Enable read access for all users" ON elections;

DROP POLICY IF EXISTS "service_role_bypass_positions" ON positions;
DROP POLICY IF EXISTS "Anyone can view positions" ON positions;
DROP POLICY IF EXISTS "Admins and commission can manage positions" ON positions;

DROP POLICY IF EXISTS "service_role_bypass_notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

-- Step 3: Create bypass policies for service_role
-- These policies allow service_role to do ANYTHING (bypasses all checks)
CREATE POLICY "service_role_bypass_elections" ON elections
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_positions" ON positions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_bypass_notifications" ON notifications
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 4: Create policies for regular users
-- Elections - Everyone can read
CREATE POLICY "Anyone can view elections" ON elections
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Elections - Admins and commission can create/update/delete
CREATE POLICY "Admins can manage elections" ON elections
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

-- Positions - Everyone can read
CREATE POLICY "Anyone can view positions" ON positions
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Positions - Admins and commission can create/update/delete
CREATE POLICY "Admins and commission can manage positions" ON positions
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

-- Notifications - Users can view their own
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications - Admins can create for anyone
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commission')
    )
  );

-- Step 5: Grant explicit table permissions
GRANT ALL ON TABLE elections TO service_role;
GRANT ALL ON TABLE positions TO service_role;
GRANT ALL ON TABLE notifications TO service_role;
GRANT ALL ON TABLE user_profiles TO service_role;

GRANT SELECT ON TABLE elections TO authenticated, anon;
GRANT SELECT ON TABLE positions TO authenticated, anon;
GRANT SELECT ON TABLE notifications TO authenticated;
GRANT SELECT ON TABLE user_profiles TO authenticated;

-- Step 6: Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Verify the setup
SELECT 
  'TABLES' as type,
  schemaname,
  tablename,
  tableowner,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('elections', 'positions', 'notifications')
  AND schemaname = 'public'

UNION ALL

SELECT 
  'POLICIES' as type,
  schemaname,
  tablename,
  policyname,
  CASE WHEN roles::text LIKE '%service_role%' THEN 'YES' ELSE 'NO' END as has_service_role
FROM pg_policies
WHERE tablename IN ('elections', 'positions', 'notifications')
  AND schemaname = 'public'
ORDER BY type, tablename;
