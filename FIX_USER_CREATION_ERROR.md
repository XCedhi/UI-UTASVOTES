# Fix: "Failed to create user: Database error creating new user"

## Problem
When clicking "Invite User" in the admin panel, you get the error:
```
Failed to create user: Database error creating new user
```

## Root Cause
When Supabase creates a user via `inviteUserByEmail`, it creates a record in `auth.users` but there's no automatic trigger to create the corresponding `user_profiles` record. This causes the application to fail when it tries to fetch the user profile.

## Solution
We need to create a database trigger that automatically creates a `user_profiles` record whenever a new user is created in `auth.users`.

## Steps to Fix

### 1. Run the Database Migration

Go to your Supabase Dashboard:
1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/fix-user-creation-trigger.sql`
4. Click **Run** or press `Ctrl+Enter`

You should see:
```
Success. No rows returned
```

### 2. Verify the Trigger

Run this query to verify the trigger was created:

```sql
-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

### 3. Test User Invitation

1. Go to Admin System Control → User Management
2. Click **Invite User**
3. Fill in the form:
   - First Name: Test
   - Last Name: Commission
   - Email: test.commission@cktutas.edu.gh
   - Role: Electoral Commission
   - Position: Test Member
   - Access Start Date: Today
   - Access End Date: 30 days from now
4. Click **Send Invitation**

You should see:
```
✅ Invitation email sent successfully
```

### 4. Verify User Profile Creation

Run this query in Supabase SQL Editor:

```sql
-- Check if user was created in auth.users
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'test.commission@cktutas.edu.gh';

-- Check if user_profiles record was created
SELECT id, email, full_name, role, status, access_start_date, access_end_date
FROM public.user_profiles
WHERE email = 'test.commission@cktutas.edu.gh';
```

Both queries should return matching records.

## What the Trigger Does

The trigger (`on_auth_user_created`) automatically:
1. Listens for new records in `auth.users`
2. Extracts user metadata from `raw_user_meta_data`
3. Creates a corresponding record in `user_profiles` with:
   - User ID (from auth.users)
   - Email
   - Full name
   - Role (commission/admin)
   - Status (pending)
   - Access dates (for commission members)
   - Position

## API Route Updates

The `invite-user` API route has been updated to:
1. Include `status: 'pending'` in user metadata
2. Add a default position for commission members
3. Wait 1 second after invitation to allow trigger to complete
4. Verify the user profile was created
5. Log warnings if profile creation is delayed (but don't fail the request)

## Troubleshooting

### Error: "trigger already exists"
If you see this error, run:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```
Then run the migration again.

### Error: "permission denied"
Make sure you're running the SQL as a superuser or with sufficient privileges. The trigger needs `SECURITY DEFINER` to work properly.

### User profile not created
Check the Supabase logs:
1. Go to **Logs** → **Postgres Logs**
2. Look for errors related to `handle_new_user` function
3. Common issues:
   - Missing columns in user_profiles table
   - RLS policies blocking the insert
   - Invalid data types in raw_user_meta_data

### Still getting errors?
1. Check browser console for detailed error messages
2. Check Supabase Dashboard → Logs → API Logs
3. Verify SUPABASE_SERVICE_ROLE_KEY is set in `.env`
4. Ensure email is configured in Supabase Dashboard → Authentication → Email Templates

## Testing Checklist

- [ ] Trigger created successfully
- [ ] Function created successfully
- [ ] Can invite commission member
- [ ] Can invite admin
- [ ] User appears in user list immediately
- [ ] User profile has correct role
- [ ] User profile has correct access dates
- [ ] Invitation email is sent
- [ ] User can accept invitation and set password

## Next Steps

After fixing this issue:
1. Test inviting multiple users
2. Verify email delivery
3. Test user acceptance flow
4. Check that invited users can log in
5. Verify role-based access control works

## Related Files

- `supabase/fix-user-creation-trigger.sql` - Database migration
- `src/app/api/invite-user/route.ts` - Updated API route
- `src/app/admin-system-control/users/manage/components/UserManagementInteractive.tsx` - UI component
