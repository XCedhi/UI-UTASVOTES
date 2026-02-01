-- First, let's check if the elections table exists and what columns it has
-- If it doesn't have the basic columns, we'll add them

-- Add name column if it doesn't exist
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add description column if it doesn't exist
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add status column if it doesn't exist
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';

-- Add the new columns we need
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS election_type TEXT DEFAULT 'university-wide',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voting_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voting_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add timestamps if they don't exist
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comments
COMMENT ON COLUMN elections.name IS 'Name of the election';
COMMENT ON COLUMN elections.description IS 'Description of the election';
COMMENT ON COLUMN elections.status IS 'Status: upcoming, active, completed, cancelled';
COMMENT ON COLUMN elections.election_type IS 'Type of election: university-wide or departmental';
COMMENT ON COLUMN elections.department IS 'Department name for departmental elections (null for university-wide)';
COMMENT ON COLUMN elections.nomination_start IS 'When candidate nominations open';
COMMENT ON COLUMN elections.nomination_end IS 'When candidate nominations close';
COMMENT ON COLUMN elections.voting_start IS 'When voting period begins';
COMMENT ON COLUMN elections.voting_end IS 'When voting period ends';
COMMENT ON COLUMN elections.created_by IS 'Admin user who created the election';

-- Add check constraint for election_type
ALTER TABLE elections 
DROP CONSTRAINT IF EXISTS elections_election_type_check;

ALTER TABLE elections 
ADD CONSTRAINT elections_election_type_check 
CHECK (election_type IN ('university-wide', 'departmental'));

-- Add check constraint for status
ALTER TABLE elections 
DROP CONSTRAINT IF EXISTS elections_status_check;

ALTER TABLE elections 
ADD CONSTRAINT elections_status_check 
CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'));
