# Restart and Test - Complete Guide

## The Issue

The browser is showing cached errors from the old code. Even though we've fixed the imports, the browser needs to be completely refreshed.

## Complete Fix Steps

### Step 1: Stop Dev Server

In your terminal where `npm run dev` is running:
- Press `Ctrl+C` to stop the server

### Step 2: Clear Next.js Cache

```bash
# Delete the .next folder
rmdir /s /q .next

# Or on PowerShell:
Remove-Item -Recurse -Force .next
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

Wait for it to say "Ready" before proceeding.

### Step 4: Clear Browser Cache

**Option A: Hard Refresh**
1. Open the login page
2. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

**Option B: Clear Cache via DevTools**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Clear All Cache**
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### Step 5: Test Login

1. Go to `http://localhost:4028/login`
2. Enter credentials:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
3. Click "Sign In"

## Expected Result

✅ No console errors
✅ Login successful
✅ Redirected to `/admin-dashboard`
✅ Profile picture and name load from database

## If Still Getting Errors

### Check 1: Verify All Files Are Saved

Make sure these files have the correct imports:

```typescript
// ✅ CORRECT
import { supabase } from '@/lib/supabase';

// ❌ WRONG
import { createClient } from '@/lib/supabase';
const supabase = createClient();
```

Files that should have the correct import:
- `src/app/login/components/LoginForm.tsx`
- `src/app/login/components/SystemStatus.tsx`
- `src/app/login/components/ElectionAnnouncements.tsx`

### Check 2: Verify Supabase Client Export

Check `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Check 3: Environment Variables

```bash
# Run this to verify
node verify-env.js
```

Should show:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY

### Check 4: Database User

Run in Supabase SQL Editor:

```sql
SELECT 
  au.email,
  au.email_confirmed_at IS NOT NULL as confirmed,
  au.encrypted_password IS NOT NULL as has_password,
  up.role,
  up.status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

Expected:
- confirmed: true
- has_password: true
- role: admin
- status: active

## Alternative: Use Incognito Mode

If clearing cache doesn't work:

1. Open an Incognito/Private window
2. Go to `http://localhost:4028/login`
3. Try logging in

This ensures no cached files are used.

## Still Not Working?

### Nuclear Option: Complete Reset

```bash
# Stop dev server (Ctrl+C)

# Delete all build artifacts
rmdir /s /q .next
rmdir /s /q node_modules

# Reinstall dependencies
npm install

# Restart
npm run dev
```

## Success Indicators

When everything is working, you should see in browser console:

```
✅ User authenticated: [user-id]
✅ User profile loaded: {full_name: "System Administrator", ...}
✅ Login tracked in database
```

And NO errors about:
- ❌ "createClient is not a function"
- ❌ "WEBPACK_IMPORTED_MODULE"
- ❌ "Invalid login credentials" (unless password is actually wrong)

## Quick Test Commands

### Test 1: Check if server is running
```bash
curl http://localhost:4028
```

### Test 2: Check Supabase connection
```bash
node test-connection.js
```

### Test 3: Check if admin user exists
Run `diagnose-login-issue.sql` in Supabase SQL Editor

## Credentials

```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

## After Successful Login

You should see:
1. ✅ Admin Dashboard page
2. ✅ Profile picture in header (from database)
3. ✅ Name "System Administrator" in header
4. ✅ No console errors
5. ✅ Login recorded in `user_sessions` table

Verify login was tracked:

```sql
SELECT * FROM user_sessions 
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'admin@cktutas.edu.gh')
ORDER BY login_at DESC 
LIMIT 1;
```

Should show your recent login!
