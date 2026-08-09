# 🔔 Notifications Quick Setup

## What's Done ✅

Real notifications are fully implemented in the Header component and ready to use. The system will:
- Fetch notifications from database for logged-in user
- Display unread count badge
- Show notification type icons (election, deadline, result, etc.)
- Update when notifications are marked as read
- Navigate to relevant pages when clicked

## Setup (Copy-Paste 3 Steps)

### Step 1: Run Migration SQL
Go to **Supabase Dashboard → SQL Editor** and paste entire contents of:
```
setup-notifications-complete.sql
```

This adds the required columns and creates 5 sample notifications.

### Step 2: Test Locally
```bash
# Clear cache
Remove-Item -Path .next -Recurse -Force

# Restart dev server  
npm run dev
```

### Step 3: Login & Check
1. Open http://localhost:4028
2. Login: `student@cktutas.edu.gh` / `Student@2026`
3. Click bell icon 🔔 → should see "5" badge and notifications list

## Files

| File | Purpose |
|------|---------|
| `setup-notifications-complete.sql` | Full setup: schema + sample data |
| `migrate-notifications-table.sql` | Schema only (no sample data) |
| `NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` | Detailed docs & troubleshooting |
| `verify-notifications-setup.js` | Verify setup (run: `node verify-notifications-setup.js`) |

## How to Create Notifications

**Option 1: SQL (Recommended for system events)**
```sql
INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
VALUES (
  (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh'),
  'election',
  'New Election: SRC 2026',
  'Voting is now open. Click to vote.',
  '/voting-interface',
  NOW()
);
```

**Option 2: From API/Application Code**
```typescript
// After creating an application or event:
await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    type: 'approval',
    title: 'Application Approved',
    message: 'Your application for WOCOM has been approved!',
    action_url: '/profile',
    created_at: new Date()
  });
```

## Notification Types

- `election` - Election announcements
- `deadline` - Time-sensitive deadlines  
- `result` - Election results available
- `approval` - Application approved
- `application` - Application status updates
- `system` - System updates/maintenance

## Common Tasks

### View all notifications for a user
```sql
SELECT * FROM notifications 
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh')
ORDER BY created_at DESC;
```

### Mark all as read
```sql
UPDATE notifications 
SET is_read = true, read_at = NOW()
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'student@cktutas.edu.gh');
```

### Delete old notifications
```sql
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';
```

## Troubleshooting

**No notifications showing?**
- Run the SQL migration first
- Check browser console (F12) for errors
- Verify user is logged in: check localStorage has `userId`
- Try: `Remove-Item .next -Recurse -Force` then restart dev server

**Can't mark as read?**
- Check RLS policies: 
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'notifications';
  ```
- Should see "Users can update own notifications" policy

**Still having issues?**
- See detailed troubleshooting in `NOTIFICATIONS_IMPLEMENTATION_GUIDE.md`
- Or run: `node verify-notifications-setup.js`

## Code Location

The notification logic is in: **`src/components/common/Header.tsx`**

Key functions:
- `fetchNotifications()` - Fetch from database
- `handleMarkAsRead()` - Update notification as read
- `handleNotificationClick()` - Navigate on click
- `getNotificationIcon()` - Icon by type
- `getNotificationColor()` - Color by type

---

**That's it!** The notifications system is production-ready. Just run the SQL and test.
