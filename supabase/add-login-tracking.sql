-- =====================================================
-- ADD LOGIN TRACKING
-- =====================================================
-- This script adds login tracking functionality to track
-- admin and all user logins in the database

-- 1. Drop existing table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS public.user_sessions CASCADE;

-- Create user_sessions table with proper structure
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMPTZ
);

-- 2. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_at ON public.user_sessions(login_at DESC);

-- 3. Create function to log user login
CREATE OR REPLACE FUNCTION public.log_user_login(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Insert new session record
  INSERT INTO public.user_sessions (
    user_id,
    ip_address,
    user_agent,
    login_at
  )
  VALUES (
    p_user_id,
    p_ip_address,
    p_user_agent,
    NOW()
  )
  RETURNING id INTO v_session_id;
  
  -- Update last_login in user_profiles
  UPDATE public.user_profiles
  SET last_login = NOW()
  WHERE id = p_user_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to log user logout
CREATE OR REPLACE FUNCTION public.log_user_logout(
  p_session_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update session with logout time
  UPDATE public.user_sessions
  SET logout_at = NOW()
  WHERE id = p_session_id
    AND logout_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create view for active sessions
CREATE OR REPLACE VIEW public.active_user_sessions AS
SELECT 
  s.id as session_id,
  s.user_id,
  p.email,
  p.full_name,
  p.role,
  s.ip_address,
  s.user_agent,
  s.login_at,
  EXTRACT(EPOCH FROM (NOW() - s.login_at)) / 60 as minutes_active
FROM public.user_sessions s
JOIN public.user_profiles p ON s.user_id = p.id
WHERE s.logout_at IS NULL
ORDER BY s.login_at DESC;

-- 6. Create view for login history
CREATE OR REPLACE VIEW public.user_login_history AS
SELECT 
  s.id as session_id,
  s.user_id,
  p.email,
  p.full_name,
  p.role,
  s.ip_address,
  s.login_at,
  s.logout_at,
  CASE 
    WHEN s.logout_at IS NOT NULL THEN s.logout_at - s.login_at
    ELSE NULL
  END as session_duration,
  CASE 
    WHEN s.logout_at IS NULL THEN 'Active'
    ELSE 'Ended'
  END as status
FROM public.user_sessions s
JOIN public.user_profiles p ON s.user_id = p.id
ORDER BY s.login_at DESC;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.log_user_login TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_user_logout TO authenticated, service_role;
GRANT SELECT ON public.active_user_sessions TO authenticated, service_role;
GRANT SELECT ON public.user_login_history TO authenticated, service_role;

-- 8. Add RLS policies for user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON public.user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. Create function to get user session stats
CREATE OR REPLACE FUNCTION public.get_user_session_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_logins', COUNT(*),
    'last_login', MAX(login_at),
    'average_session_duration', AVG(EXTRACT(EPOCH FROM (logout_at - login_at)) / 60) FILTER (WHERE logout_at IS NOT NULL),
    'total_session_time', SUM(EXTRACT(EPOCH FROM (logout_at - login_at)) / 60) FILTER (WHERE logout_at IS NOT NULL),
    'active_sessions', COUNT(*) FILTER (WHERE logout_at IS NULL)
  )
  INTO v_stats
  FROM public.user_sessions
  WHERE user_id = p_user_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_session_stats TO authenticated, service_role;

-- 10. Verification queries
SELECT '✅ Login Tracking Setup Complete' as status;

-- Show recent sessions
SELECT 
  '📊 Recent Sessions' as info,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE logout_at IS NULL) as active_sessions
FROM public.user_sessions;

COMMENT ON TABLE public.user_sessions IS 'Tracks user login/logout sessions for audit and analytics';
COMMENT ON FUNCTION public.log_user_login IS 'Logs a new user login session and updates last_login timestamp';
COMMENT ON FUNCTION public.log_user_logout IS 'Logs user logout by updating session end time';
COMMENT ON VIEW public.active_user_sessions IS 'Shows all currently active user sessions';
COMMENT ON VIEW public.user_login_history IS 'Complete history of all user login sessions';
