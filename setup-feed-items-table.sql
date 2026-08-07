-- Complete Setup for feed_items and post_likes tables
-- Run this in your Supabase SQL Editor

-- 1. Create feed_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL CHECK (author_role IN ('student', 'candidate')),
  
  -- Content
  type TEXT NOT NULL CHECK (type IN ('manifesto', 'video', 'announcement', 'qa', 'discussion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  
  -- Media
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'gif', 'link')),
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Metadata
  position TEXT,
  department TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_items_author_id ON public.feed_items(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_created_at ON public.feed_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_type ON public.feed_items(type);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- 4. Enable Row Level Security
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can create their own feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can update their own feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can delete their own feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;

-- 6. Create RLS policies for feed_items
CREATE POLICY "Anyone can view feed items"
ON public.feed_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own feed items"
ON public.feed_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own feed items"
ON public.feed_items FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own feed items"
ON public.feed_items FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 7. Create RLS policies for post_likes
CREATE POLICY "Anyone can view post likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8. Grant permissions
GRANT ALL ON public.feed_items TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.feed_items TO service_role;
GRANT ALL ON public.post_likes TO service_role;

-- 9. Verify tables were created
SELECT 
  'feed_items' as table_name,
  COUNT(*) as row_count
FROM public.feed_items
UNION ALL
SELECT 
  'post_likes' as table_name,
  COUNT(*) as row_count
FROM public.post_likes;

-- Success message
SELECT 'Tables created successfully! You can now add test data.' as status;
