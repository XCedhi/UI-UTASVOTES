# Support Ticket System - Quick Setup Guide

## Step-by-Step Implementation

### Step 1: Run Database Migration (REQUIRED)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your UTASVotes project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Schema**
   - Open the file: `supabase/support_tickets_schema.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message
   - You should see: "Success. No rows returned"

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see two new tables:
     - `support_tickets`
     - `support_ticket_responses`
   - Also a view: `support_ticket_stats`

### Step 2: Verify Environment Variables

Check your `.env` file has these (should already be there):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:4028
```

**To find your Service Role Key:**
1. Go to Supabase Dashboard
2. Click "Settings" → "API"
3. Copy the "service_role" key (NOT the anon key)
4. Paste it in `.env` as `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 4: Test the System

1. **Open the contact form:**
   ```
   http://localhost:4028/contact-admin
   ```

2. **Fill out the form:**
   - Category: Technical Issue
   - Priority: High
   - Subject: Test ticket
   - Message: This is a test support ticket to verify the system is working correctly.

3. **Submit the form**
   - Click "Send Message"
   - Wait for success message
   - You should see a ticket number like: `UTAS-20260126-0001`

4. **Verify in Database:**
   - Go to Supabase Dashboard → Table Editor
   - Click on `support_tickets` table
   - You should see your test ticket!

5. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see: `✅ Support ticket submitted: UTAS-20260126-0001`

### Step 5: Enable Email Notifications (OPTIONAL)

Email notifications are prepared but disabled by default. To enable:

#### Option A: Use Supabase Email (Recommended)

1. **Configure SMTP in Supabase:**
   - Go to Supabase Dashboard
   - Click "Authentication" → "Email Templates"
   - Scroll to "SMTP Settings"
   - Configure your SMTP provider (Gmail, SendGrid, etc.)

2. **Enable Email Code:**
   - Open: `src/app/api/submit-support-ticket/route.ts`
   - Find line 88-92 (commented out)
   - Uncomment this code:
   ```typescript
   await supabaseAdmin.auth.admin.sendEmail({
     email: admin.email,
     subject: `[UTASVotes] New Support Ticket: ${ticketData.ticket_number}`,
     html: emailHtml,
   });
   ```

3. **Restart server and test**

#### Option B: Use SendGrid (Alternative)

1. **Install SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Add to `.env`:**
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

3. **Replace email code in API route** with SendGrid implementation

## Testing Checklist

After setup, verify these work:

- [ ] Database tables created (`support_tickets`, `support_ticket_responses`)
- [ ] Contact form accessible at `/contact-admin`
- [ ] Form submission creates ticket in database
- [ ] Ticket number generated (format: UTAS-YYYYMMDD-XXXX)
- [ ] Success message shows ticket number
- [ ] Console logs show success messages
- [ ] Ticket visible in Supabase Table Editor
- [ ] (Optional) Email sent to admins

## Troubleshooting

### Issue: "Failed to create support ticket"

**Check:**
1. Database migration ran successfully
2. `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env`
3. Development server restarted after adding env variables

**Solution:**
```bash
# Verify env variables are loaded
node verify-env.js

# Restart server
npm run dev
```

### Issue: "Permission denied for table support_tickets"

**Solution:**
The RLS policies should allow inserts. Run this in Supabase SQL Editor:

```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'support_tickets';

-- If missing, re-run the schema file
-- supabase/support_tickets_schema.sql
```

### Issue: Ticket number not generating

**Solution:**
Verify the trigger exists:

```sql
-- Check triggers
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_ticket_number';

-- If missing, re-run the schema file
```

### Issue: Email not sending

**Cause:** Email code is commented out by default

**Solution:**
1. Configure SMTP in Supabase Dashboard
2. Uncomment email sending code in API route
3. Restart server

## Quick Test Script

Run this in browser console after submitting a ticket:

```javascript
// Fetch your tickets
fetch('/api/submit-support-ticket?email=student@cktutas.edu.gh')
  .then(r => r.json())
  .then(data => console.log('Your tickets:', data.tickets));
```

## What Happens When Form is Submitted

1. **User fills form** → Clicks "Send Message"
2. **Frontend validates** → Checks required fields
3. **API called** → POST to `/api/submit-support-ticket`
4. **API validates** → Checks email, category, priority
5. **Database insert** → Ticket saved with auto-generated number
6. **Trigger fires** → Ticket number generated (UTAS-YYYYMMDD-XXXX)
7. **Email prepared** → HTML email created for admins
8. **Email sent** → (If enabled) Sent to all active admins
9. **Response returned** → Ticket number sent to frontend
10. **Success shown** → User sees ticket number

## Viewing Tickets in Database

### Via Supabase Dashboard:
1. Go to Table Editor
2. Click `support_tickets`
3. See all tickets with details

### Via SQL Query:
```sql
-- View all tickets
SELECT * FROM support_tickets ORDER BY created_at DESC;

-- View ticket statistics
SELECT * FROM support_ticket_stats;

-- View tickets by status
SELECT * FROM support_tickets WHERE status = 'open';

-- View high priority tickets
SELECT * FROM support_tickets WHERE priority IN ('high', 'critical');
```

## Next Steps (Optional)

After basic setup works, you can:

1. **Create Admin Dashboard** to view/manage tickets
2. **Add ticket response system** for admins to reply
3. **Enable email notifications** to admins
4. **Add file attachments** to tickets
5. **Create ticket search/filter** functionality
6. **Add ticket assignment** workflow
7. **Build ticket analytics** dashboard

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check terminal for API errors
3. Check Supabase logs in Dashboard
4. Verify all environment variables are set
5. Ensure database migration completed successfully

## Summary

**Minimum Required Steps:**
1. ✅ Run database migration in Supabase SQL Editor
2. ✅ Verify environment variables in `.env`
3. ✅ Restart development server
4. ✅ Test form submission at `/contact-admin`
5. ✅ Verify ticket in Supabase Table Editor

**Optional Steps:**
- Configure SMTP for email notifications
- Create admin dashboard to view tickets
- Add ticket response system

The system is now fully functional and storing real data in your database!
