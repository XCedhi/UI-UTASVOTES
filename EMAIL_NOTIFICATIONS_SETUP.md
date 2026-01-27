# Email Notifications Setup Guide

## Current Status

✅ **Email notifications are implemented and working!**

⚠️ **Development Mode**: Emails are sent to `kwamejustice060@gmail.com` (admin email) instead of actual users due to Resend free tier restrictions.

---

## How It Works Now (Development)

### When Admin Updates a User:

1. **Database is updated** ✅
2. **Email is sent to admin email** (`kwamejustice060@gmail.com`) ✅
3. **Email shows who it was intended for** ✅
4. **User update still succeeds** even if email fails ✅

### Email Content:

The email includes a **yellow banner** at the top:

```
🔧 DEVELOPMENT MODE: This email was intended for student@cktutas.edu.gh

In production, emails will be sent to actual user addresses after domain verification.
```

This way you can:
- ✅ See all role update notifications
- ✅ Test the email content and formatting
- ✅ Verify the system is working
- ✅ Know which user the email was for

---

## For Production: Send to Actual Users

To send emails to actual user addresses, you need to **verify a domain** with Resend.

### Step 1: Verify Your Domain

1. **Go to Resend Dashboard**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter your domain**: `cktutas.edu.gh` (or subdomain like `mail.cktutas.edu.gh`)
4. **Add DNS Records**: Resend will provide DNS records to add to your domain
5. **Wait for Verification**: Usually takes a few minutes to a few hours

### Step 2: Update Environment Variables

Once domain is verified, update `.env`:

```env
# Change from test address to your verified domain
EMAIL_FROM=UTASVotes <noreply@cktutas.edu.gh>

# Or use a subdomain
EMAIL_FROM=UTASVotes <notifications@mail.cktutas.edu.gh>
```

### Step 3: Deploy to Production

Set `NODE_ENV=production` in your production environment:

```env
NODE_ENV=production
```

The system will automatically:
- ✅ Send emails to actual user addresses
- ✅ Remove the development mode banner
- ✅ Use your verified domain as sender

---

## Alternative: Use Admin Email for All Notifications

If you prefer to receive all notifications at your admin email (even in production), you can:

### Option 1: Keep Current Setup

Just leave it as is! All emails will go to `kwamejustice060@gmail.com` with a banner showing who they're for.

**Pros:**
- ✅ No domain verification needed
- ✅ Centralized notifications
- ✅ Admin sees all changes

**Cons:**
- ❌ Users don't get notified directly
- ❌ Admin must manually inform users

### Option 2: Modify the Code

Update `src/app/api/send-role-update-email/route.ts`:

```typescript
// Always send to admin email
const recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || email;
```

This will send all emails to admin regardless of environment.

---

## Testing Email Notifications

### Test in Development:

1. **Login as admin**: `admin@cktutas.edu.gh / Admin@2026`
2. **Go to User Management**
3. **Edit a user's role** or click Deactivate/Activate
4. **Check your email**: `kwamejustice060@gmail.com`
5. **Verify email content**:
   - Shows development mode banner
   - Shows intended recipient
   - Shows new role/status
   - Has login button

### What You Should See:

```
From: UTASVotes <onboarding@resend.dev>
To: kwamejustice060@gmail.com
Subject: UTASVotes: Account Update for [User Name]

[Yellow Banner]
🔧 DEVELOPMENT MODE: This email was intended for student@cktutas.edu.gh

[Email Content]
Hello John Doe,
Your UTASVotes account has been updated...
```

---

## Email Templates

The system sends different emails based on the change:

### 1. Role Change Email
- Shows new role (Student, Commission, Admin)
- Explains new permissions
- Includes login button

### 2. Status Change Email
- **Active**: Green banner, welcome message
- **Inactive**: Red banner, deactivation notice

### 3. Commission Access Email
- Shows access start and end dates
- Warns about automatic downgrade
- Includes time-bound access info

---

## Troubleshooting

### Email Not Received (Development)

**Check:**
1. ✅ Email sent to `kwamejustice060@gmail.com`?
2. ✅ Check spam/junk folder
3. ✅ Check Resend dashboard for delivery status
4. ✅ Verify `RESEND_API_KEY` is set in `.env`

### Email Fails But User Updated

**This is normal!** The system is designed to:
- ✅ Update user even if email fails
- ✅ Log warning in console
- ✅ Show success message to admin
- ✅ Continue working

**Console shows:**
```
⚠️ Failed to send email notification, but user was updated
POST /api/admin/update-user 200 in 6362ms
```

This means the user update succeeded, email just didn't send.

### Production: 403 Error

**Error:**
```
You can only send testing emails to your own email address
```

**Solution:**
- Verify your domain at https://resend.com/domains
- Update `EMAIL_FROM` to use verified domain
- Set `NODE_ENV=production`

---

## Environment Variables Reference

```env
# Required for email notifications
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=UTASVotes <onboarding@resend.dev>
ADMIN_NOTIFICATION_EMAIL=kwamejustice060@gmail.com

# For production (after domain verification)
NODE_ENV=production
EMAIL_FROM=UTASVotes <noreply@cktutas.edu.gh>
```

---

## API Endpoints

### Send Role Update Email
**POST** `/api/send-role-update-email`

**Behavior:**
- **Development**: Sends to `ADMIN_NOTIFICATION_EMAIL`
- **Production**: Sends to actual user email

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

## Summary

| Feature | Development | Production |
|---------|-------------|------------|
| Email Recipient | Admin email | Actual user email |
| Domain Required | ❌ No | ✅ Yes |
| Banner Shown | ✅ Yes | ❌ No |
| User Notified | ❌ No (admin sees it) | ✅ Yes |
| Setup Required | ✅ Done | ⚠️ Domain verification needed |

**Current Status:** ✅ Working in development mode
**Next Step:** Verify domain for production use

---

## Quick Start

**For Development (Current Setup):**
1. ✅ Already configured
2. ✅ Emails go to `kwamejustice060@gmail.com`
3. ✅ Test by updating user roles
4. ✅ Check your email

**For Production:**
1. Verify domain at https://resend.com/domains
2. Update `EMAIL_FROM` in `.env`
3. Set `NODE_ENV=production`
4. Deploy and test

That's it! The email system is ready to use.
