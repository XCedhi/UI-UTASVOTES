-- Seed Campaign Feed with Sample Posts
-- Run this AFTER running setup-feed-items-table.sql
-- This will add test posts to your feed

-- Insert sample feed items using actual user data
INSERT INTO public.feed_items (
  author_id,
  author_name,
  author_avatar,
  author_role,
  type,
  title,
  content,
  hashtags,
  position,
  department,
  likes_count,
  comments_count,
  shares_count,
  created_at
)
SELECT
  id as author_id,
  full_name as author_name,
  avatar_url as author_avatar,
  'student' as author_role,
  'discussion' as type,
  'Welcome to the Campaign Feed!' as title,
  'This is a test post to demonstrate the campaign feed functionality. Students can share their thoughts, candidates can post manifestos, and everyone can engage with the content.' as content,
  ARRAY['#UTASVotes', '#StudentLife', '#Elections2026'] as hashtags,
  NULL as position,
  department,
  0 as likes_count,
  0 as comments_count,
  0 as shares_count,
  NOW() as created_at
FROM public.user_profiles
WHERE role = 'student'
LIMIT 1;

-- Add a manifesto post
INSERT INTO public.feed_items (
  author_id,
  author_name,
  author_avatar,
  author_role,
  type,
  title,
  content,
  hashtags,
  position,
  department,
  likes_count,
  comments_count,
  shares_count,
  created_at
)
SELECT
  id as author_id,
  full_name as author_name,
  avatar_url as author_avatar,
  'candidate' as author_role,
  'manifesto' as type,
  'My Vision for UTAS 2026' as title,
  'I pledge to improve student welfare, enhance campus facilities, and ensure every voice is heard. Together, we can build a better UTAS! Vote for progress, vote for change.' as content,
  ARRAY['#UTAS2026', '#StudentWelfare', '#Vote'] as hashtags,
  'Student Union President' as position,
  department,
  15 as likes_count,
  3 as comments_count,
  5 as shares_count,
  NOW() - INTERVAL '2 hours' as created_at
FROM public.user_profiles
WHERE role = 'student'
LIMIT 1;

-- Add an announcement
INSERT INTO public.feed_items (
  author_id,
  author_name,
  author_avatar,
  author_role,
  type,
  title,
  content,
  hashtags,
  position,
  department,
  likes_count,
  comments_count,
  shares_count,
  created_at
)
SELECT
  id as author_id,
  full_name as author_name,
  avatar_url as author_avatar,
  'student' as author_role,
  'announcement' as type,
  'Voting Starts Tomorrow!' as title,
  'Reminder: Voting for the Student Council elections begins tomorrow at 8:00 AM. Make sure you cast your vote and make your voice heard!' as content,
  ARRAY['#Voting', '#Elections', '#UTAS'] as hashtags,
  NULL as position,
  department,
  8 as likes_count,
  2 as comments_count,
  3 as shares_count,
  NOW() - INTERVAL '1 day' as created_at
FROM public.user_profiles
WHERE role = 'student'
LIMIT 1 OFFSET 1;

-- Verify the data was inserted
SELECT 
  id,
  author_name,
  type,
  title,
  likes_count,
  created_at
FROM public.feed_items
ORDER BY created_at DESC;

-- Show success message
SELECT 
  COUNT(*) as total_posts,
  'Feed items added successfully!' as message
FROM public.feed_items;
