-- Quick check to see if user_profiles table exists and is accessible
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT 
    'Table exists!' as status,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 4. Grant permissions to service role (just in case)
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.user_profiles TO postgres;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;

-- 5. Test if we can select from the table
SELECT COUNT(*) as "Total Rows" FROM public.user_profiles;

-- Success message
SELECT '✅ user_profiles table is accessible!' as result;
