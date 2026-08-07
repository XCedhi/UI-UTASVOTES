-- Check if positions table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'positions'
ORDER BY ordinal_position;

-- Also check what data is in the positions table
SELECT * FROM positions LIMIT 5;
