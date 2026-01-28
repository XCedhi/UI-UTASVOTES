# User Creation Fix - Complete Summary

## 🔴 Problem
When clicking "Invite User" in Admin System Control → User Management, you get:
```
❌ Failed to create user: Database error creating new user
```

## 🎯 Root Cause
Supabase's `inviteUserByEmail` creates a record in `auth.users` but there was no automatic creation of the corresponding `user_profiles` record. The application expects both records to exist.

## ✅ Solution Overview
**The API route now handles both steps:**
1. Creates the auth user via `inviteUserByEmail`
2. Immediately creates the matching `user_profiles` record
3. If profile creation fails, it cleans up the auth user

**No database trigger needed!** (Supabase restricts trigger creation on `auth.users` table)

---

## 📋 Step-by-Step Fix

### Step 1: Fix Existing Orphaned Users (OPTIONAL)

If you have users that were created before this fix:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/fix-user-creation-simple.sql`
4. Click **Run**
5. Check the results to see how many users were fixed

### Step 2: Test User Invitation

The API route has already been updated, so just test it:

1. Go to **Admin System Control** → **User Management**
2. Click **Invite User**
3. Fill in the form:
   ```
   First Name: Test
   Last Name: Commission
   Email: test.ec@cktutas.edu.gh
   Role: Electoral Commission
   Position: Test Member
   Access Start Date: [Today]
   Access End Date: [30 days from now]
   ```
4. Click **Send Invitation**
5. You should see: `✅ Invitation email sent successfully`
6. The user should appear in the user list immediately

---

## 📁 Files Modified

### Modified Files
1. **`src/app/api/invite-user/route.ts`** - Now creates user_profiles record directly

### New Files (Optional)
1. **`supabase/fix-user-creation-simple.sql`** - Fix existing orphaned users only
2. **`USER_CREATION_FIX_SUMMARY.md`** - This file

---

## 🔍 How It Works

### Before Fix
```
User clicks "Invite User"
    ↓
API calls inviteUserByEmail()
    ↓
Supabase creates auth.users record
    ↓
❌ No user_profiles record created
    ↓
Application tries to fetch user profile
    ↓
❌ ERROR: Database error creating new user
```

### After Fix
```
User clicks "Invite User"
    ↓
API calls inviteUserByEmail()
    ↓
Supabase creates auth.users record
    ↓
✅ API immediately creates user_profiles record
    ↓
Application fetches user profile
    ↓
✅ SUCCESS: User appears in list
```

### Error Handling
```
If user_profiles creation fails:
    ↓
API deletes the auth.users record (cleanup)
    ↓
Returns error to user
    ↓
User can try again
```

---

## 🧪 Testing Checklist

- [ ] Can invite Electoral Commission member
- [ ] Can invite Administrator
- [ ] User appears in user list immediately after invitation
- [ ] User profile has correct role
- [ ] User profile has correct status (pending)
- [ ] User profile has correct access dates (for commission)
- [ ] Invitation email is sent
- [ ] If profile creation fails, auth user is cleaned up

---

## 🐛 Troubleshooting

### Issue: Still getting "Database error creating new user"

**Check browser console for detailed error:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages starting with ❌

**Common causes:**
- RLS policies blocking insert into user_profiles
- Missing SUPABASE_SERVICE_ROLE_KEY in .env
- Invalid email format
- Database connection issues

**Solution:**
```sql
-- Check RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Temporarily disable RLS to test (NOT for production!)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Try inviting user again, then re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: Invitation email not sent

**Check:**
1. `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
2. Email templates configured in Supabase Dashboard → Authentication → Email Templates
3. SMTP settings configured in Supabase Dashboard → Project Settings → Auth

### Issue: User created but can't log in

**Check:**
1. User accepted the invitation email
2. User set their password
3. User is using correct email format (@cktutas.edu.gh)
4. User status is 'active' (not 'pending' or 'inactive')

---

## 📊 What Changed in the API

### Before
```typescript
// Only created auth user
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {...});
// ❌ No user_profiles creation
```

### After
```typescript
// 1. Create auth user
const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {...});

// 2. Create user_profiles record
const { data: profile, error: profileError } = await supabaseAdmin
  .from('user_profiles')
  .insert({
    id: data.user?.id,
    email: email,
    full_name: `${firstName} ${lastName}`,
    role: role,
    status: 'pending',
    // ... other fields
  });

// 3. If profile creation fails, cleanup auth user
if (profileError) {
  await supabaseAdmin.auth.admin.deleteUser(data.user?.id);
  throw new Error('Database error creating new user');
}
```

---

## 🚀 Next Steps

After fixing this issue:

1. **Test thoroughly:**
   - Invite multiple commission members
   - Invite administrators
   - Verify email delivery
   - Test user acceptance flow

2. **Monitor:**
   - Check browser console for any errors
   - Verify no new orphaned users are created
   - Check Supabase logs for issues

3. **Optional cleanup:**
   - Run `fix-user-creation-simple.sql` to fix any existing orphaned users
   - Verify all users have matching profiles

---

## ✨ Success Criteria

You'll know the fix worked when:
- ✅ No more "Database error creating new user" errors
- ✅ Users appear in list immediately after invitation
- ✅ User profiles have correct role and status
- ✅ Invitation emails are sent successfully
- ✅ Browser console shows: `✅ User profile created successfully`
