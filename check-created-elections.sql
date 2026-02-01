-- Check if elections were actually created
SELECT 
  id,
  name,
  title,
  election_type,
  department,
  status,
  created_at
FROM elections
ORDER BY created_at DESC
LIMIT 10;

-- Check if positions were created
SELECT 
  id,
  election_id,
  title,
  application_fee,
  created_at
FROM positions
ORDER BY created_at DESC
LIMIT 10;

-- Check column names in elections table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'elections'
ORDER BY ordinal_position;
