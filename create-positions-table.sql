-- Create positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_candidates INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read positions
CREATE POLICY "Anyone can view positions" ON positions
  FOR SELECT USING (true);

-- Only admins and commission can create/update positions
CREATE POLICY "Admins and commission can manage positions" ON positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commission')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_positions_election_id ON positions(election_id);
