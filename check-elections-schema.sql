-- Check what columns exist in the elections table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'elections' 
ORDER BY ordinal_position;
