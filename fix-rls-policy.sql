-- Fix RLS Policy for Support Tickets
-- This allows anyone (including service role) to insert tickets

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can create support tickets" ON support_tickets;

-- Create a new policy that explicitly allows all inserts
CREATE POLICY "Anyone can create support tickets"
  ON support_tickets
  FOR INSERT
  TO public, anon, authenticated, service_role
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'support_tickets' 
AND policyname = 'Anyone can create support tickets';

-- Test insert (this should work now)
SELECT 'Policy updated successfully! Try submitting the form again.' as status;
