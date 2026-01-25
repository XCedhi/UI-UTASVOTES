# Time-Bound Access for Commission Members

## Overview
Commission members are granted temporary access that automatically expires after a specified period. When access expires, users are automatically downgraded to student role, ensuring commission privileges are time-limited.

## Key Concept
**Commission access is temporary, Admin access is permanent.**

- **Commission Members**: Time-bound access with automatic role downgrade
- **Administrators**: Permanent access with no expiration
- **Students**: Default role after commission access expires

## Feature Implementation

### 1. Invitation Form Updates

#### New Fields (Commission Only)
- **Access Start Date** (required)
  - Defaults to today's date
  - Cannot be in the past
  - Determines when commission privileges begin

- **Access End Date** (required)
  - Must be after start date
  - Determines when commission privileges expire
  - Triggers automatic role downgrade

#### Visual Indicators
- Warning-styled section highlighting time-bound nature
- Duration calculator showing total days of access
- Info box showing automatic expiration in invitation details

### 2. Automatic Role Downgrade System

#### How It Works
1. **On Login/Session Check**: System checks if commission access has expired
2. **If Expired**: User role automatically changes to 'student'
3. **Access Revoked**: Commission-specific routes become inaccessible
4. **Notification**: User sees their access has expired (production)

#### Implementation Files
- `src/lib/role-management.ts` - Core logic for role expiration
- `src/lib/auth-utils.ts` - Session management with expiration checks

### 3. Role Management Utilities

#### Key Functions

**`hasAccessExpired(accessEndDate)`**
- Checks if current date is past the end date
- Returns boolean

**`isAccessExpiringSoon(accessEndDate)`**
- Checks if access expires within 7 days
- Used for warning notifications

**`getDaysUntilExpiration(accessEndDate)`**
- Calculates remaining days
- Used for countdown displays

**`getEffectiveRole(user)`**
- Determines actual role based on expiration
- Called on every authentication check
- Automatically downgrades expired commission members

**`getAccessStatusBadge(accessEndDate)`**
- Returns badge info (label, color, icon)
- Statuses: Permanent, Active, Expiring Soon, Expired

### 4. Database Schema (Production)

#### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN access_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN access_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN original_role VARCHAR(20);
ALTER TABLE users ADD COLUMN access_downgraded BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN downgraded_at TIMESTAMP;

-- Index for efficient expiration queries
CREATE INDEX idx_users_access_end_date ON users(access_end_date) 
WHERE role = 'commission' AND access_downgraded = FALSE;
```

#### Pending Invitations Table Updates
```sql
ALTER TABLE pending_invitations ADD COLUMN access_start_date TIMESTAMP;
ALTER TABLE pending_invitations ADD COLUMN access_end_date TIMESTAMP;
ALTER TABLE pending_invitations ADD COLUMN original_role VARCHAR(20) DEFAULT 'student';
```

### 5. Automated Background Job (Production)

#### Scheduled Task
Run daily (or hourly) to process expired access:

```typescript
// Example cron job (runs daily at midnight)
import { processExpiredAccess } from '@/lib/role-management';

// Using node-cron or similar
cron.schedule('0 0 * * *', async () => {
  console.log('Running expired access check...');
  await processExpiredAccess();
});
```

#### Process Flow
1. Query users with `role = 'commission'` and `access_end_date < NOW()`
2. Update role to `original_role` (usually 'student')
3. Set `access_downgraded = TRUE`
4. Send notification email to user
5. Log action in audit trail
6. Revoke commission-specific permissions

### 6. User Experience

#### For Commission Members

**During Active Period**
- Full commission access
- Can see access end date in profile
- Receives warning 7 days before expiration

**When Access Expires**
- Automatically logged out (or redirected on next action)
- Role changes to 'student'
- Receives email notification
- Can no longer access commission routes
- Redirected to student dashboard

**After Expiration**
- Can still login as student
- All student features available
- Commission features inaccessible
- Can be re-invited if needed

#### For Administrators

**When Inviting**
- Must set access period for commission members
- Sees duration calculator
- Gets confirmation of automatic expiration

**Managing Users**
- Can see access status badges
- Can extend access before expiration
- Can manually revoke access early
- Can view access history

### 7. Notification System (Production)

#### Email Notifications

**7 Days Before Expiration**
```
Subject: Your Commission Access Expires Soon

Dear [Name],

Your Electoral Commission access will expire in 7 days on [End Date].

After this date, your account will automatically revert to student access.

If you need extended access, please contact the system administrator.
```

**On Expiration Day**
```
Subject: Commission Access Expired

Dear [Name],

Your Electoral Commission access has expired as of [End Date].

Your account has been automatically changed to student access. You can still:
- Vote in elections
- View election results
- Access campaign information

Thank you for your service on the Electoral Commission.
```

**Manual Extension**
```
Subject: Commission Access Extended

Dear [Name],

Your Electoral Commission access has been extended.

New End Date: [New End Date]

You will continue to have full commission privileges until this date.
```

### 8. Security Considerations

#### Access Control
- Route protection checks effective role (with expiration)
- API endpoints validate role on every request
- Session tokens include expiration timestamp
- Expired users cannot bypass with cached credentials

#### Audit Trail
All role changes logged with:
- User ID
- Action type (automatic_downgrade, manual_extension, etc.)
- Timestamp
- Previous role
- New role
- Reason
- Performed by (system or admin ID)

### 9. Admin Features (Future Enhancement)

#### User Management Enhancements

**Access Extension**
- Button to extend access before expiration
- Modal to set new end date
- Requires admin approval
- Logged in audit trail

**Early Revocation**
- Button to revoke access immediately
- Confirmation dialog
- Reason field (optional)
- Immediate role downgrade

**Access History**
- View all access periods for a user
- See who granted/extended/revoked access
- Timeline view of role changes

**Bulk Operations**
- Extend access for multiple users
- Export users with expiring access
- Batch notifications

### 10. Testing Scenarios

#### Manual Testing
- [ ] Invite commission member with access period
- [ ] Verify start and end dates are required
- [ ] Verify end date must be after start date
- [ ] Check duration calculator displays correctly
- [ ] Verify admin invitation has no access period fields
- [ ] Login as commission member before start date
- [ ] Login as commission member during active period
- [ ] Simulate expired access (change system date or database)
- [ ] Verify automatic downgrade to student role
- [ ] Verify commission routes become inaccessible
- [ ] Verify student routes remain accessible

#### Integration Testing (Production)
- [ ] Verify database records created with access dates
- [ ] Test background job processes expired users
- [ ] Verify notification emails sent
- [ ] Test access extension functionality
- [ ] Test early revocation functionality
- [ ] Verify audit logs created
- [ ] Test role checks on API endpoints
- [ ] Test session validation with expiration

### 11. Configuration

#### Default Access Duration
Recommended: 12 months (one academic year)

```typescript
// In invitation form or config
const DEFAULT_ACCESS_DURATION_MONTHS = 12;
const EXPIRATION_WARNING_DAYS = 7;
```

#### Suggested Durations
- **One Semester**: 4-6 months
- **One Academic Year**: 12 months
- **Election Cycle**: 6-18 months (varies)
- **Custom**: Admin can set any period

### 12. Migration Plan (Existing Users)

For existing commission members without access dates:

```sql
-- Set default end date (1 year from now) for existing commission members
UPDATE users 
SET 
  access_start_date = NOW(),
  access_end_date = NOW() + INTERVAL '1 year',
  original_role = 'student'
WHERE 
  role = 'commission' 
  AND access_end_date IS NULL;
```

### 13. UI Components

#### Access Status Badge
Shows in user profile and management table:
- 🟢 **Active** - Access valid
- 🟡 **Expiring Soon** - Less than 7 days remaining
- 🔴 **Expired** - Access ended

#### Countdown Display
In commission member's profile:
```
Commission Access
⏰ 45 days remaining
Expires: March 15, 2026
```

#### Warning Banner
Shown to commission members 7 days before expiration:
```
⚠️ Your commission access expires in 7 days. Contact admin if you need an extension.
```

## Files Modified/Created

### Created
- `src/lib/role-management.ts` - Role expiration utilities
- `TIME_BOUND_ACCESS_FEATURE.md` - This documentation

### Modified
- `src/app/admin-system-control/users/manage/components/UserManagementInteractive.tsx` - Added access period fields
- `src/lib/auth-utils.ts` - Added expiration checking to session management

## Production Checklist

- [ ] Update database schema with access date columns
- [ ] Implement background job for automatic downgrade
- [ ] Set up email notification system
- [ ] Add access extension UI for admins
- [ ] Add access status display in user profile
- [ ] Add warning banner for expiring access
- [ ] Implement audit logging
- [ ] Test automatic downgrade flow
- [ ] Test notification delivery
- [ ] Document admin procedures
- [ ] Train administrators on access management

## Benefits

1. **Security**: Commission access is temporary and automatically revoked
2. **Compliance**: Ensures only authorized users have elevated privileges
3. **Automation**: No manual intervention needed for role downgrades
4. **Transparency**: Clear access periods visible to all parties
5. **Flexibility**: Admins can extend or revoke access as needed
6. **Audit Trail**: Complete history of access changes

## Related Features
- User Invitation System (`USER_INVITATION_FEATURE.md`)
- Role-Based Authentication (`src/lib/auth-utils.ts`)
- Protected Routes (`src/components/common/ProtectedRoute.tsx`)

---

**Status**: ✅ Complete (UI/UX + Core Logic)
**Next**: Backend Integration + Background Job Setup
**Date**: January 25, 2026
