-- Grant table-level permissions to authenticated users
-- This is required in addition to RLS policies

-- Re-enable RLS first (if you disabled it)
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant ALL permissions on tables to authenticated role
GRANT ALL ON elections TO authenticated;
GRANT ALL ON positions TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

-- Grant usage on sequences (needed for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify grants
SELECT 
  table_name,
  array_agg(privilege_type) as privileges
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN ('elections', 'positions', 'notifications', 'user_profiles')
GROUP BY table_name;
