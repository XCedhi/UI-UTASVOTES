-- =====================================================
-- TEMPORARY: DISABLE RLS TO TEST
-- =====================================================
-- This will allow us to see if elections exist
-- We'll re-enable it after confirming
-- =====================================================

-- Disable RLS temporarily
ALTER TABLE elections DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- Check if elections exist
SELECT 
  id,
  name,
  title,
  election_type,
  type,
  status,
  created_at
FROM elections
ORDER BY created_at DESC;

-- Check if positions exist
SELECT 
  id,
  election_id,
  title,
  application_fee
FROM positions
ORDER BY created_at DESC;

SELECT '⚠️ RLS IS NOW DISABLED - Elections should be visible in your app!' as warning;
SELECT 'Refresh your browser and check if elections appear' as instruction;
SELECT 'After confirming, we will re-enable RLS with proper policies' as next_step;
