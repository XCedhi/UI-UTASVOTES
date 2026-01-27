-- Create announcements table for election updates
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('election', 'deadline', 'result', 'system', 'fee_update', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_announcements_active ON announcements(is_active, published_at DESC);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- Disable RLS for public read access
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- Grant read access to everyone, write access to authenticated users
GRANT SELECT ON announcements TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON announcements TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE announcements_id_seq TO anon, authenticated, service_role;

-- Insert sample announcements
INSERT INTO announcements (type, title, message, priority, is_active) VALUES
('election', 'Student Council Elections 2026 Now Open', 'Voting for the Student Council Elections 2026 is now live. Cast your vote before the deadline. Make your voice heard!', 'high', true),
('deadline', 'Candidate Registration Deadline Approaching', 'The deadline for candidate registration is approaching. Submit your application and required documents before it''s too late.', 'high', true),
('fee_update', 'Application Fee Structure Updated', 'The application fees for various positions have been updated. Check the latest fee structure in the candidate registration section.', 'medium', true),
('result', 'Departmental Elections Results Available', 'Results for Computer Science and Engineering departmental elections are now available. View results in the election results section.', 'medium', true),
('system', 'System Maintenance Notice', 'The electoral system will undergo scheduled maintenance. Voting and other services may be temporarily unavailable during this period.', 'low', true),
('general', 'Welcome to UTASVotes 2026', 'Welcome to the official electoral system of the University of Technical and Applied Sciences. Participate in democratic elections from anywhere!', 'low', true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

SELECT 'Announcements table created successfully!' as status;
