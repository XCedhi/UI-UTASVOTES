-- Create system_alerts table for monitoring and security alerts
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('security', 'system', 'fraud', 'warning', 'info')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id TEXT,
  related_type TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_is_resolved ON system_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Admin and Commission can read all alerts
CREATE POLICY "Admin and Commission can read alerts"
  ON system_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy: Admin and Commission can insert alerts
CREATE POLICY "Admin and Commission can create alerts"
  ON system_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy: Admin and Commission can update alerts
CREATE POLICY "Admin and Commission can update alerts"
  ON system_alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER system_alerts_updated_at
  BEFORE UPDATE ON system_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_system_alerts_updated_at();

-- Insert some sample alerts for testing
INSERT INTO system_alerts (type, severity, title, message) VALUES
  ('info', 'low', 'System Operational', 'All systems functioning normally'),
  ('warning', 'medium', 'High Server Load', 'Server experiencing higher than normal traffic');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON system_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON system_alerts TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'System alerts table created successfully!';
  RAISE NOTICE 'RLS policies configured for admin and commission access';
  RAISE NOTICE 'Sample alerts inserted for testing';
END $$;
