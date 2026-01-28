-- =====================================================
-- FIX: Auto-create user_profiles when auth.users is created
-- =====================================================
-- This trigger ensures that whenever a user is created in auth.users
-- (via invite, signup, etc.), a corresponding user_profiles record is created

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles with data from auth.users and raw_user_meta_data
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    status,
    access_start_date,
    access_end_date,
    position,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'pending'),
    (NEW.raw_user_meta_data->>'access_start_date')::TIMESTAMPTZ,
    (NEW.raw_user_meta_data->>'access_end_date')::TIMESTAMPTZ,
    NEW.raw_user_meta_data->>'position',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;

-- Test the trigger (optional - uncomment to verify)
-- SELECT * FROM auth.users LIMIT 1;
-- SELECT * FROM public.user_profiles LIMIT 1;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user_profiles record when a new auth.users record is created';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to auto-create user_profiles for new auth users';
