# Campaign Feed & Profile Picture - Database Integration Plan

## Current Issues

1. **Campaign Feed**: Shows hardcoded mock data instead of real posts from database
2. **Profile Pictures**: Not displaying user's uploaded avatar from database
3. **No Default Avatar**: Missing fallback for users without profile pictures

## Required Changes

### 1. Header Component - Profile Picture
**File**: `src/components/common/Header.tsx`

Changes needed:
- Accept `userAvatar` prop from parent
- Display avatar if exists, otherwise show default icon
- Use default "no profile" image: `/public/assets/images/no_image.png`

### 2. Campaign Feed Component
**File**: `src/app/campaign-feed/components/CampaignFeedInteractive.tsx`

Changes needed:
- Remove mock data
- Fetch real posts from `feed_items` table
- Join with `user_profiles` to get author information
- Display author's avatar or default icon
- Show real timestamps, likes, comments from database

### 3. Database Schema

Tables involved:
- `feed_items` - Campaign posts
- `user_profiles` - User information and avatars
- `comments` - Post comments
- `likes` (if exists) - Post likes

### 4. Student Dashboard
**File**: `src/app/student-dashboard/components/StudentDashboardInteractive.tsx`

Already updated to fetch user data, just need to ensure avatar is passed to Header.

## Implementation Steps

### Step 1: Update Header for Profile Pictures
```typescript
// In Header component
const avatarSrc = userAvatar || '/assets/images/no_image.png';

<img 
  src={avatarSrc} 
  alt={userName}
  onError={(e) => {
    e.currentTarget.src = '/assets/images/no_image.png';
  }}
/>
```

### Step 2: Update Campaign Feed to Fetch Real Data
```typescript
// Fetch feed items with user information
const { data: feedItems } = await supabase
  .from('feed_items')
  .select(`
    *,
    user_profiles!inner(
      full_name,
      avatar_url,
      student_id,
      department
    )
  `)
  .order('created_at', { ascending: false });
```

### Step 3: Update Feed Item Display
- Show author's real name from `user_profiles`
- Show author's avatar or default
- Show real post content
- Show real timestamps
- Connect likes/comments to database

## Database Queries Needed

### Get Feed Items
```sql
SELECT 
  feed_items.*,
  user_profiles.full_name,
  user_profiles.avatar_url,
  user_profiles.student_id,
  user_profiles.department
FROM feed_items
INNER JOIN user_profiles ON feed_items.user_id = user_profiles.id
ORDER BY feed_items.created_at DESC;
```

### Get Comments Count
```sql
SELECT feed_id, COUNT(*) as comment_count
FROM comments
GROUP BY feed_id;
```

### Get Likes Count
```sql
SELECT feed_id, COUNT(*) as like_count
FROM likes
GROUP BY feed_id;
```

## Benefits

1. **Real-Time Updates**: Posts from any user appear immediately
2. **Personalized Experience**: Each user sees their own avatar
3. **Authentic Content**: Only real posts from database users
4. **Scalable**: Works for any number of users and posts
5. **Professional**: Default avatar for users without uploads

## Files to Modify

1. `src/components/common/Header.tsx` - Profile picture display
2. `src/app/campaign-feed/components/CampaignFeedInteractive.tsx` - Fetch real feed
3. `src/app/student-dashboard/components/StudentDashboardInteractive.tsx` - Pass avatar to header (already done)
4. `src/contexts/ElectionContext.tsx` - Update feed context to use database

## Testing

After implementation:
1. Login as student with avatar → Should see avatar in header
2. Login as student without avatar → Should see default icon
3. View campaign feed → Should see real posts from database
4. Create new post → Should appear in feed immediately
5. Multiple users → Each sees their own avatar and can see others' posts

## Status

- [ ] Update Header component for profile pictures
- [ ] Update Campaign Feed to fetch from database
- [ ] Test with users who have avatars
- [ ] Test with users without avatars
- [ ] Test post creation and display
- [ ] Document for future reference
