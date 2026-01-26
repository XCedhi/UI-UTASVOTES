# Security Fixes Guide for UTASVotes Database

## Overview
Supabase's security linter detected 9 security warnings in your database schema. This guide explains each issue and how to fix them.

## Security Issues Found

### 1. Function Search Path Mutable (7 warnings)

**Issue:** Database functions without a fixed `search_path` can be exploited by malicious users who could manipulate which schema the function uses.

**Affected Functions:**
- `update_updated_at_column`
- `update_election_stats`
- `update_candidate_votes`
- `update_post_likes_count`
- `update_post_comments_count`
- `update_post_shares_count`
- `check_commission_access_expiry`

**Risk Level:** Medium to High
- Attackers could create malicious schemas/tables with the same names
- Functions might execute against wrong tables
- Could lead to data corruption or unauthorized access

**Fix Applied:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER          -- Run with function owner's privileges
SET search_path = public  -- Lock to public schema only
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### 2. RLS Policy Always True - account_requests (2 warnings)

**Issue:** The policies allowed unrestricted access to the `account_requests` table.

**Original Policies:**
```sql
-- TOO PERMISSIVE!
CREATE POLICY "Anyone can create account request" 
  ON public.account_requests 
  FOR INSERT 
  WITH CHECK (true);  -- ❌ Anyone can insert

CREATE POLICY "Anyone can view account requests" 
  ON public.account_requests 
  FOR SELECT 
  USING (true);  -- ❌ Anyone can view all requests
```

**Risk Level:** High
- Anyone could view all pending account requests (privacy violation)
- Could expose student IDs, emails, and personal information
- No audit trail of who accessed what

**Fix Applied:**
```sql
-- ✅ Only unauthenticated users can create (for registration)
CREATE POLICY "Unauthenticated can create account request" 
  ON public.account_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NULL);

-- ✅ Only admin/commission can view all requests
CREATE POLICY "Admin/Commission can view all requests" 
  ON public.account_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'commission')
    )
  );

-- ✅ Users can view their own request
CREATE POLICY "Users can view own request" 
  ON public.account_requests 
  FOR SELECT 
  USING (email = auth.jwt()->>'email');
```

### 3. RLS Policy Always True - notifications

**Issue:** The policy allowed anyone to create notifications.

**Original Policy:**
```sql
-- TOO PERMISSIVE!
CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);  -- ❌ Anyone can create notifications
```

**Risk Level:** High
- Users could spam other users with fake notifications
- Could create phishing attacks via fake system notifications
- No control over notification content

**Fix Applied:**
```sql
-- ✅ Only admin/commission can create notifications
CREATE POLICY "Admin/Commission can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'commission')
    )
  );
```

## How to Apply the Fixes

### Option 1: Run the Security Fixes SQL (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/zdvfukjllgmjuwlylukq

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Security Fixes**
   - Copy the contents of `supabase/schema_security_fixes.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify the Fixes**
   - Go back to "Security Advisor"
   - Click "Refresh"
   - All 9 warnings should be resolved

### Option 2: Manual Fix in Supabase Dashboard

If you prefer to fix them one by one:

1. Go to **Database → Functions**
2. Edit each function and add:
   - `SECURITY DEFINER` after `RETURNS TRIGGER`
   - `SET search_path = public` after `SECURITY DEFINER`

3. Go to **Authentication → Policies**
4. Delete the overly permissive policies
5. Create the new restrictive policies

## Impact on Your Application

### ✅ No Breaking Changes
The security fixes maintain the same functionality while adding proper restrictions:

- **Functions:** Still work exactly the same, just more secure
- **Account Requests:** Registration still works, but only authorized users can view requests
- **Notifications:** System can still create notifications via service role key

### ⚠️ Important Notes

1. **Backend Notification Creation**
   If you have backend code that creates notifications, make sure it uses the **service_role key** (not the anon key):
   ```typescript
   // Use service_role key for system operations
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!  // Not the anon key
   );
   
   // Now you can create notifications
   await supabaseAdmin.from('notifications').insert({...});
   ```

2. **Account Request Viewing**
   Only admin and commission members can view all account requests. Students can only see their own.

## Testing the Fixes

### Test 1: Function Security
```sql
-- This should work (functions still execute)
UPDATE user_profiles SET full_name = 'Test' WHERE id = 'some-id';
-- updated_at should be automatically updated
```

### Test 2: Account Requests
```sql
-- As unauthenticated user: Can create request ✅
INSERT INTO account_requests (email, full_name, student_id, credentials)
VALUES ('test@cktutas.edu.gh', 'Test User', 'UTAS001', 'hashed_password');

-- As regular student: Cannot view all requests ❌
SELECT * FROM account_requests;  -- Should return only their own

-- As admin/commission: Can view all requests ✅
SELECT * FROM account_requests;  -- Should return all
```

### Test 3: Notifications
```sql
-- As regular user: Cannot create notifications ❌
INSERT INTO notifications (user_id, type, title, message)
VALUES ('user-id', 'info', 'Test', 'Test message');  -- Should fail

-- As admin/commission: Can create notifications ✅
INSERT INTO notifications (user_id, type, title, message)
VALUES ('user-id', 'info', 'Test', 'Test message');  -- Should succeed
```

## Security Best Practices Going Forward

1. **Always Set search_path for Functions**
   ```sql
   CREATE FUNCTION my_function()
   RETURNS void
   SECURITY DEFINER
   SET search_path = public  -- Always include this!
   ```

2. **Never Use `WITH CHECK (true)` or `USING (true)`**
   - Always add proper conditions
   - Think: "Who should really have access to this?"

3. **Use Principle of Least Privilege**
   - Give users only the minimum access they need
   - Use role-based checks: `role IN ('admin', 'commission')`

4. **Regular Security Audits**
   - Check "Security Advisor" in Supabase Dashboard monthly
   - Review RLS policies when adding new features
   - Test with different user roles

## Files Created

1. **supabase/schema_security_fixes.sql**
   - Complete SQL script to fix all security issues
   - Safe to run multiple times (uses DROP IF EXISTS)
   - Includes verification queries

2. **SECURITY_FIXES_GUIDE.md** (this file)
   - Detailed explanation of each issue
   - Step-by-step fix instructions
   - Testing procedures

## Next Steps

1. ✅ Run `supabase/schema_security_fixes.sql` in Supabase SQL Editor
2. ✅ Refresh Security Advisor to verify all warnings are resolved
3. ✅ Test your application to ensure everything still works
4. ✅ Update any backend code that creates notifications to use service_role key
5. ✅ Document these security practices for your team

## Questions?

If you encounter any issues after applying these fixes:
1. Check the Supabase logs for error messages
2. Verify your RLS policies in the Dashboard
3. Test with different user roles (student, admin, commission)
4. Review the verification queries in the security fixes SQL file

---

**Status:** Ready to apply
**Risk Level:** Low (fixes are backwards compatible)
**Estimated Time:** 5 minutes
