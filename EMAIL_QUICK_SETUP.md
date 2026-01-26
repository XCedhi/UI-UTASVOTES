# Quick Email Setup - 5 Minutes

## What I Just Did

✅ Created API route for sending invitation emails (`src/app/api/invite-user/route.ts`)
✅ Updated User Management to actually send emails (not just simulate)
✅ Added service role key to `.env` file

## What You Need to Do (5 minutes)

### Step 1: Get Your Service Role Key (2 minutes)

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/inogysmdiergapyvavbx/settings/api

2. Scroll down to "Project API keys"

3. Find the **service_role** key (NOT the anon key!)
   - It starts with `eyJhbGc...` and is much longer
   - It says "This key has the ability to bypass Row Level Security"

4. Click the copy button

5. Open your `.env` file and replace:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   With:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (paste your actual key)
   ```

### Step 2: Restart Your Dev Server (1 minute)

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

**Important:** Environment variables only load when the server starts!

### Step 3: Test It! (2 minutes)

1. Go to: http://localhost:4028/admin-system-control/users/manage

2. Click "Invite User"

3. Fill in the form with a REAL email address (yours for testing)

4. Click "Send Invitation"

5. Check your email inbox (and spam folder!)

## What the Email Will Look Like

Supabase will send a default email that says:

```
You have been invited

You have been invited to create a user on [Your Project Name].

Follow this link to accept the invite:
[Accept the invite]

This link expires in 24 hours.
```

## Customize the Email Template (Optional)

1. Go to: https://supabase.com/dashboard/project/inogysmdiergapyvavbx/auth/templates

2. Click on "Invite user" template

3. Customize with UTASVotes branding:
   ```html
   <h2>Welcome to UTASVotes!</h2>
   <p>You've been invited to join the University of Technical and Applied Sciences electoral system.</p>
   <p>Click the button below to set your password and activate your account:</p>
   <a href="{{ .ConfirmationURL }}">Activate Account</a>
   <p>This link expires in 24 hours.</p>
   ```

4. Click "Save"

## Troubleshooting

### "Service role key not found"
- Make sure you added the key to `.env`
- Restart your dev server
- Check there are no extra spaces in the `.env` file

### "Failed to send invitation"
- Check browser console for detailed error
- Verify the service role key is correct
- Make sure Supabase project is active

### Email not received
- Check spam/junk folder
- Verify email address is correct
- Check Supabase logs: https://supabase.com/dashboard/project/inogysmdiergapyvavbx/logs/edge-logs
- Make sure SMTP is configured (Supabase handles this by default)

### "SMTP not configured" error
By default, Supabase uses their own SMTP. If you see this error:
1. Go to: https://supabase.com/dashboard/project/inogysmdiergapyvavbx/settings/auth
2. Scroll to "SMTP Settings"
3. Either use Supabase's default or configure your own SMTP

## What Happens When User Receives Email

1. User receives invitation email
2. Clicks the link in email
3. Redirected to `/reset-password` page
4. Sets their password
5. Account is activated
6. Can now log in with their email and new password

## Next Steps

Once emails are working:
- Customize the email template with UTASVotes branding
- Add email sending to other features (reports, notifications)
- Set up email templates for password reset, etc.

## Files Modified

1. `src/app/api/invite-user/route.ts` - New API route for sending emails
2. `src/app/admin-system-control/users/manage/components/UserManagementInteractive.tsx` - Updated to call API
3. `.env` - Added service role key and site URL

## Security Note

⚠️ **NEVER commit your service role key to Git!**
- The `.env` file is already in `.gitignore`
- Service role key bypasses all security rules
- Only use it in server-side code (API routes)
- Never expose it in client-side code

---

**Ready to test?** Follow the 3 steps above and send yourself an invitation!
