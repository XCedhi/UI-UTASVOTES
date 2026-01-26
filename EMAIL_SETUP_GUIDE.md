# Email Setup Guide for UTASVotes

## Current Status
Your application shows success messages but **doesn't actually send emails**. The code has placeholders like:
```typescript
// 3. Send invitation email with token link
```

But no actual email sending implementation.

## Why Emails Don't Work Yet

1. **No Email Service Configured** - Supabase email is not set up
2. **No Email Sending Code** - The invitation function just simulates success
3. **No SMTP Provider** - No email delivery service configured

## Solution Options

### Option 1: Supabase Auth Emails (Recommended - Easiest)

**Best for:** User invitations, password resets, email verification

**Setup Steps:**

1. **Configure Supabase Auth Email Templates**
   - Go to: https://supabase.com/dashboard/project/zdvfukjllgmjuwlylukq/auth/templates
   - Customize email templates for:
     - Invite user
     - Reset password
     - Confirm signup
     - Magic link

2. **Enable Email Provider in Supabase**
   - Go to: https://supabase.com/dashboard/project/zdvfukjllgmjuwlylukq/settings/auth
   - Under "SMTP Settings", configure your email provider

3. **Use Supabase's Built-in Invite Function**
   ```typescript
   // Instead of manual email sending
   const { data, error } = await supabase.auth.admin.inviteUserByEmail(
     'user@cktutas.edu.gh',
     {
       data: {
         full_name: 'John Doe',
         role: 'commission',
         access_start_date: '2026-01-26',
         access_end_date: '2026-12-31'
       },
       redirectTo: 'http://localhost:4028/reset-password'
     }
   );
   ```

**Pros:**
- Built into Supabase
- Handles token generation automatically
- Secure by default
- Free tier includes 30,000 emails/month

**Cons:**
- Limited customization
- Requires Supabase service role key

---

### Option 2: Resend (Recommended - Most Flexible)

**Best for:** Custom emails, notifications, reports

**Setup Steps:**

1. **Sign up for Resend**
   - Go to: https://resend.com
   - Free tier: 3,000 emails/month
   - Verify your domain (@cktutas.edu.gh)

2. **Install Resend**
   ```bash
   npm install resend
   ```

3. **Add to .env**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Create Email Utility**
   ```typescript
   // src/lib/email.ts
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendInvitationEmail(
     to: string,
     firstName: string,
     lastName: string,
     role: string,
     invitationLink: string,
     accessEndDate?: string
   ) {
     const { data, error } = await resend.emails.send({
       from: 'UTASVotes <noreply@cktutas.edu.gh>',
       to: [to],
       subject: 'You\'ve been invited to UTASVotes',
       html: `
         <h1>Welcome to UTASVotes, ${firstName}!</h1>
         <p>You've been invited to join as a <strong>${role}</strong>.</p>
         ${accessEndDate ? `<p>Your access expires on: ${new Date(accessEndDate).toLocaleDateString()}</p>` : ''}
         <p><a href="${invitationLink}">Click here to set your password and activate your account</a></p>
         <p>This link expires in 7 days.</p>
       `
     });
     
     if (error) {
       console.error('Email send error:', error);
       throw error;
     }
     
     return data;
   }
   ```

**Pros:**
- Very easy to use
- Great deliverability
- Beautiful email templates
- Good free tier

**Cons:**
- Requires domain verification
- Another service to manage

---

### Option 3: SendGrid

**Best for:** High volume, enterprise needs

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to: https://sendgrid.com
   - Free tier: 100 emails/day

2. **Install SendGrid**
   ```bash
   npm install @sendgrid/mail
   ```

3. **Add to .env**
   ```env
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

4. **Create Email Utility**
   ```typescript
   // src/lib/email.ts
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
   
   export async function sendInvitationEmail(
     to: string,
     firstName: string,
     lastName: string,
     role: string,
     invitationLink: string
   ) {
     const msg = {
       to,
       from: 'noreply@cktutas.edu.gh',
       subject: 'You\'ve been invited to UTASVotes',
       html: `
         <h1>Welcome to UTASVotes, ${firstName}!</h1>
         <p>You've been invited to join as a <strong>${role}</strong>.</p>
         <p><a href="${invitationLink}">Click here to activate your account</a></p>
       `
     };
     
     await sgMail.send(msg);
   }
   ```

**Pros:**
- Industry standard
- Very reliable
- Advanced features

**Cons:**
- More complex setup
- Lower free tier (100/day)

---

### Option 4: Nodemailer with Gmail (Quick Testing)

**Best for:** Development/testing only

**Setup Steps:**

1. **Install Nodemailer**
   ```bash
   npm install nodemailer
   ```

2. **Add to .env**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Create Email Utility**
   ```typescript
   // src/lib/email.ts
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     host: process.env.EMAIL_HOST,
     port: parseInt(process.env.EMAIL_PORT!),
     secure: false,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });
   
   export async function sendInvitationEmail(
     to: string,
     firstName: string,
     lastName: string,
     role: string,
     invitationLink: string
   ) {
     await transporter.sendMail({
       from: '"UTASVotes" <noreply@cktutas.edu.gh>',
       to,
       subject: 'You\'ve been invited to UTASVotes',
       html: `
         <h1>Welcome to UTASVotes, ${firstName}!</h1>
         <p>You've been invited to join as a <strong>${role}</strong>.</p>
         <p><a href="${invitationLink}">Click here to activate your account</a></p>
       `
     });
   }
   ```

**Pros:**
- Free
- Quick to set up for testing

**Cons:**
- Gmail limits (500 emails/day)
- Not suitable for production
- Requires app password setup

---

## Recommended Approach

For UTASVotes, I recommend a **hybrid approach**:

1. **Use Supabase Auth for:**
   - User invitations (commission/admin)
   - Password resets
   - Email verification

2. **Use Resend for:**
   - Custom notifications
   - Election result reports
   - Campaign updates
   - System alerts

This gives you the best of both worlds: built-in security for auth emails and flexibility for custom emails.

## Quick Start: Supabase Auth Emails

This is the fastest way to get emails working:

### Step 1: Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/zdvfukjllgmjuwlylukq/settings/api
2. Copy your **service_role** key (not the anon key!)
3. Add to `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 2: Create API Route

Create `src/app/api/invite-user/route.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, role, accessStartDate, accessEndDate } = await request.json();
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Invite user via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: `${firstName} ${lastName}`,
        role,
        access_start_date: accessStartDate,
        access_end_date: accessEndDate
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
    });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 3: Update User Management Component

Replace the invitation function in `UserManagementInteractive.tsx`:
```typescript
const handleInviteUser = async () => {
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        accessStartDate: formData.accessStartDate,
        accessEndDate: formData.accessEndDate
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) throw new Error(result.error);
    
    setInviteSuccess(true);
    alert('Invitation email sent successfully!');
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    alert(`Failed to send invitation: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 4: Configure Email Templates

1. Go to: https://supabase.com/dashboard/project/zdvfukjllgmjuwlylukq/auth/templates
2. Customize the "Invite user" template with your branding
3. Test by sending an invitation

## Testing

After setup, test by:
1. Logging in as admin
2. Going to User Management
3. Clicking "Invite User"
4. Filling in the form
5. Checking the recipient's email inbox

## Troubleshooting

**Email not received?**
- Check spam folder
- Verify email address is correct
- Check Supabase logs for errors
- Ensure SMTP is configured in Supabase

**"Service role key not found" error?**
- Make sure you added `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- Restart your dev server after adding env variables

**"Invalid API key" error?**
- Double-check you copied the service_role key (not anon key)
- Ensure no extra spaces in the `.env` file

## Next Steps

1. Choose your email solution (I recommend starting with Supabase Auth)
2. Follow the setup steps above
3. Test with a real email address
4. Customize email templates to match UTASVotes branding
5. Add email sending to other features (reports, notifications)

## Cost Comparison

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Supabase Auth | 30,000/month | Included in plan |
| Resend | 3,000/month | $20/month for 50k |
| SendGrid | 100/day | $15/month for 40k |
| Gmail/Nodemailer | 500/day | Not for production |

For a university election system, Supabase Auth's 30,000 emails/month should be more than enough!
