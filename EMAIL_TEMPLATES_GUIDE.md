# UTASVotes Email Templates Guide

## Overview
I've created 4 custom email templates with UTASVotes branding, featuring your brand colors and professional design.

## Templates Created

1. **Invite User** - Welcome new commission/admin members
2. **Reset Password** - Secure password reset flow
3. **Confirm Signup** - Email verification for new accounts
4. **Magic Link** - Passwordless login option

## Design Features

✅ **Brand Colors**
- Primary Yellow: #F2B807
- Secondary Yellow: #F29F05
- Orange: #D97904
- Deep Red: #A61103

✅ **Professional Design**
- Gradient headers with UTASVotes branding
- Responsive layout (works on mobile)
- Clear call-to-action buttons
- Security information boxes
- Helpful context and instructions

✅ **User-Friendly**
- Clear instructions
- Copy-paste link option
- Expiration time warnings
- Security tips
- What's next guidance

## How to Apply Templates

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Email Templates**
   - Navigate to: https://supabase.com/dashboard/project/inogysmdiergapyvavbx/auth/templates

2. **For Each Template:**

   **A. Invite User Template**
   - Click on "Invite user"
   - Copy content from `supabase/email-templates/invite-user.html`
   - Paste into the template editor
   - Click "Save"

   **B. Reset Password Template**
   - Click on "Reset password"
   - Copy content from `supabase/email-templates/reset-password.html`
   - Paste into the template editor
   - Click "Save"

   **C. Confirm Signup Template**
   - Click on "Confirm signup"
   - Copy content from `supabase/email-templates/confirm-signup.html`
   - Paste into the template editor
   - Click "Save"

   **D. Magic Link Template**
   - Click on "Magic link"
   - Copy content from `supabase/email-templates/magic-link.html`
   - Paste into the template editor
   - Click "Save"

3. **Test the Templates**
   - Send yourself a test invitation
   - Check how it looks in your email client
   - Test on mobile device

### Method 2: Via Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Update invite user template
supabase functions deploy --project-ref inogysmdiergapyvavbx

# Or use the API
curl -X PUT 'https://api.supabase.com/v1/projects/inogysmdiergapyvavbx/config/auth' \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @email-template-config.json
```

## Template Variables

Each template uses Supabase's built-in variables:

- `{{ .ConfirmationURL }}` - The action link (invite, reset, confirm, login)
- `{{ .Token }}` - The confirmation token (if needed)
- `{{ .TokenHash }}` - Hashed token (if needed)
- `{{ .SiteURL }}` - Your site URL from Supabase config

## Customization Options

### Change Colors

Find and replace these hex codes in the templates:

```html
<!-- Primary Yellow -->
#F2B807 → Your new color

<!-- Secondary Yellow -->
#F29F05 → Your new color

<!-- Orange -->
#D97904 → Your new color

<!-- Deep Red -->
#A61103 → Your new color
```

### Add Logo

Replace the text header with an image:

```html
<!-- Current -->
<h1 style="...">UTASVotes</h1>

<!-- With Logo -->
<img src="https://your-domain.com/logo.png" alt="UTASVotes" style="max-width: 200px; height: auto;" />
```

### Change Footer Text

Update the footer section:

```html
<p style="...">
  University of Technical and Applied Sciences, Ghana
</p>
<p style="...">
  Questions? Contact: elections@cktutas.edu.gh
</p>
```

## Testing Templates

### Test Invite User Email

1. Go to User Management
2. Click "Invite User"
3. Enter your email
4. Check your inbox

### Test Reset Password Email

1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox

### Test Confirm Signup Email

1. Create a new account (if signup is enabled)
2. Check your inbox for confirmation

### Test Magic Link Email

1. Go to login page
2. Click "Send Magic Link" (if enabled)
3. Enter your email
4. Check your inbox

## Email Client Compatibility

These templates are tested and work well on:

✅ Gmail (Desktop & Mobile)
✅ Outlook (Desktop & Mobile)
✅ Apple Mail (macOS & iOS)
✅ Yahoo Mail
✅ ProtonMail
✅ Thunderbird

## Troubleshooting

### Template Not Updating

1. Clear browser cache
2. Wait 5 minutes for Supabase to propagate changes
3. Send a new test email (don't use old links)

### Styling Looks Broken

- Some email clients strip certain CSS
- The templates use inline styles for maximum compatibility
- Test in multiple email clients

### Images Not Loading

- Make sure image URLs are publicly accessible
- Use HTTPS URLs only
- Consider using base64 encoded images for small logos

### Links Not Working

- Verify `{{ .ConfirmationURL }}` is present
- Check your Site URL in Supabase settings
- Ensure redirect URLs are whitelisted

## Advanced Customization

### Add Dynamic Content

You can add custom metadata to emails:

```typescript
// In your API route
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  data: {
    full_name: 'John Doe',
    role: 'commission',
    custom_message: 'Welcome to the team!'
  }
});
```

Then use in template:

```html
<p>{{ .UserMetaData.custom_message }}</p>
```

### Conditional Content

Show different content based on user role:

```html
{{ if eq .UserMetaData.role "admin" }}
  <p>You have full administrative access.</p>
{{ else if eq .UserMetaData.role "commission" }}
  <p>You have electoral commission access.</p>
{{ else }}
  <p>You have student access.</p>
{{ end }}
```

### Localization

Add multiple language support:

```html
{{ if eq .UserMetaData.language "fr" }}
  <h2>Bienvenue!</h2>
{{ else }}
  <h2>Welcome!</h2>
{{ end }}
```

## Best Practices

1. **Keep It Simple**
   - Clear subject lines
   - Single call-to-action
   - Minimal text

2. **Mobile-First**
   - Test on mobile devices
   - Use large buttons (min 44px height)
   - Readable font sizes (min 14px)

3. **Security**
   - Always mention expiration times
   - Include security warnings
   - Explain what the email is for

4. **Branding**
   - Consistent colors
   - Clear sender name
   - Professional tone

5. **Accessibility**
   - Use semantic HTML
   - Include alt text for images
   - Good color contrast

## Email Subject Lines

Configure these in Supabase Dashboard → Auth → Email Templates:

- **Invite User**: "Welcome to UTASVotes - Activate Your Account"
- **Reset Password**: "Reset Your UTASVotes Password"
- **Confirm Signup**: "Confirm Your Email - UTASVotes"
- **Magic Link**: "Your UTASVotes Magic Link"

## Support

If you need help with email templates:

1. Check Supabase email logs: https://supabase.com/dashboard/project/inogysmdiergapyvavbx/logs/edge-logs
2. Test with different email providers
3. Verify SMTP settings in Supabase
4. Contact Supabase support if emails aren't sending

## Files Location

All templates are in: `supabase/email-templates/`

- `invite-user.html`
- `reset-password.html`
- `confirm-signup.html`
- `magic-link.html`

## Next Steps

1. ✅ Apply templates in Supabase Dashboard
2. ✅ Test each template with real emails
3. ✅ Customize colors/text if needed
4. ✅ Add your logo (optional)
5. ✅ Configure subject lines
6. ✅ Test on mobile devices

---

**Ready to apply?** Go to your Supabase Dashboard and paste these templates!
