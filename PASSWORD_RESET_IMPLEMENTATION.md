# Password Reset Implementation Guide

## Overview
Implementing real password reset functionality using Supabase Auth for UTASVotes.

## Current Status
- ✅ UI components exist (ForgotPasswordInteractive, ResetPasswordInteractive)
- ❌ Not connected to Supabase Auth
- ❌ Email sending not configured
- ❌ Password update not functional

## Implementation Steps

### 1. Configure Supabase Email Settings

**In Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Configure **Reset Password** template
3. Set redirect URL to: `http://localhost:4028/reset-password`

**Email Template (already exists):**
- File: `supabase/email-templates/reset-password.html`
- This template is already created and styled

### 2. Update Forgot Password Component

The component needs to:
- Call `supabase.auth.resetPasswordForEmail()`
- Send email with reset link
- Handle success/error states

**Key changes needed:**
```typescript
import { createClient } from '@/lib/supabase';

const supabase = createClient();

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### 3. Update Reset Password Component

The component needs to:
- Check for valid session/token from URL
- Call `supabase.auth.updateUser()` to change password
- Handle success/error states

**Key changes needed:**
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

### 4. Email Configuration Requirements

**For emails to work, you need ONE of these:**

**Option A: Use Supabase's Built-in Email (Easiest for testing)**
- Already configured in your project
- Limited to 3 emails per hour (free tier)
- Good for testing

**Option B: Configure Custom SMTP (Production)**
- Go to Supabase Dashboard → Project Settings → Auth
- Add SMTP credentials (Gmail, SendGrid, etc.)
- Unlimited emails

**Option C: Use Resend (Already set up for support tickets)**
- You already have Resend configured
- Can reuse for password reset emails
- Requires custom implementation

## Quick Implementation

I'll update both components to use Supabase Auth properly. The flow will be:

1. **User clicks "Forgot Password"** → Enters email
2. **System sends email** via Supabase Auth
3. **User clicks link in email** → Redirected to `/reset-password` with token
4. **User enters new password** → Password updated in database
5. **User redirected to login** → Can log in with new password

## Testing

**Test with your email:**
1. Go to `/forgot-password`
2. Enter: `student@cktutas.edu.gh` (or any user in your database)
3. Check email inbox
4. Click reset link
5. Enter new password
6. Try logging in with new password

## Important Notes

- Password reset links expire after 1 hour (Supabase default)
- Links can only be used once
- User must exist in `auth.users` table
- Email must be verified (or verification disabled in Supabase settings)

## Next Steps

Would you like me to:
1. Update both components with Supabase Auth integration?
2. Create a setup guide for email configuration?
3. Test the implementation?

The implementation is straightforward - I just need to replace the mock API calls with real Supabase Auth calls.
