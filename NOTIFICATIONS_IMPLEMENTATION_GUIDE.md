# Notifications Implementation Guide

## Overview

Real notifications have been implemented in the Header component. This guide covers setup, testing, and troubleshooting.

## Current Implementation Status

✅ **Header Component** - Fully implemented with:
- Real-time notification fetching from database
- Unread count badge
- Notification type icons and colors
- Mark as read functionality
- Click-to-navigate support with `action_url`
- Relative timestamp formatting (e.g., "2h ago")
- Notification filtering by user

## Quick Start (3 Steps)

### Step 1: Migrate Database Schema

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- File: setup-notifications-complete.sql
-- Copy and paste entire contents into Supabase SQL Editor
```

This will:
- Add `user_id`, `type`, `action_url`, `is_read`, `read_at` columns
- Create proper indexes for performance
- Set up RLS policies for security
- Insert 5 sample notifications for testing

**Alternative (minimal migration):** If you only want to migrate schema without sample data:
```sql
-- File: migrate-notifications-table.sql
```

### Step 2: Test with Sample Data

After running the migration SQL:

1. **Login as student:**
   - Email: `student@cktutas.edu.gh`
   - Password: `Student@2026`

2. **Check notifications:**
   - Click the bell icon 🔔 in the header (top right)
   - You should see 5 sample notifications
   - Unread count badge shows "5"

3. **Interact with notifications:**
   - Click a notification to mark as read
   - Notice the badge decrements
   - Some notifications have action URLs that navigate to relevant pages

### Step 3: Clear Cache & Restart

```bash
# Clear Next.js build cache
Remove-Item -Path .next -Recurse -Force

# Clear browser cache (in your browser)
Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# Restart dev server
npm run dev
```

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('election', 'deadline', 'result', 'approval', 
                             'system', 'application', 'comment', 'like', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,                    -- Optional URL to navigate to when clicked
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Notification Types & Icons

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `election` | CheckBadgeIcon | success | Election announcements |
| `deadline` | ClockIcon | warning | Time-sensitive deadlines |
| `result` | ChartBarIcon | primary | Election results available |
| `approval` | CheckCircleIcon | success | Application approved |
| `application` | DocumentTextIcon | accent | Application status updates |
| `system` | InformationCircleIcon | muted | System updates/maintenance |
| `comment` | ChatBubbleLeftIcon | primary | Feed comments/mentions |
| `mention` | AtSymbolIcon | accent | User mentioned in feed |

## How to Manually Create Notifications

Use this SQL template to create notifications programmatically:

```sql
-- Get user ID
SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh';

-- Create notification
INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
VALUES (
  'USER_ID_HERE',
  'election',
  'New Election Announced',
  'Student Council 2026 Election voting is now open.',
  '/student-dashboard',
  false,
  NOW()
);
```

## API Integration Points

### 1. Fetch Notifications (Header Component)

```typescript
// Called on component mount
const fetchNotifications = async () => {
  const userId = localStorage.getItem('userId');
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Update state with data
};
```

### 2. Mark as Read

```typescript
// Called when notification is clicked
const handleMarkAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
};
```

### 3. Navigate on Click

```typescript
// If notification has action_url, navigate there
if (notification.action_url) {
  router.push(notification.action_url);
}
```

## Testing Checklist

- [ ] Run migration SQL successfully
- [ ] Login as student
- [ ] See bell icon with "5" badge
- [ ] Click bell icon to open notification panel
- [ ] See 5 sample notifications listed
- [ ] Unread notifications show blue accent border
- [ ] Read notifications show without border
- [ ] Click notification to mark as read
- [ ] Badge count decrements on mark as read
- [ ] Click notification with `action_url` navigates to correct page
- [ ] Refresh page - notifications persist (from database)
- [ ] Relative timestamps display correctly ("2h ago", etc.)
- [ ] Notification icons display with correct colors

## Troubleshooting

### Issue: Notification bell shows "0" unread

**Cause:** Either no notifications exist for user, or RLS policies are blocking access.

**Solution:**
1. Verify sample data was inserted: Run this in SQL Editor:
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh');
   ```
2. Check RLS policies are enabled: 
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

### Issue: "Cannot read property 'length' of null"

**Cause:** `userId` not found in localStorage during initial fetch.

**Solution:**
1. Ensure user is fully logged in
2. Clear localStorage and login again
3. Check `ProtectedRoute.tsx` is working correctly

### Issue: Notifications show but don't update on click

**Cause:** RLS policy blocking UPDATE operations.

**Solution:**
```sql
-- Verify UPDATE policy exists and is correct
SELECT * FROM pg_policies 
WHERE tablename = 'notifications' 
AND policyname LIKE '%update%';

-- If missing, add it:
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());
```

### Issue: Sample data not inserting

**Cause:** User not found or email mismatch.

**Solution:**
1. Find correct student email:
   ```sql
   SELECT email, role FROM user_profiles WHERE role = 'student' LIMIT 5;
   ```
2. Update migration SQL with correct email
3. Re-run migration

## Real-World Usage

### Creating System Notifications

When system event occurs (e.g., election created), insert notification:

```sql
-- Example: Election created notification
INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
SELECT 
  id,
  'election',
  'New Election: SRC 2026',
  'A new election has been announced. Click to learn more.',
  '/student-dashboard',
  NOW()
FROM user_profiles
WHERE role = 'student';
```

### Creating User-Specific Notifications

```sql
-- Example: Application decision
INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh'),
  'approval',
  'Application Approved',
  'Your application for WOCOM has been approved!',
  '/profile',
  NOW()
);
```

## Performance Optimization

The following indexes have been created for fast queries:

```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

These ensure:
- Fetching user notifications: O(log n)
- Counting unread: O(log n)
- Sorting by date: O(log n)

## Files Modified/Created

- **src/components/common/Header.tsx** - Notification fetching and display
- **migrate-notifications-table.sql** - Schema migration
- **setup-notifications-complete.sql** - Full setup with sample data
- **NOTIFICATIONS_IMPLEMENTATION_GUIDE.md** - This file

## Next Steps (Optional Enhancements)

1. **Real-time Updates** - Add Supabase Realtime subscriptions for live updates
2. **Notification History** - Create dedicated `/notifications` page
3. **Notification Preferences** - Let users customize notification types
4. **Email Notifications** - Send emails for important events
5. **Notification Cleanup** - Auto-delete read notifications after 30 days

## Support

If notifications aren't working:

1. Check dev console for errors (F12)
2. Run diagnostic SQL queries from troubleshooting section
3. Verify `userId` exists in localStorage after login
4. Ensure `.next` folder is cleared and dev server restarted
5. Try different browser or incognito mode to rule out cache
