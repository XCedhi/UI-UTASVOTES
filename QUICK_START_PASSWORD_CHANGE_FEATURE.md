# Quick Start: Automatic Password Change Feature

## What This Does

When you import students into the system:
1. ✅ System creates account with temporary password
2. ✅ Sets role to "student" automatically
3. ✅ Sends welcome email with credentials
4. ✅ Forces password change on first login
5. ✅ Student can then access dashboard normally

## Setup (3 Steps)

### Step 1: Run SQL Script (2 minutes)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `add-password-change-flag.sql`
4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

### Step 2: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C if running)
# Start fresh
npm run dev
```

### Step 3: Test It! (5 minutes)

1. **Import a test student:**
   - Login as admin
   - Go to User Management → Import Students
   - Upload Excel with one test student
   - Note the temporary password shown in results

2. **Test student login:**
   - Logout
   - Login with student email and temporary password
   - You'll be redirected to password change page
   - Create a new password (must meet requirements)
   - You'll be redirected to Student Dashboard

3. **Verify it works:**
   - Logout again
   - Login with new password
   - Should go directly to dashboard (no password change prompt)

## That's It!

The feature is now active. Every new student imported will:
- Get a secure temporary password
- Receive a welcome email (check console for now)
- Be forced to change password on first login

## What Students See

### 1. Welcome Email
```
Subject: Welcome to UTASVotes - Your Account Details

Hello [Student Name],

Your account has been created!

Account Details:
- Student ID: 12345678
- Email: student@cktutas.edu.gh
- Department: Computer Science
- Role: Student

Temporary Password: [SecurePass123!]

⚠️ You must change this password on first login.

[Login to UTASVotes Button]
```

### 2. First Login
- Enter email and temporary password
- Automatically redirected to "Change Password" page
- Cannot access dashboard until password changed

### 3. Password Change Page
- Shows warning: "Password Change Required"
- Three fields: Current Password, New Password, Confirm Password
- Password requirements checklist
- Submit button

### 4. After Password Change
- Success message
- Automatic redirect to Student Dashboard
- Can now use system normally

## Password Requirements

Students must create passwords with:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (!@#$%^&*)

## Troubleshooting

**Q: Student says they can't login**
A: Check console for temporary password, or reset it in Supabase Dashboard

**Q: Password change page not showing**
A: Make sure you ran the SQL script in Step 1

**Q: Email not sending**
A: Emails currently log to console. For production, integrate email service (see main documentation)

**Q: Student can access dashboard without changing password**
A: Clear browser cache and localStorage, try again

## Check If It's Working

Run this in Supabase SQL Editor:
```sql
-- Check if column exists
SELECT requires_password_change 
FROM user_profiles 
WHERE role = 'student' 
LIMIT 5;
```

Should show `true` for newly created students.

## Next Steps

1. ✅ Test with a few students
2. ✅ Verify password change works
3. ✅ Check that new passwords work for login
4. 📧 Set up email service for production (optional)
5. 📊 Monitor password change completion rates

## Need Help?

Check the full documentation: `AUTOMATIC_USER_CREATION_WITH_PASSWORD_CHANGE.md`

---

**Status**: ✅ Ready to use after running SQL script!
