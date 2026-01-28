# Quick Login Fix - Summary

## Current Issues

1. ✅ Admin user exists in database
2. ✅ Password has been reset
3. ❌ Build errors causing login to fail
4. ❌ Module import issues

## Quick Fix Steps

### Step 1: Restart Dev Server

The build has stale modules. Restart it:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

### Step 3: Verify Admin User

Run this in Supabase SQL Editor to confirm everything is set up:

```sql
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.encrypted_password IS NOT NULL as has_password,
  up.full_name,
  up.role,
  up.status
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@cktutas.edu.gh';
```

Expected result:
- ✅ email_confirmed: true
- ✅ has_password: true
- ✅ role: admin
- ✅ status: active

### Step 4: Test Login

1. Go to `http://localhost:4028/login`
2. Enter:
   ```
   Email: admin@cktutas.edu.gh
   Password: Admin@2026
   ```
3. Click Sign In

## If Still Failing

### Check 1: Verify Environment Variables

```bash
# Run this in terminal
node verify-env.js
```

Should show:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### Check 2: Test Supabase Connection

Create a test file `test-login.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@cktutas.edu.gh',
    password: 'Admin@2026'
  });
  
  if (error) {
    console.error('❌ Login failed:', error.message);
  } else {
    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
  }
}

testLogin();
```

Run it:
```bash
node test-login.js
```

### Check 3: Browser Console Errors

Look for specific error messages:
- "Invalid login credentials" → Password issue
- "Network error" → Supabase connection issue
- "createClient is not a function" → Build issue (restart dev server)

## Common Solutions

### Solution 1: Password Not Set Correctly

Run this in Supabase SQL Editor:

```sql
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin@2026', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';
```

### Solution 2: Email Not Confirmed

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@cktutas.edu.gh';
```

### Solution 3: User Status Not Active

```sql
UPDATE public.user_profiles
SET status = 'active'
WHERE email = 'admin@cktutas.edu.gh';
```

### Solution 4: Clean Build

```bash
# Stop dev server
# Delete build cache
rm -rf .next
# Reinstall dependencies (if needed)
npm install
# Restart
npm run dev
```

## Success Checklist

- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Admin user verified in database
- [ ] Email confirmed
- [ ] Password set correctly
- [ ] User status is active
- [ ] No console errors
- [ ] Can login successfully
- [ ] Redirected to admin dashboard
- [ ] Profile picture and name display

## Credentials

```
Email: admin@cktutas.edu.gh
Password: Admin@2026
```

## Next Steps After Login Works

1. ✅ Test login tracking (check `user_sessions` table)
2. ✅ Verify profile data loads from database
3. ✅ Test profile picture upload
4. ✅ Create other test users (student, commission)
5. ✅ Test role-based access control
