-- Fix user_profiles table permissions
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        RAISE NOTICE 'ERROR: user_profiles table does not exist!';
        RAISE NOTICE 'You need to run the schema file: supabase/schema_comprehensive.sql';
    ELSE
        RAISE NOTICE 'SUCCESS: user_profiles table exists';
    END IF;
END $$;

-- 2. Grant permissions to service role
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.user_profiles TO postgres;

-- 3. Temporarily disable RLS for testing (ONLY FOR TESTING!)
-- Uncomment the line below if you want to test without RLS
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Check current RLS status
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 5. List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. Test insert permission (this should work with service role)
-- This is just a check - it won't actually insert anything
DO $$
BEGIN
    -- Try to check if we can insert
    PERFORM 1 FROM information_schema.table_privileges 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND privilege_type = 'INSERT';
    
    IF FOUND THEN
        RAISE NOTICE 'SUCCESS: INSERT permission exists on user_profiles';
    ELSE
        RAISE NOTICE 'WARNING: No INSERT permission found';
    END IF;
END $$;

-- 7. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
