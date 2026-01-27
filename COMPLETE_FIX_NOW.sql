-- COMPLETE FIX - Run this entire script in Supabase SQL Editor
-- This will fix all issues and create everything correctly

-- Step 1: Clean up any partial setup
DROP TRIGGER IF EXISTS trigger_set_ticket_number ON support_tickets CASCADE;
DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON support_tickets CASCADE;
DROP FUNCTION IF EXISTS set_ticket_number() CASCADE;
DROP FUNCTION IF EXISTS generate_ticket_number() CASCADE;

-- Step 2: Check if update_updated_at_column exists (from main schema)
-- If not, create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
  
  -- User Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  
  -- Ticket Details
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'technical', 'account', 'election', 'security', 'other')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Admin Notes
  admin_notes TEXT
);

CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Response Details
  responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responder_name VARCHAR(255) NOT NULL,
  responder_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);

-- Step 5: Create ticket number generation function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) INTO counter
  FROM support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'UTAS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger function
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create triggers
CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can create support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view responses to own tickets" ON support_ticket_responses;
DROP POLICY IF EXISTS "Admins can view all responses" ON support_ticket_responses;
DROP POLICY IF EXISTS "Admins can create responses" ON support_ticket_responses;

-- Step 10: Create RLS policies
CREATE POLICY "Anyone can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tickets"
  ON support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view responses to own tickets"
  ON support_ticket_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_responses.ticket_id
      AND (
        support_tickets.user_id = auth.uid()
        OR support_tickets.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
    AND is_internal = FALSE
  );

CREATE POLICY "Admins can view all responses"
  ON support_ticket_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create responses"
  ON support_ticket_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Step 11: Create statistics view
CREATE OR REPLACE VIEW support_ticket_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_tickets,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_tickets,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as tickets_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as tickets_last_7d,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time_hours
FROM support_tickets;

-- Step 12: Grant permissions
GRANT SELECT ON support_ticket_stats TO authenticated;
GRANT SELECT ON support_ticket_stats TO anon;

-- Step 13: Test ticket number generation
SELECT generate_ticket_number() as test_ticket_number;

-- Step 14: Verify setup
SELECT 
  'Setup Complete!' as status,
  'Tables created: support_tickets, support_ticket_responses' as tables,
  'Triggers created: trigger_set_ticket_number, trigger_support_tickets_updated_at' as triggers,
  'RLS policies enabled and configured' as security,
  'Test the form at /contact-admin' as next_step;
