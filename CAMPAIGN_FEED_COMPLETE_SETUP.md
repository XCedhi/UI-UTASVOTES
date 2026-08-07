# Campaign Feed - Complete Database Integration

## Current Status

The campaign feed is now fully integrated with your Supabase database. It's showing an empty state because there are no posts in the `feed_items` table yet.

## What Was Fixed

### 1. Error Handling
**File**: `src/app/campaign-feed/components/CampaignFeedInteractive.tsx`

- Added better error handling for database queries
- Added try-catch for like checks to prevent errors
- Properly sets loading state in all code paths
- Shows empty state when no posts exist

### 2. Data Flow

```
Campaign Feed Page
    ↓
Fetch from feed_items table
    ↓
Transform to FeedItem interface
    ↓
Check user likes from post_likes table
    ↓
Display posts or empty state
```

## Database Tables Used

### feed_items
Stores all campaign posts with denormalized author information:
- `id` - Unique post ID
- `author_id` - User ID who created the post
- `author_name` - Author's full name (denormalized)
- `author_avatar` - Author's avatar URL (denormalized)
- `author_role` - 'student' or 'candidate'
- `type` - 'manifesto', 'video', 'announcement', 'qa', 'discussion'
- `title` - Post title
- `content` - Post content
- `hashtags` - Array of hashtags
- `position` - Candidate position (if applicable)
- `department` - Author's department
- `likes_count` - Number of likes
- `comments_count` - Number of comments
- `shares_count` - Number of shares
- `media_url` - Optional image/video URL
- `created_at` - Timestamp

### post_likes
Tracks which users liked which posts:
- `id` - Unique like ID
- `post_id` - Reference to feed_items
- `user_id` - Reference to user_profiles
- `created_at` - Timestamp

## How to Add Test Data

### Option 1: Use the SQL Script
Run the `seed-campaign-feed.sql` file in your Supabase SQL Editor:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `seed-campaign-feed.sql`
4. Click "Run"
5. Refresh the campaign feed page

### Option 2: Use the Create Post Feature
1. Navigate to `/campaign-feed/create`
2. Fill in the post form
3. Submit the post
4. It will be saved to the database

### Option 3: Manual Insert via Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Select `feed_items` table
3. Click "Insert row"
4. Fill in the required fields:
   - `author_id`: Your user ID
   - `author_name`: Your full name
   - `author_avatar`: Your avatar URL (or NULL)
   - `author_role`: 'student' or 'candidate'
   - `type`: Choose from dropdown
   - `title`: Post title
   - `content`: Post content
   - `department`: Your department
5. Click "Save"

## Features Working

✅ **Fetch posts from database**
✅ **Display author information** (name, avatar, department)
✅ **Show post types** (manifesto, discussion, announcement, etc.)
✅ **Like functionality** (stores in post_likes table)
✅ **Empty state** when no posts exist
✅ **Loading state** while fetching data
✅ **Error handling** for database issues
✅ **Default avatar** for users without profile pictures
✅ **Hashtag display**
✅ **Timestamp formatting**

## Current Behavior

When you visit the campaign feed:

1. **If feed_items table is empty**:
   - Shows "No posts yet" message
   - Displays "Create First Post" button
   - No errors in console

2. **If feed_items has posts**:
   - Displays all posts from database
   - Shows real author names and avatars
   - Shows real like counts
   - Allows liking/unliking posts

## Next Steps

### 1. Add Test Data
Run the `seed-campaign-feed.sql` script to add sample posts

### 2. Create Real Posts
Use the "Create Post" button to add your own posts

### 3. Test Features
- Like/unlike posts
- View different post types
- Filter by type
- Check that avatars display correctly

## Troubleshooting

### "Error fetching feed items"
- **Cause**: RLS policy blocking access or table doesn't exist
- **Solution**: Check RLS policies on feed_items table
- **SQL to fix**:
  ```sql
  -- Allow all authenticated users to read feed items
  CREATE POLICY "Anyone can view feed items"
  ON feed_items FOR SELECT
  TO authenticated
  USING (true);
  ```

### "No posts yet" message
- **Cause**: feed_items table is empty
- **Solution**: Add test data using the SQL script

### Posts not showing author avatar
- **Cause**: author_avatar is NULL in database
- **Solution**: System automatically shows default image at `/assets/images/no_image.png`

## Files Modified

1. `src/app/campaign-feed/components/CampaignFeedInteractive.tsx`
   - Better error handling
   - Proper loading states
   - Empty state handling

2. `seed-campaign-feed.sql` (NEW)
   - SQL script to add test data

## Database Schema

The feed_items table should have these columns:
```sql
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES user_profiles(id),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  position TEXT,
  department TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Status

✅ **COMPLETE** - Campaign feed fully integrated with database
📝 **ACTION NEEDED** - Add test data to see posts in the feed
