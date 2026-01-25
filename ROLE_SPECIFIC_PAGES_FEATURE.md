# Role-Specific Profile & Settings Pages

## Overview
Implemented role-specific Profile and Settings pages for Admin, Commission, and Student users. Each role now has tailored pages that show relevant information and options based on their permissions and responsibilities.

## Implementation

### 1. Updated Header Component
Modified `src/components/common/Header.tsx` to route to role-specific pages:

**Profile Routes:**
- Admin → `/admin-profile`
- Commission → `/commission-profile`
- Student → `/profile`

**Settings Routes:**
- Admin → `/admin-settings`
- Commission → `/commission-settings`
- Student → `/settings`

### 2. Admin Pages

#### Admin Profile (`/admin-profile`)
**Features:**
- Full administrator information display
- Edit personal details (name, phone, department, position)
- Administrator permissions list
- Security options (change password, 2FA, activity log)
- Professional admin-themed design with red accent

**Permissions Displayed:**
- Manage Users
- Manage Elections
- View All Results
- System Configuration
- Import Student Data
- Generate Reports
- Access Audit Logs
- Manage Commission Members

#### Admin Settings (`/admin-settings`)
**Features:**
- **System Settings Tab:**
  - Site name and description
  - File upload limits
  - Session timeout
  - Maintenance mode toggle
  - Registration controls
  - Email verification
  - Notifications toggle
  - Audit log toggle

- **Election Settings Tab:**
  - Default voting duration
  - Minimum/maximum candidates
  - Late voting allowance
  - Voter verification
  - Live results display
  - Result export options

- **Security Settings Tab:**
  - Password policy (min length, complexity)
  - Session duration
  - Max login attempts
  - Lockout duration
  - Two-factor authentication requirement

- **Notifications Tab:**
  - Email notification preferences
  - In-app notification settings
  - System announcements
  - Election updates

### 3. Commission Pages

#### Commission Profile (`/commission-profile`)
**Features:**
- Electoral Commission member information
- Access period display with expiration countdown
- Warning banner when access expires soon (30 days)
- Edit personal details
- Commission permissions list
- Security options
- Commission-themed design with primary accent

**Unique Features:**
- **Access Period Tracking:**
  - Shows start and end dates
  - Displays days remaining
  - Warning when expiring soon
  - Contact admin for extension

**Permissions Displayed:**
- Manage Elections
- Verify Candidates
- Import Voter Data
- View Results
- Generate Reports
- Approve Applications

#### Commission Settings (`/commission-settings`)
**Features:**
- **Notification Preferences:**
  - Email notifications
  - SMS notifications
  - Election alerts
  - Candidate updates
  - Result notifications
  - Weekly reports

- **General Preferences:**
  - Language selection (English, French, Twi)
  - Timezone (Africa/Accra, Africa/Lagos, UTC)
  - Date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)

- **Privacy & Security:**
  - Change password
  - Two-factor authentication
  - Activity log

### 4. Student Pages

#### Student Profile (`/profile`)
**Existing page** - Already implemented
- Student information
- Voting history
- Application status
- Personal details

#### Student Settings (`/settings`)
**Existing page** - Already implemented
- Notification preferences
- Privacy settings
- Account security

## User Experience

### Admin Experience
1. Login as admin
2. Click profile picture dropdown
3. Click "Profile" → Redirected to `/admin-profile`
4. See admin-specific information and permissions
5. Click "Settings" → Redirected to `/admin-settings`
6. Configure system-wide settings

### Commission Experience
1. Login as commission member
2. Click profile picture dropdown
3. Click "Profile" → Redirected to `/commission-profile`
4. See commission information and access period
5. Warning if access expiring soon
6. Click "Settings" → Redirected to `/commission-settings`
7. Configure personal preferences

### Student Experience
1. Login as student
2. Click profile picture dropdown
3. Click "Profile" → Redirected to `/profile`
4. See student information
5. Click "Settings" → Redirected to `/settings`
6. Configure personal settings

## Key Differences by Role

### Admin
- **Focus**: System management and oversight
- **Settings**: System-wide configuration
- **Permissions**: Full access to all features
- **Access**: Permanent, no expiration
- **Theme**: Red accent (error color)

### Commission
- **Focus**: Election management
- **Settings**: Personal preferences
- **Permissions**: Election-specific features
- **Access**: Time-bound with expiration
- **Theme**: Primary yellow accent
- **Unique**: Access period tracking

### Student
- **Focus**: Voting and participation
- **Settings**: Personal preferences
- **Permissions**: Basic user features
- **Access**: Permanent (or until graduation)
- **Theme**: Standard theme

## Protected Routes

All pages are protected with role-based access:

```typescript
// Admin pages
<ProtectedRoute allowedRoles={['admin']}>
  <AdminProfileInteractive />
</ProtectedRoute>

// Commission pages
<ProtectedRoute allowedRoles={['commission']}>
  <CommissionProfileInteractive />
</ProtectedRoute>

// Student pages (existing)
<ProtectedRoute>
  <ProfileInteractive />
</ProtectedRoute>
```

## Files Created/Modified

### Created
- `src/app/admin-profile/page.tsx`
- `src/app/admin-profile/components/AdminProfileInteractive.tsx`
- `src/app/admin-settings/page.tsx`
- `src/app/admin-settings/components/AdminSettingsInteractive.tsx`
- `src/app/commission-profile/page.tsx`
- `src/app/commission-profile/components/CommissionProfileInteractive.tsx`
- `src/app/commission-settings/page.tsx`
- `src/app/commission-settings/components/CommissionSettingsInteractive.tsx`
- `ROLE_SPECIFIC_PAGES_FEATURE.md` (this file)

### Modified
- `src/components/common/Header.tsx` - Added role-based routing logic

## Testing Checklist

### Admin Testing
- [ ] Login as admin
- [ ] Click profile dropdown
- [ ] Click "Profile" - should go to `/admin-profile`
- [ ] Verify admin information displayed
- [ ] Click "Edit Profile"
- [ ] Modify details and save
- [ ] Go back to dashboard
- [ ] Click "Settings" - should go to `/admin-settings`
- [ ] Navigate through all tabs
- [ ] Toggle settings
- [ ] Save settings

### Commission Testing
- [ ] Login as commission member
- [ ] Click profile dropdown
- [ ] Click "Profile" - should go to `/commission-profile`
- [ ] Verify commission information displayed
- [ ] Check access period display
- [ ] Verify days remaining calculation
- [ ] Click "Edit Profile"
- [ ] Modify details and save
- [ ] Go back to dashboard
- [ ] Click "Settings" - should go to `/commission-settings`
- [ ] Toggle notification preferences
- [ ] Change language/timezone
- [ ] Save settings

### Student Testing
- [ ] Login as student
- [ ] Click profile dropdown
- [ ] Click "Profile" - should go to `/profile`
- [ ] Verify student information displayed
- [ ] Click "Settings" - should go to `/settings`
- [ ] Verify student settings displayed

### Cross-Role Testing
- [ ] Login as admin, verify admin pages
- [ ] Logout, login as commission, verify commission pages
- [ ] Logout, login as student, verify student pages
- [ ] Verify no cross-role access (admin can't access commission profile URL directly)

## Production Integration

### Database Updates
When connecting to Supabase, ensure user profiles include:

```sql
-- Add profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_date TIMESTAMP DEFAULT NOW();

-- Add settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'Africa/Accra',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints Needed
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `GET /api/admin/system-settings` - Get system settings (admin only)
- `PUT /api/admin/system-settings` - Update system settings (admin only)

## Related Features
- User Authentication (`src/lib/auth-utils.ts`)
- Protected Routes (`src/components/common/ProtectedRoute.tsx`)
- Time-Bound Access (`TIME_BOUND_ACCESS_FEATURE.md`)
- User Management (`USER_EDIT_FEATURE.md`)

---

**Status**: ✅ Complete
**Date**: January 25, 2026
