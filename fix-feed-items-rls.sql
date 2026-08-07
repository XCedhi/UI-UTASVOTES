-- Temporary fix: Disable RLS on feed_items to test
-- Run this in Supabase SQL Editor

-- First, check if the table exists
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'feed_items'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status
FROM (SELECT 'feed_items' as table_name) t;

-- Temporarily disable RLS for testing
ALTER TABLE IF EXISTS public.feed_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_likes DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.feed_items TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.feed_items TO anon;
GRANT ALL ON public.post_likes TO anon;

-- Check if there's any data
SELECT 
  COUNT(*) as total_posts,
  'Data check complete' as message
FROM public.feed_items;

-- Show the first few posts if they exist
SELECT 
  id,
  author_name,
  title,
  type,
  created_at
FROM public.feed_items
ORDER BY created_at DESC
LIMIT 5;
