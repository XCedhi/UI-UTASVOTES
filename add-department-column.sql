-- Add department column to elections table
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add comment
COMMENT ON COLUMN elections.department IS 'Department name for departmental elections (null for university-wide)';
