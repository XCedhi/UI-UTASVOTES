-- Support Tickets Table
-- Stores all support requests from users

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  
  -- User Information (can be null for non-logged-in users)
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

-- Support Ticket Responses Table
-- Stores responses/replies to support tickets
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Response Details
  responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responder_name VARCHAR(255) NOT NULL,
  responder_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs public responses
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Attachments (optional)
  attachments JSONB DEFAULT '[]'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get count of tickets today
  SELECT COUNT(*) INTO counter
  FROM support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate ticket number: UTAS-YYYYMMDD-XXXX
  new_number := 'UTAS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- Support Tickets Policies

-- Anyone can create a support ticket (even non-authenticated users via API)
CREATE POLICY "Anyone can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all tickets
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

-- Admins can update tickets
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

-- Support Ticket Responses Policies

-- Users can view responses to their tickets
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

-- Admins can view all responses (including internal notes)
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

-- Admins can create responses
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

-- Create view for ticket statistics
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

-- Grant permissions
GRANT SELECT ON support_ticket_stats TO authenticated;
GRANT SELECT ON support_ticket_stats TO anon;

COMMENT ON TABLE support_tickets IS 'Stores all support requests and help tickets from users';
COMMENT ON TABLE support_ticket_responses IS 'Stores responses and replies to support tickets';
COMMENT ON VIEW support_ticket_stats IS 'Provides statistics about support tickets';
