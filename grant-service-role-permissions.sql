-- Grant ALL permissions to service_role on elections table
-- The service_role should already have these, but let's be explicit

GRANT ALL ON TABLE elections TO service_role;
GRANT ALL ON TABLE positions TO service_role;
GRANT ALL ON TABLE notifications TO service_role;
GRANT ALL ON TABLE user_profiles TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify the grants
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE grantee IN ('service_role', 'authenticated', 'anon')
  AND table_schema = 'public'
  AND table_name IN ('elections', 'positions', 'notifications')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
