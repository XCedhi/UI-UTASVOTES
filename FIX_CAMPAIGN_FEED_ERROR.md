# Fix Campaign Feed Error - Step by Step

## The Problem

You're seeing "Error fetching feed items" because the `feed_items` table either:
1. Doesn't exist in your database yet
2. Has RLS (Row Level Security) policies blocking access
3. Is missing required permissions

## The Solution

Follow these steps **in order**:

### Step 1: Create the Tables
Run `setup-feed-items-table.sql` in your Supabase SQL Editor

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `setup-feed-items-table.sql`
5. Click **Run** (or press F5)
6. You should see: "Tables created successfully!"

This script will:
- Create `feed_items` table
- Create `post_likes` table
- Set up indexes for performance
- Enable RLS (Row Level Security)
- Create policies to allow authenticated users to read/write
- Grant necessary permissions

### Step 2: Add Test Data
Run `seed-campaign-feed.sql` in your Supabase SQL Editor

1. In the same SQL Editor
2. Click **New Query**
3. Copy and paste the entire contents of `seed-campaign-feed.sql`
4. Click **Run**
5. You should see 3 posts created

This will add:
- 1 discussion post
- 1 manifesto post
- 1 announcement post

### Step 3: Refresh Your Browser
1. Go back to your application
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Navigate to the Campaign Feed
4. You should now see the 3 test posts!

## Verification

After running both scripts, verify in Supabase:

1. Go to **Table Editor**
2. Select `feed_items` table
3. You should see 3 rows of data
4. Each row should have:
   - author_name (from your user_profiles)
   - title
   - content
   - type (discussion, manifesto, announcement)
   - created_at timestamp

## If You Still See Errors

### Check 1: Verify Tables Exist
Run this in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feed_items', 'post_likes');
```

You should see both tables listed.

### Check 2: Verify RLS Policies
Run this in SQL Editor:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('feed_items', 'post_likes');
```

You should see policies for both tables.

### Check 3: Check for Data
Run this in SQL Editor:
```sql
SELECT COUNT(*) as total_posts FROM feed_items;
```

Should return a number greater than 0.

### Check 4: Test Direct Query
Run this in SQL Editor:
```sql
SELECT 
  id,
  author_name,
  title,
  type,
  created_at
FROM feed_items
ORDER BY created_at DESC
LIMIT 5;
```

You should see your posts.

## Common Issues

### Issue: "relation feed_items does not exist"
**Solution**: Run `setup-feed-items-table.sql` first

### Issue: "permission denied for table feed_items"
**Solution**: The RLS policies weren't created. Run `setup-feed-items-table.sql` again

### Issue: "No posts showing but no error"
**Solution**: Run `seed-campaign-feed.sql` to add test data

### Issue: "Error: null value in column author_id"
**Solution**: Make sure you have at least one user in `user_profiles` table

## What Happens After Setup

Once the tables are created and data is added:

1. **Campaign Feed Page** (`/campaign-feed`):
   - Fetches all posts from `feed_items` table
   - Displays posts with author info
   - Shows like counts
   - Allows filtering by type

2. **Create Post** (`/campaign-feed/create`):
   - Saves new posts to `feed_items` table
   - Automatically adds author info from logged-in user

3. **Like Functionality**:
   - Clicking like adds record to `post_likes` table
   - Clicking again removes the record
   - Like count updates in real-time

## Files to Run (In Order)

1. `setup-feed-items-table.sql` - Creates tables and policies
2. `seed-campaign-feed.sql` - Adds test data

## Expected Result

After running both scripts and refreshing:
- ✅ No errors in console
- ✅ Campaign feed shows 3 posts
- ✅ Each post shows author name and avatar
- ✅ Like buttons work
- ✅ Can create new posts

## Status

Run the SQL scripts in order, then refresh your browser. The campaign feed should work perfectly!
