# 🚨 RUN THIS FIRST - Fix 500 Error

## You're getting a 500 error because the database table doesn't exist yet!

Follow these exact steps:

---

## ✅ Step 1: Open Supabase

Go to: **https://supabase.com**

Click on your **UTASVotes** project

---

## ✅ Step 2: Open SQL Editor

In the left sidebar, click: **SQL Editor**

Then click: **New Query**

---

## ✅ Step 3: Copy the Schema File

In your code editor:

1. Open file: `supabase/support_tickets_schema.sql`
2. Press **Ctrl+A** (select all)
3. Press **Ctrl+C** (copy)

---

## ✅ Step 4: Paste and Run

In Supabase SQL Editor:

1. Press **Ctrl+V** (paste)
2. Click the **"Run"** button
3. Wait for: ✅ **"Success. No rows returned"**

---

## ✅ Step 5: Verify

Click **"Table Editor"** in left sidebar

You should see:
- ✅ `support_tickets` table
- ✅ `support_ticket_responses` table

---

## ✅ Step 6: Test Again

Go back to: **http://localhost:4028/contact-admin**

Submit the form again

**It will work now!** 🎉

---

## That's It!

The 500 error will be gone and tickets will be saved to your database.

---

## Still Getting Errors?

Check your terminal for the detailed error message. It will now show:
- Error code
- Error details
- Helpful hints

If you see "table not found" - you need to run the SQL migration above.

---

## Quick Verification

After running the SQL, test with:

```bash
node test-support-ticket.js
```

This will confirm the API is working!
