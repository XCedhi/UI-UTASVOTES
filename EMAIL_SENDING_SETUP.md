# Email Sending Setup Guide

## Current Status
✅ Code is ready - just needs API key configuration

## Quick Setup (5 minutes)

### Option 1: Resend (Recommended - Easiest)

**Why Resend?**
- Free tier: 3,000 emails/month
- No credit card required for testing
- Simple setup
- Reliable delivery

**Steps:**

1. **Sign up for Resend**
   - Go to https://resend.com/signup
   - Sign up with your email

2. **Get your API Key**
   - After signup, go to https://resend.com/api-keys
   - Click "Create API Key"
   - Give it a name like "UTASVotes"
   - Copy the API key (starts with `re_`)

3. **Add to .env file**
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

4. **Restart your dev server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev`

5. **Test it!**
   - Go to http://localhost:4028/contact-admin
   - Submit a support ticket
   - Check utasvotes@hotmail.com for the email

### Testing with Default Sender

For testing, Resend provides `onboarding@resend.dev` as a sender email. This works immediately without domain verification.

**Current configuration:**
```env
EMAIL_FROM=UTASVotes <onboarding@resend.dev>
```

### Production Setup (Optional - For Custom Domain)

If you want emails to come from your own domain (e.g., `support@utasvotes.com`):

1. **Add your domain in Resend**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain

2. **Add DNS records**
   - Resend will show you DNS records to add
   - Add them in your domain registrar (e.g., Namecheap, GoDaddy)
   - Wait for verification (usually 5-10 minutes)

3. **Update .env**
   ```env
   EMAIL_FROM=UTASVotes Support <support@yourdomain.com>
   ```

---

## Alternative: SendGrid

If you prefer SendGrid:

1. Sign up at https://sendgrid.com
2. Get API key from Settings → API Keys
3. Install: `npm install @sendgrid/mail`
4. Update the API code to use SendGrid instead of Resend

---

## Troubleshooting

### Email not sending?

**Check server logs for:**
```
⚠️  Email sending disabled: RESEND_API_KEY not configured
```
→ Add RESEND_API_KEY to .env and restart server

```
❌ Error sending email: [error details]
```
→ Check if API key is correct

### Email going to spam?

- Use a verified domain (not onboarding@resend.dev)
- Add SPF, DKIM, and DMARC records
- Warm up your domain by sending gradually

### Want to test without real emails?

Use a service like:
- https://mailtrap.io (email testing)
- https://ethereal.email (temporary inbox)

---

## Current Configuration

**Recipient:** utasvotes@hotmail.com  
**Sender:** UTASVotes <onboarding@resend.dev>  
**Service:** Resend  
**Status:** Ready (just needs API key)

---

## Next Steps

1. Get Resend API key from https://resend.com/api-keys
2. Add to `.env` file
3. Restart server
4. Test by submitting a support ticket
5. Check utasvotes@hotmail.com for the email

That's it! 🚀
