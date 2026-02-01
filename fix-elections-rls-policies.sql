-- Fix RLS policies for elections table to allow admins to create elections

-- Enable RLS on elections table
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view elections" ON elections;
DROP POLICY IF EXISTS "Admins can manage elections" ON elections;
DROP POLICY IF EXISTS "Commission can manage elections" ON elections;
DROP POLICY IF EXISTS "Admins and commission can create elections" ON elections;
DROP POLICY IF EXISTS "Admins and commission can update elections" ON elections;
DROP POLICY IF EXISTS "Admins and commission can delete elections" ON elections;

-- Allow everyone to view elections
CREATE POLICY "Anyone can view elections" ON elections
  FOR SELECT USING (true);

-- Allow admins and commission to INSERT elections
CREATE POLICY "Admins and commission can create elections" ON elections
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Allow admins and commission to UPDATE elections
CREATE POLICY "Admins and commission can update elections" ON elections
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Allow admins and commission to DELETE elections
CREATE POLICY "Admins and commission can delete elections" ON elections
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );
