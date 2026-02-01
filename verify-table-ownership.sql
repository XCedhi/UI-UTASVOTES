-- Check table ownership and permissions
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename IN ('elections', 'positions', 'notifications')
  AND schemaname = 'public';

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('elections', 'positions', 'notifications')
  AND schemaname = 'public';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('elections', 'positions', 'notifications')
  AND schemaname = 'public';
