-- Check if avatar_url is actually saved in the database
SELECT 
  id,
  email,
  full_name,
  CASE 
    WHEN avatar_url IS NULL THEN 'NULL - No avatar saved'
    WHEN avatar_url = '' THEN 'EMPTY STRING - No avatar saved'
    WHEN LENGTH(avatar_url) < 100 THEN 'URL: ' || avatar_url
    ELSE 'Base64 image present (' || LENGTH(avatar_url) || ' characters)'
  END as avatar_status,
  LEFT(avatar_url, 50) as avatar_preview,
  updated_at
FROM user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
