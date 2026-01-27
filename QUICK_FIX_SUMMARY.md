# 🚨 CRITICAL FIX NEEDED - Support Ticket Permission Error

## Current Issue
**Error Code 42501**: Permission denied for table support_tickets

The support ticket form is failing because the RLS (Row Level Security) policy doesn't allow the service role to insert records.

## ✅ SOLUTION - Run This SQL Now

**File to run**: `fix-rls-policy.sql` (already open in your editor)

### Steps:
1. **Open Supabase Dashboard** → https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Copy the contents of `fix-rls-policy.sql`** (the file currently open in your editor)
4. **Paste into SQL Editor**
5. **Click "Run"**
6. **Look for success message**: "Policy updated successfully! Try submitting the form again."

### What This Does:
- Drops the old RLS policy that was blocking inserts
- Creates a new policy that explicitly allows `service_role` to insert tickets
- Verifies the policy was created correctly

## After Running the SQL

1. **Go to your browser** → http://localhost:4028/contact-admin
2. **Fill out the support form**
3. **Submit**
4. **Check your server logs** - you should see:
   - ✅ Support ticket created: UTAS-YYYYMMDD-XXXX
   - 📧 Email notification prepared for admin@cktutas.edu.gh

## Verify It Worked

**In Supabase Dashboard**:
1. Go to **Table Editor** → `support_tickets`
2. You should see your new ticket with:
   - Auto-generated ticket number (UTAS-YYYYMMDD-XXXX)
   - Status: "open"
   - All your form data

## Server Log Indicators

**Before Fix** (what you're seeing now):
```
❌ Database error: { code: '42501', message: 'permission denied for table support_tickets' }
```

**After Fix** (what you should see):
```
✅ Support ticket created: UTAS-20260126-0001
📧 Email notification prepared for admin@cktutas.edu.gh
```

---

## Why This Happened

The `COMPLETE_FIX_NOW.sql` you ran earlier created the table and trigger, but the RLS policy it created didn't explicitly include `service_role` in the allowed roles. The `fix-rls-policy.sql` adds that missing permission.

---

**NEXT ACTION**: Run `fix-rls-policy.sql` in Supabase SQL Editor NOW! 🚀
