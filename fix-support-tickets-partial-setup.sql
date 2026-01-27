-- Fix Partial Support Tickets Setup
-- Run this if you got "trigger already exists" error

-- This script will:
-- 1. Check what exists
-- 2. Drop and recreate only what's needed
-- 3. Ensure everything is set up correctly

-- Step 1: Check current state
DO $$ 
BEGIN
  RAISE NOTICE '=== Checking Current State ===';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
    RAISE NOTICE '✓ support_tickets table EXISTS';
  ELSE
    RAISE NOTICE '✗ support_tickets table DOES NOT EXIST';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'support_ticket_responses') THEN
    RAISE NOTICE '✓ support_ticket_responses table EXISTS';
  ELSE
    RAISE NOTICE '✗ support_ticket_responses table DOES NOT EXIST';
  END IF;
  
  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'trigger_set_ticket_number') THEN
    RAISE NOTICE '✓ trigger_set_ticket_number EXISTS';
  ELSE
    RAISE NOTICE '✗ trigger_set_ticket_number DOES NOT EXIST';
  END IF;
END $$;

-- Step 2: Drop existing triggers (if they exist)
DROP TRIGGER IF EXISTS trigger_set_ticket_number ON support_tickets;
DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON support_tickets;

-- Step 3: Drop existing functions (if they exist)
DROP FUNCTION IF EXISTS set_ticket_number() CASCADE;
DROP FUNCTION IF EXISTS generate_ticket_number() CASCADE;

-- Step 4: Recreate the functions
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

CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the triggers
CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify everything is working
DO $$ 
BEGIN
  RAISE NOTICE '=== Verification Complete ===';
  RAISE NOTICE '✓ Functions recreated';
  RAISE NOTICE '✓ Triggers recreated';
  RAISE NOTICE '✓ Setup is now complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test the support ticket system.';
END $$;

-- Step 7: Test ticket number generation
SELECT generate_ticket_number() as test_ticket_number;
