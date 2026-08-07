-- =====================================================
-- CREATE PAYMENT TRANSACTIONS TABLE
-- =====================================================
-- This table stores all payment transactions for candidate applications

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'card', 'bank_transfer')),
  network TEXT, -- MTN, Vodafone, AirtelTigo for mobile money
  phone_number TEXT,
  card_last_four TEXT, -- Last 4 digits of card for card payments
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  user_id UUID REFERENCES auth.users(id),
  candidate_id BIGINT REFERENCES public.candidates(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB -- Store additional payment gateway data
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id 
  ON public.payment_transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id 
  ON public.payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
  ON public.payment_transactions(status);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins and commission can view all transactions
DROP POLICY IF EXISTS "Admins and commission can view all transactions" ON public.payment_transactions;
CREATE POLICY "Admins and commission can view all transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy: Service role can do everything (for API routes)
DROP POLICY IF EXISTS "Service role full access on transactions" ON public.payment_transactions;
CREATE POLICY "Service role full access on transactions"
  ON public.payment_transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify table creation
SELECT 
  '✅ PAYMENT_TRANSACTIONS TABLE CREATED' as status,
  COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payment_transactions';

-- Show all columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payment_transactions'
ORDER BY ordinal_position;
