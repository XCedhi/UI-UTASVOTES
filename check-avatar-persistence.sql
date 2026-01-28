-- Check if avatar_url is being saved in the database
SELECT 
  id,
  email,
  full_name,
  CASE 
    WHEN avatar_url IS NULL THEN 'No avatar'
    WHEN avatar_url LIKE 'data:image%' THEN 'Base64 image (' || LENGTH(avatar_url) || ' chars)'
    ELSE avatar_url
  END as avatar_status,
  updated_at
FROM user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
