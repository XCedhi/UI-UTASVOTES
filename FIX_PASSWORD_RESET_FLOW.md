# Fix Password Reset Flow - Complete Guide

## Problem
Password reset links are showing as "invalid" even though they were just sent. Users cannot reset their passwords.

## Root Cause
1. Supabase redirect URLs not configured properly
2. Reset token validation failing
3. Site URL mismatch between environment and Supabase settings

## Solution

### Step 1: Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `inogysmdiergapyvavbx`
3. Navigate to: **Authentication** → **URL Configuration**
4. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:4028/reset-password
   http://localhost:4028/**
   ```
5. Set **Site URL** to: `http://localhost:4028`
6. Click **Save**

### Step 2: Configure Email Templates (Optional but Recommended)

1. In Supabase Dashboard, go to: **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Make sure the template includes: `{{ .ConfirmationURL }}`
4. The default template should work, but you can customize it

### Step 3: Test the Flow

1. Go to: http://localhost:4028/forgot-password
2. Enter: `commission@cktutas.edu.gh`
3. Click "Send Reset Link"
4. Check your email (or Supabase logs if email isn't configured)
5. Click the reset link
6. You should see the reset password form
7. Enter new password and confirm
8. Password should update successfully

## Alternative: Manual Password Reset via Supabase Dashboard

If email isn't working, you can reset passwords manually:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user (e.g., `commission@cktutas.edu.gh`)
3. Click the three dots (⋮) next to the user
4. Select **Reset Password**
5. Choose "Send reset password email" OR "Set new password"
6. If setting manually, enter: `Commission@2026`

## Testing Credentials

After fixing, test with these accounts:

### Commission Account (Already Works)
```
Email: commission@cktutas.edu.gh
Password: Commission@2026
```

### Create Admin Account

Since admin doesn't exist in auth.users, create it:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@cktutas.edu.gh`
   - Password: `Admin@2026`
   - Auto Confirm User: ✅ (check this)
4. Click **Create user**
5. The trigger will automatically create the profile
6. Update the role:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin'
   WHERE email = 'admin@cktutas.edu.gh';
   ```

## Verification Script

Run this to verify everything works:

```bash
node test-password-reset.js
```

## Common Issues

### Issue 1: "Invalid or expired reset link"
**Solution**: Make sure redirect URL is added in Supabase Dashboard

### Issue 2: Email not received
**Solution**: 
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify email settings in Supabase
- Check spam folder
- Use manual password reset as fallback

### Issue 3: Password reset succeeds but login still fails
**Solution**: 
- Clear browser cache and cookies
- Make sure you're using the NEW password
- Check if user exists in both auth.users AND user_profiles

### Issue 4: "Database error creating new user"
**Solution**: User might already exist with different ID. Delete orphaned profile first:
```sql
DELETE FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';
```
Then create user in Supabase Dashboard.

## Production Deployment

When deploying to production:

1. Update `.env`:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

2. Update Supabase redirect URLs:
   ```
   https://your-domain.com/reset-password
   https://your-domain.com/**
   ```

3. Set Site URL in Supabase to: `https://your-domain.com`

4. Configure custom SMTP (optional):
   - Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
   - Use your own email service for better deliverability

## Security Notes

- Reset links expire after 1 hour (Supabase default)
- Links can only be used once
- Password must meet complexity requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

## Support

If issues persist:
1. Check browser console for errors
2. Check Supabase logs
3. Verify environment variables are loaded
4. Try manual password reset via dashboard
5. Contact Supabase support if needed

---

**Last Updated**: January 2026
**Status**: Ready to implement
