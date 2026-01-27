# Implement Support Tickets - Step by Step Guide

## 🚀 Quick Start (5 Minutes)

Follow these exact steps to get the support ticket system working right now:

### Step 1: Open Supabase Dashboard (1 minute)

1. Go to https://supabase.com
2. Sign in to your account
3. Select your **UTASVotes** project
4. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Database Migration (2 minutes)

1. In SQL Editor, click **"New Query"**
2. Open this file in your code editor: `supabase/support_tickets_schema.sql`
3. **Copy ALL the content** (Ctrl+A, Ctrl+C)
4. **Paste** into Supabase SQL Editor (Ctrl+V)
5. Click **"Run"** button (or press Ctrl+Enter)
6. Wait for success message: ✅ "Success. No rows returned"

### Step 3: Verify Setup (1 minute)

1. In Supabase, click **"Table Editor"** in left sidebar
2. You should see these new tables:
   - ✅ `support_tickets`
   - ✅ `support_ticket_responses`
3. Click on `support_tickets` to see the table structure

### Step 4: Restart Your Server (1 minute)

In your terminal:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test It! (1 minute)

1. Open browser: http://localhost:4028/contact-admin
2. Fill out the form:
   - Category: Technical Issue
   - Priority: High
   - Subject: Test ticket
   - Message: Testing the support ticket system
3. Click "Send Message"
4. You should see: ✅ Ticket number like `UTAS-20260126-0001`

### Step 6: Verify in Database

1. Go back to Supabase → Table Editor
2. Click `support_tickets` table
3. You should see your test ticket! 🎉

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] Database tables created (`support_tickets`, `support_ticket_responses`)
- [ ] Contact form loads at `/contact-admin`
- [ ] Form submission works without errors
- [ ] Ticket number is displayed after submission
- [ ] Ticket appears in Supabase Table Editor
- [ ] Browser console shows success message (F12 → Console)

---

## 🧪 Testing Tools

### Test via Browser Console

1. Open http://localhost:4028/contact-admin
2. Press F12 to open DevTools
3. Go to Console tab
4. Submit a ticket
5. You should see: `✅ Support ticket submitted: UTAS-20260126-XXXX`

### Test via Node Script

Run this command in terminal:
```bash
node test-support-ticket.js
```

This will:
- Send a test ticket to the API
- Show you the ticket number
- Confirm the system is working

### Verify Database Setup

In Supabase SQL Editor, run:
```sql
-- Copy content from: verify-support-ticket-setup.sql
```

This checks:
- Tables exist
- Triggers are working
- RLS policies are set
- Functions are created

---

## 📧 Enable Email Notifications (Optional)

Email notifications are **prepared but disabled** by default. To enable:

### Quick Enable (If you have SMTP configured in Supabase)

1. Open: `src/app/api/submit-support-ticket/route.ts`
2. Find line 88-92 (search for "Uncomment when email")
3. Remove the `/*` and `*/` comment markers
4. Save file
5. Restart server: `npm run dev`

### Configure SMTP in Supabase

1. Go to Supabase Dashboard
2. Click **Authentication** → **Email Templates**
3. Scroll to **SMTP Settings**
4. Configure your email provider:
   - Gmail
   - SendGrid
   - AWS SES
   - Custom SMTP

---

## 🔍 Troubleshooting

### Problem: "Failed to create support ticket"

**Solution:**
1. Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`
2. Verify you ran the database migration
3. Restart development server

**Find Service Role Key:**
- Supabase Dashboard → Settings → API
- Copy the **service_role** key (NOT anon key)
- Add to `.env`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

### Problem: "Permission denied for table support_tickets"

**Solution:**
Re-run the database migration:
1. Open Supabase SQL Editor
2. Run `supabase/support_tickets_schema.sql` again
3. This will recreate RLS policies

### Problem: Ticket number not generating

**Solution:**
The trigger might not be created. Run this in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_ticket_number';

-- If empty, re-run the schema file
```

### Problem: Form submits but nothing happens

**Check:**
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for failed requests
4. Verify API route exists: `src/app/api/submit-support-ticket/route.ts`

---

## 📊 View Your Tickets

### In Supabase Dashboard:
1. Table Editor → `support_tickets`
2. See all tickets with full details

### Via SQL Query:
```sql
-- All tickets
SELECT * FROM support_tickets ORDER BY created_at DESC;

-- Open tickets only
SELECT * FROM support_tickets WHERE status = 'open';

-- High priority tickets
SELECT * FROM support_tickets WHERE priority IN ('high', 'critical');

-- Ticket statistics
SELECT * FROM support_ticket_stats;
```

### Via API:
```javascript
// In browser console
fetch('/api/submit-support-ticket?email=student@cktutas.edu.gh')
  .then(r => r.json())
  .then(data => console.log(data.tickets));
```

---

## 🎯 What You Get

After setup, the system provides:

✅ **Real-time ticket creation** - Instant database storage
✅ **Auto-generated ticket numbers** - Format: UTAS-YYYYMMDD-XXXX
✅ **User confirmation** - Ticket number displayed immediately
✅ **Admin notifications** - Email alerts (when enabled)
✅ **Ticket tracking** - All tickets stored permanently
✅ **Security** - RLS policies protect data
✅ **Anonymous support** - Works without login
✅ **Logged-in support** - Tracks user info when available

---

## 📁 Files You Need

All files are already created:

- ✅ `supabase/support_tickets_schema.sql` - Database schema
- ✅ `src/app/api/submit-support-ticket/route.ts` - API endpoint
- ✅ `src/app/contact-admin/components/ContactAdminInteractive.tsx` - Form
- ✅ `test-support-ticket.js` - Test script
- ✅ `verify-support-ticket-setup.sql` - Verification script
- ✅ `SUPPORT_TICKET_SYSTEM_COMPLETE.md` - Full documentation
- ✅ `SUPPORT_TICKET_QUICK_SETUP.md` - Setup guide
- ✅ This file - Implementation guide

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Form submission shows success message
2. ✅ Ticket number is displayed (UTAS-YYYYMMDD-XXXX)
3. ✅ Ticket appears in Supabase database
4. ✅ Console shows: "✅ Support ticket submitted"
5. ✅ No errors in browser console or terminal

---

## 🚦 Current Status

The system is **READY TO USE** right now:

- ✅ Database schema created
- ✅ API endpoint implemented
- ✅ Contact form updated
- ✅ Email template prepared
- ⏸️ Email sending disabled (optional to enable)

**To activate:** Just run the database migration and restart your server!

---

## 📞 Need Help?

If you get stuck:

1. Check browser console (F12) for errors
2. Check terminal for API errors
3. Run verification script: `verify-support-ticket-setup.sql`
4. Run test script: `node test-support-ticket.js`
5. Check Supabase logs in Dashboard

---

## 🎓 Summary

**Minimum steps to get it working:**

1. Run `supabase/support_tickets_schema.sql` in Supabase SQL Editor
2. Restart development server: `npm run dev`
3. Test at: http://localhost:4028/contact-admin
4. Verify in Supabase Table Editor

**That's it!** The system is now live and functional. 🚀
