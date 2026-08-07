# Election Announcement System

## Overview

When an admin or electoral commission member creates a new election, the system automatically:
1. **Creates an announcement** that appears on the login page for all users
2. **Sends notifications** to all registered users (students, candidates, commission members)
3. **Displays the announcement** prominently with election details

## How It Works

### 1. Election Creation Flow

When you click "Create Election" as admin/commission:

```
Admin/Commission Creates Election
         ↓
Election Record Created in Database
         ↓
Announcement Created (visible on login page)
         ↓
Notifications Sent to All Users
         ↓
Students See Announcement Immediately
```

### 2. Announcement Details

The announcement includes:
- **Title**: "New Departmental Election: [Election Name]" or "New University-Wide Election: [Election Name]"
- **Message**: Full details including:
  - Election name
  - Department (for departmental elections)
  - Nomination start and end dates
  - Voting start date
- **Priority**: High (displayed prominently)
- **Type**: Election (with special icon)

### 3. Where Students See Announcements

#### A. Login Page
- Announcements appear in the "Election Updates" section
- Shows latest 10 active announcements
- Color-coded by type and priority
- Includes timestamp

#### B. Student Dashboard (Future Enhancement)
- Notifications bell icon in header
- Unread notification count
- Notification center with all announcements

## Example Announcement

### For Departmental Election:
```
Title: New Departmental Election: CAS-G 2026
Message: CAS-G 2026 has been scheduled for Department of Business Computing. 
         Nominations open on 20/05/2026 and close on 26/05/2026. 
         Voting starts 02/06/2026.
Priority: High
Type: Election
```

### For University-Wide Election:
```
Title: New University-Wide Election: Student Council Elections 2026
Message: Student Council Elections 2026 has been scheduled for all students. 
         Nominations open on 01/06/2026 and close on 15/06/2026. 
         Voting starts 20/06/2026.
Priority: High
Type: Election
```

## Database Tables

### Announcements Table
```sql
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- 'election', 'deadline', 'result', 'system', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  type TEXT NOT NULL, -- 'election', 'deadline', 'result', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Implementation

The election creation API (`/api/elections/create`) automatically:

```typescript
// 1. Create the election
const { data: election } = await supabase
  .from('elections')
  .insert({ ...electionData })
  .select()
  .single();

// 2. Create announcement
await supabase
  .from('announcements')
  .insert({
    type: 'election',
    title: `New ${election_type} Election: ${name}`,
    message: `${name} has been scheduled...`,
    priority: 'high',
    is_active: true,
  });

// 3. Send notifications to all users
const { data: users } = await supabase
  .from('user_profiles')
  .select('id');

const notifications = users.map(user => ({
  user_id: user.id,
  title: 'New Election Created',
  message: `${name} has been scheduled...`,
  type: 'election',
  is_read: false,
}));

await supabase.from('notifications').insert(notifications);
```

## Testing

Run the test script to verify announcements are working:

```bash
node test-election-announcement.js
```

This will show:
- Latest election announcements
- Notifications sent to users
- Recent elections created

## User Experience

### For Students:
1. **Login Page**: See latest election announcements immediately
2. **Dashboard**: Receive notification about new election
3. **Notification Bell**: Shows unread count
4. **Announcement Details**: Click to see full election information

### For Admins/Commission:
1. Create election through the form
2. System automatically creates announcement
3. All users are notified instantly
4. No manual announcement creation needed

## Announcement Types & Icons

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| election | CheckBadgeIcon | Primary | New elections, election updates |
| deadline | ClockIcon | Warning | Registration/voting deadlines |
| result | ChartBarIcon | Success | Election results published |
| system | InformationCircleIcon | Accent | System maintenance, updates |
| fee_update | CurrencyDollarIcon | Secondary | Fee structure changes |
| general | MegaphoneIcon | Primary | General announcements |

## Priority Levels

| Priority | Badge Color | When to Use |
|----------|-------------|-------------|
| High | Red | Critical deadlines, new elections |
| Medium | Yellow | Important updates, reminders |
| Low | Green | General information, tips |

## Features

✅ **Automatic Creation**: No manual work needed
✅ **Real-time Updates**: Students see announcements immediately
✅ **Multi-channel**: Login page + notifications
✅ **Targeted Messaging**: Department-specific for departmental elections
✅ **Priority System**: Important announcements stand out
✅ **Timestamp Display**: Shows when announcement was published
✅ **Active/Inactive Toggle**: Control announcement visibility

## Future Enhancements

- [ ] Email notifications for new elections
- [ ] SMS notifications for critical deadlines
- [ ] Push notifications (PWA)
- [ ] Announcement scheduling (publish at specific time)
- [ ] Rich text formatting in announcements
- [ ] Announcement categories/filters
- [ ] User preferences for notification types
- [ ] Announcement read receipts

## Troubleshooting

### Announcements Not Showing
1. Check if announcement was created: `SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5;`
2. Verify `is_active = true`
3. Check RLS policies on announcements table
4. Clear browser cache and refresh

### Notifications Not Received
1. Check notifications table: `SELECT * FROM notifications WHERE type = 'election' ORDER BY created_at DESC;`
2. Verify user_profiles table has users
3. Check RLS policies on notifications table
4. Verify service role key is configured

### Test the System
```bash
# Run test script
node test-election-announcement.js

# Check database directly
psql -h [host] -U [user] -d [database]
SELECT * FROM announcements WHERE type = 'election' ORDER BY created_at DESC LIMIT 5;
SELECT COUNT(*) FROM notifications WHERE type = 'election';
```

## Summary

The election announcement system is **fully automated** and requires no manual intervention. When you create an election:

1. ✅ Announcement is created automatically
2. ✅ All users are notified
3. ✅ Students see it on login page
4. ✅ Notifications appear in dashboard
5. ✅ No additional steps needed

**Just create the election, and students will be informed!**
