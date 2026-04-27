# Fix Login After Supabase Pause - Complete Solution

## Problem Summary
After Supabase project was paused and resumed, login credentials stopped working. This is because Supabase Auth stores passwords in the `auth.users` table, and when the project pauses, authentication state can be affected.

## Current Status

### Working Accounts ✅
- **Commission**: `commission@cktutas.edu.gh` / `Commission@2026` - WORKS!
- **Student**: `student@cktutas.edu.gh` / `Student@2026` - WORKS!

### Not Working ❌
- **Admin**: `admin@cktutas.edu.gh` - Cannot be created (database constraint error)

## How Supabase Auth Works

Your login IS already using the database! Here's how:

1. **User enters email/password** → Login form
2. **Supabase Auth checks** → `auth.users` table (this IS in your database)
3. **Password verified** → Supabase compares hashed password
4. **Profile fetched** → `user_profiles` table
5. **User redirected** → Based on role in profile

So authentication is 100% database-driven through Supabase Auth.

## Solution: Use Working Accounts

Since commission and student accounts work, you can:

### Option 1: Login as Commission (Recommended)
```
Email: commission@cktutas.edu.gh
Password: Commission@2026
Dashboard: /electoral-commission-panel
```

Commission has almost all the same features as admin:
- Create and manage elections
- Review candidate applications
- Import student data
- View analytics
- Generate reports

### Option 2: Login as Student
```
Email: student@cktutas.edu.gh
Password: Student@2026
Dashboard: /student-dashboard
```

### Option 3: Promote Existing User to Admin

If you have another user in the system, you can promote them:

1. Login to Supabase Dashboard
2. Go to **Table Editor** → **user_profiles**
3. Find a user (like one of the existing ones: `rvaaib.@cktutas.edu.gh` or `jkorkugah23.stu@cktutas.edu.gh`)
4. Edit their row and change `role` to `admin`
5. Login with that user's credentials

## Why Admin Creation Fails

The admin email `admin@cktutas.edu.gh` has a constraint issue in the database. This could be:
- Email already exists in auth.users but with different ID
- Trigger constraint preventing creation
- Database integrity check failing

## Permanent Fix: Create Admin via Supabase Dashboard

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **Add user** → **Create new user**
5. Fill in:
   - Email: `admin@cktutas.edu.gh`
   - Password: `Admin@2026`
   - Auto Confirm User: ✅ **CHECK THIS BOX**
   - User Metadata (optional):
     ```json
     {
       "role": "admin",
       "full_name": "System Administrator"
     }
     ```
6. Click **Create user**
7. Go to **Table Editor** → **user_profiles**
8. Find the newly created user
9. Update the `role` field to `admin`

## Verify Your Setup

Run this to see all users:

```bash
node diagnose-login-issue.js
```

This will show:
- All users in auth.users
- All profiles in user_profiles
- Which credentials work

## Understanding the Architecture

```
┌─────────────────────────────────────────────────┐
│           SUPABASE AUTHENTICATION               │
├─────────────────────────────────────────────────┤
│                                                 │
│  auth.users (Supabase managed)                  │
│  ├─ Stores: email, encrypted_password, id      │
│  ├─ Handles: Login, password reset, sessions   │
│  └─ This IS your database authentication!      │
│                                                 │
│  user_profiles (Your table)                     │
│  ├─ Stores: role, full_name, student_id, etc   │
│  ├─ Links to auth.users via id (foreign key)   │
│  └─ Determines dashboard access                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Login Flow Explained

```typescript
// 1. User submits login form
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'commission@cktutas.edu.gh',
  password: 'Commission@2026'
});
// ↓ Supabase checks auth.users table in database
// ↓ Verifies password hash
// ↓ Returns session token

// 2. Fetch user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', data.user.id)
  .single();
// ↓ Gets role from database

// 3. Redirect based on role
if (profile.role === 'commission') {
  router.push('/electoral-commission-panel');
} else if (profile.role === 'admin') {
  router.push('/admin-dashboard');
}
```

## Testing Credentials

### Test Commission Login
```bash
# In browser
http://localhost:4028/login

Email: commission@cktutas.edu.gh
Password: Commission@2026

Expected: Redirect to /electoral-commission-panel
```

### Test Student Login
```bash
# In browser
http://localhost:4028/login

Email: student@cktutas.edu.gh
Password: Student@2026

Expected: Redirect to /student-dashboard
```

## Troubleshooting

### "Invalid login credentials"
- Password was reset when Supabase paused
- Use the reset passwords we just set
- Commission and Student should work now

### "User not found"
- User doesn't exist in auth.users
- Create via Supabase Dashboard
- Or use existing working accounts

### "Permission denied"
- Profile doesn't exist in user_profiles
- Or role is not set correctly
- Check Table Editor → user_profiles

## Quick Commands

```bash
# Check all users and test login
node diagnose-login-issue.js

# Reset commission password
node reset-commission-password.js

# Reset all passwords
node reset-all-user-passwords.js
```

## Summary

✅ **Your login IS using the database** (Supabase Auth = database auth)
✅ **Commission account works** - use this for now
✅ **Student account works** - for testing student features
❌ **Admin account has constraint issue** - create via dashboard or promote existing user

**Recommended Action**: Login as commission@cktutas.edu.gh with password Commission@2026 and start using the system. Commission has all the features you need for election management.

---

**Last Updated**: January 2026
**Status**: Commission and Student accounts working
