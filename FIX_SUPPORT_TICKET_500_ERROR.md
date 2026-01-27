# Fix Support Ticket 500 Error

## Problem
Getting `POST /api/submit-support-ticket 500` error when submitting the contact form.

## Cause
The `support_tickets` table doesn't exist in your Supabase database yet. You need to run the database migration first.

## Solution (2 Minutes)

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/inogysmdiergapyvavbx
   - (Or just go to https://supabase.com and select your project)

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy the Schema**
   - Open file: `supabase/support_tickets_schema.sql`
   - Press Ctrl+A to select all
   - Press Ctrl+C to copy

4. **Paste and Run**
   - In Supabase SQL Editor, press Ctrl+V to paste
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait 2-3 seconds
   - You should see: ✅ "Success. No rows returned"

5. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should now see:
     - `support_tickets` table
     - `support_ticket_responses` table

### Step 2: Test Again

1. Go back to: http://localhost:4028/contact-admin
2. Fill out the form again
3. Submit
4. This time it should work! ✅

## What the Migration Does

The SQL script creates:
- `support_tickets` table - Stores all support requests
- `support_ticket_responses` table - Stores admin replies
- `support_ticket_stats` view - Statistics
- Triggers for auto-generating ticket numbers
- RLS policies for security
- Indexes for performance

## Verification

After running the migration, verify it worked:

### Check in Supabase Dashboard:
1. Go to Table Editor
2. Click `support_tickets`
3. You should see the table structure with columns:
   - id
   - ticket_number
   - user_email
   - subject
   - message
   - category
   - priority
   - status
   - etc.

### Check via SQL:
Run this in SQL Editor:
```sql
SELECT COUNT(*) FROM support_tickets;
```
Should return: 0 (no tickets yet, but table exists)

## Common Issues

### Issue: "relation 'support_tickets' does not exist"
**Solution:** You haven't run the migration yet. Follow Step 1 above.

### Issue: "permission denied for table support_tickets"
**Solution:** The RLS policies weren't created. Re-run the entire schema file.

### Issue: SQL Editor shows errors
**Solution:** Make sure you copied the ENTIRE file content, including all the way to the bottom.

## After Migration Works

Once the migration is successful:
1. ✅ Form submissions will work
2. ✅ Tickets will be stored in database
3. ✅ Ticket numbers will be auto-generated
4. ✅ You'll see tickets in Supabase Table Editor

## Quick Test

After running migration:
```bash
# Test the API
node test-support-ticket.js
```

Or just submit the form at `/contact-admin` again!
