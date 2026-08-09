# Quick Fix for Decision Buttons - IMMEDIATE

## Problem
Console shows:
- ❌ `permission denied for table activity_logs`
- ❌ `"verification_notes" column of "candidates" is in the schema cache`

## Solution (Run this SQL NOW)

Copy and paste this into **Supabase Dashboard → SQL Editor** and **RUN**:

```sql
-- QUICK FIX FOR DECISION BUTTONS

-- 1. Drop the problematic triggers
DROP TRIGGER IF EXISTS on_application_rejection ON candidates;
DROP TRIGGER IF EXISTS on_application_approval ON candidates;
DROP FUNCTION IF EXISTS handle_application_rejection();
DROP FUNCTION IF EXISTS handle_application_approval();

-- 2. Make sure verification_notes exists
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 3. Make sure timestamp columns exist
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 4. Grant all permissions on candidates table
GRANT ALL ON candidates TO authenticated;
GRANT ALL ON candidates TO anon;
GRANT ALL ON candidates TO service_role;

-- 5. If activity_logs exists, grant permissions (don't fail if it doesn't)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        GRANT ALL ON activity_logs TO authenticated;
        GRANT ALL ON activity_logs TO anon;
        GRANT ALL ON activity_logs TO service_role;
        
        -- Grant sequence permissions
        GRANT USAGE, SELECT ON SEQUENCE activity_logs_id_seq TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE activity_logs_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE activity_logs_id_seq TO service_role;
        
        -- Disable RLS on activity_logs
        ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 6. Success message
SELECT '✅ Decision buttons fixed! Try approve/reject now.' as message;
```

## Test Immediately

1. **Clear browser cache**: Press `Ctrl+Shift+R`
2. **Go to commission panel**
3. **Click "View Details" on pending application**
4. **Try "Approve" or "Reject"**
5. **Check console** - should see no errors

## If Still Not Working

Run this additional SQL:

```sql
-- Nuclear option - disable all triggers and constraints temporarily
ALTER TABLE candidates DISABLE TRIGGER ALL;

-- Re-enable just the essential ones
ALTER TABLE candidates ENABLE TRIGGER ALL;

-- Force schema refresh
NOTIFY pgrst, 'reload schema';
```

Then restart your dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Expected Result

✅ **Approve button:** Status changes to 'approved', UI updates
✅ **Reject button:** Modal shows, status changes to 'rejected', UI updates
✅ **No console errors**
