-- Check if applications exist in candidates table
SELECT 
  id,
  name,
  full_name,
  student_id,
  position,
  status,
  created_at,
  election_id
FROM candidates
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies on candidates table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'candidates';

-- Check if commission user has proper role
SELECT 
  id,
  email,
  role,
  raw_user_meta_data
FROM auth.users
WHERE email LIKE '%commission%';

-- Check user_profiles for commission user
SELECT 
  id,
  email,
  role,
  full_name
FROM user_profiles
WHERE role = 'commission' OR email LIKE '%commission%';
