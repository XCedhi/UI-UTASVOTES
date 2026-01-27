# Role Update & Access Control Guide

## Overview

This guide explains how role updates work, when users get access to their new roles, and the email notification system.

---

## 1. Email Notifications ✅ NOW IMPLEMENTED

### What Happens When Admin Updates a User

When an admin edits a user's role or status:

1. **Database is updated** immediately
2. **Email is sent** to the user automatically
3. **User is notified** about the changes

### Email Content Includes:

- ✅ New role assignment
- ✅ Account status (active/inactive)
- ✅ Commission access dates (if applicable)
- ✅ Important instructions to log out and log back in
- ✅ Login button link

### Email Templates:

**For Role Changes:**
- Shows old role → new role
- Explains new permissions
- Provides login link

**For Status Changes:**
- Active: Welcome message with access confirmation
- Inactive: Deactivation notice with contact info

**For Commission Members:**
- Shows access start and end dates
- Warns about automatic downgrade after end date

---

## 2. Role-Based Access Control

### How It Works

The system uses **localStorage** to store user session data including:
- User role
- Email
- Name
- Access dates (for commission)

### Important: Users Must Re-Login

⚠️ **CRITICAL**: When an admin updates a user's role, the user **MUST log out and log back in** for the changes to take effect.

**Why?**
- Role information is stored in localStorage during login
- Updating the database doesn't automatically update localStorage
- The user's browser still has the old role cached

### Access Flow:

```
1. Admin updates user role in database
   ↓
2. Email sent to user
   ↓
3. User receives email notification
   ↓
4. User clicks "Log In" button in email
   ↓
5. User logs out (if already logged in)
   ↓
6. User logs back in
   ↓
7. New role is loaded from database into localStorage
   ↓
8. User now has access to new role's features
```

---

## 3. Role-Based Route Protection

### Access Rules:

**Admin Role:**
- ✅ Full access to everything
- ✅ Admin Dashboard
- ✅ System Control Panel
- ✅ User Management
- ✅ All other pages

**Commission Role:**
- ✅ Electoral Commission Panel
- ✅ Election Management
- ✅ Candidate Applications
- ✅ Student Import
- ✅ Election Results
- ❌ Admin Dashboard (blocked)
- ❌ System Control Panel (blocked)

**Student/Candidate Role:**
- ✅ Student Dashboard
- ✅ Voting Interface
- ✅ Campaign Feed
- ✅ Election Results
- ✅ Profile Settings
- ❌ Admin Dashboard (blocked)
- ❌ System Control Panel (blocked)
- ❌ Electoral Commission Panel (blocked)

### Route Protection Implementation:

**File**: `src/components/common/ProtectedRoute.tsx`

- Checks user role from localStorage
- Compares against allowed routes
- Redirects unauthorized users to their dashboard
- Shows loading screen during verification

---

## 4. Testing Role Updates

### Test Scenario 1: Promote Student to Commission

1. **As Admin:**
   - Go to User Management
   - Find a student user
   - Click "Edit Role"
   - Change role to "Commission"
   - Set access dates
   - Click "Save Changes"

2. **Check Email:**
   - User receives email notification
   - Email shows new role: "Electoral Commission Member"
   - Email shows access period
   - Email has "Log In" button

3. **As User:**
   - Log out if currently logged in
   - Log back in with credentials
   - Should now see Electoral Commission Panel
   - Can access commission features

### Test Scenario 2: Deactivate User

1. **As Admin:**
   - Go to User Management
   - Find an active user
   - Click "Deactivate"
   - Confirm action

2. **Check Email:**
   - User receives deactivation email
   - Email shows status: "Inactive"
   - Email explains access is revoked

3. **As User:**
   - Try to log in
   - Should be blocked or have limited access
   - Cannot access protected features

### Test Scenario 3: Activate User

1. **As Admin:**
   - Go to User Management
   - Find an inactive user
   - Click "Activate"
   - Confirm action

2. **Check Email:**
   - User receives activation email
   - Email shows status: "Active"
   - Email confirms access restored

3. **As User:**
   - Log out and log back in
   - Should now have full access
   - Can access all role-appropriate features

---

## 5. Commission Access Expiry

### Time-Bound Access

Commission members have **temporary access** with start and end dates.

**Automatic Downgrade:**
- System checks access dates on login
- If current date > end date, user is downgraded to student
- User is redirected to student dashboard
- localStorage is updated automatically

**Implementation:**
- `src/lib/role-management.ts` - `getEffectiveRole()` function
- Checks on every page load
- No manual intervention needed

---

## 6. Email Configuration

### Required Environment Variables:

```env
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email "from" address
EMAIL_FROM=UTASVotes <onboarding@resend.dev>

# Site URL for email links
NEXT_PUBLIC_SITE_URL=http://localhost:4028
```

### Email Service: Resend

- Already installed: `resend@^6.8.0`
- API route: `/api/send-role-update-email`
- Called automatically from `/api/admin/update-user`

---

## 7. Troubleshooting

### User Says "I Still Have Old Role"

**Solution:**
1. Ask user to log out completely
2. Clear browser cache (optional)
3. Log back in
4. New role should load

### Email Not Received

**Check:**
1. ✅ `RESEND_API_KEY` is set in `.env`
2. ✅ Email address is valid
3. ✅ Check spam/junk folder
4. ✅ Check Resend dashboard for delivery status

### User Can't Access New Role Features

**Check:**
1. ✅ User logged out and back in?
2. ✅ Database shows correct role?
3. ✅ User status is "active"?
4. ✅ Commission access dates are valid (if applicable)?

### Email Fails But User Updated

**Behavior:**
- User update succeeds even if email fails
- Warning logged in console
- Admin sees success message
- User just won't get email notification

**Manual Fix:**
- Admin can manually notify user
- Or resend email from Resend dashboard

---

## 8. API Endpoints

### Update User Role
**POST** `/api/admin/update-user`

**Request:**
```json
{
  "userId": "uuid",
  "role": "commission",
  "status": "active",
  "accessStartDate": "2026-01-27T00:00:00Z",
  "accessEndDate": "2026-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { ... }
}
```

### Send Role Update Email
**POST** `/api/send-role-update-email`

**Request:**
```json
{
  "email": "user@cktutas.edu.gh",
  "name": "John Doe",
  "newRole": "commission",
  "newStatus": "active",
  "accessStartDate": "2026-01-27T00:00:00Z",
  "accessEndDate": "2026-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "emailId": "resend-email-id"
}
```

---

## 9. Files Modified/Created

### New Files:
1. ✅ `src/app/api/send-role-update-email/route.ts` - Email notification API
2. ✅ `ROLE_UPDATE_AND_ACCESS_GUIDE.md` - This documentation

### Modified Files:
1. ✅ `src/app/api/admin/update-user/route.ts` - Added email notification call

### Existing Files (Reference):
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/common/ProtectedRoute.tsx` - Route protection
- `src/lib/auth-utils.ts` - Role-based access logic
- `src/lib/role-management.ts` - Commission expiry logic

---

## 10. Summary

### What Works Now:

✅ **Database Updates**: Instant, real-time
✅ **Email Notifications**: Automatic on role/status change
✅ **Role-Based Access**: Enforced on all protected routes
✅ **Commission Expiry**: Automatic downgrade after end date
✅ **UI Updates**: Immediate refresh after admin changes

### What Users Must Do:

⚠️ **Log out and log back in** after role change to get new permissions

### What Admins Should Know:

- Email is sent automatically (no manual action needed)
- User must re-login for changes to take effect
- Commission access expires automatically
- All changes are logged and auditable

---

## Need Help?

- Check console logs for detailed error messages
- Verify environment variables are set
- Test with a non-admin user account
- Check Resend dashboard for email delivery status
