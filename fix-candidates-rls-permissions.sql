-- =====================================================
-- FIX CANDIDATES TABLE RLS PERMISSIONS
-- =====================================================
-- This fixes the "permission denied" error for candidate applications

-- First, ensure RLS is enabled
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view approved candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can view own applications" ON public.candidates;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can view all applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can update applications" ON public.candidates;
DROP POLICY IF EXISTS "Admins and commission can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Service role full access" ON public.candidates;
DROP POLICY IF EXISTS "allow read" ON public.candidates;

-- Policy 1: Service role can do EVERYTHING (bypasses all RLS)
-- This is critical for API routes using service role key
CREATE POLICY "service_role_all_access"
  ON public.candidates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can insert their own applications
CREATE POLICY "authenticated_users_can_insert"
  ON public.candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can view their own applications
CREATE POLICY "users_view_own_applications"
  ON public.candidates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: Anyone can view approved candidates (for voting interface)
CREATE POLICY "public_view_approved_candidates"
  ON public.candidates
  FOR SELECT
  TO authenticated, anon
  USING (status = 'approved');

-- Policy 5: Admins and commission can view all applications
CREATE POLICY "admin_commission_view_all"
  ON public.candidates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy 6: Admins and commission can update applications (approve/reject)
CREATE POLICY "admin_commission_update_all"
  ON public.candidates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Policy 7: Admins and commission can delete applications
CREATE POLICY "admin_commission_delete_all"
  ON public.candidates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'commission')
    )
  );

-- Grant table permissions to service_role
GRANT ALL ON public.candidates TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT ON public.candidates TO authenticated;

-- Grant table permissions to anon (for viewing approved candidates)
GRANT SELECT ON public.candidates TO anon;

-- Verify policies are created
SELECT 
  '✅ RLS POLICIES CREATED' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'candidates';

-- Show all policies
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'candidates'
ORDER BY policyname;
