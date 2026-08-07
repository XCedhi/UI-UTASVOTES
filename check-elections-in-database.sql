-- Check all elections in the database
SELECT 
  id,
  title,
  type,
  status,
  start_date,
  end_date,
  description,
  created_at
FROM elections
ORDER BY created_at DESC;

-- Check if there are any candidates
SELECT 
  id,
  election_id,
  full_name,
  position,
  status,
  created_at
FROM candidates
ORDER BY created_at DESC
LIMIT 10;
