# Clear Browser Cache and Test Login

## The Problem
Login works from Node.js but fails in the browser. This indicates a browser-specific issue, likely:
- Cached old code
- Stale session data
- Service worker interference
- Browser storage conflicts

## Solution Steps

### Step 1: Clear All Browser Data

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "All time" from the time range
3. Check these boxes:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Site settings
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Everything" from time range
3. Check:
   - ✅ Cookies
   - ✅ Cache
   - ✅ Site Preferences
4. Click "Clear Now"

### Step 2: Clear localStorage Manually

1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Click on `http://localhost:4028`
5. Right-click → **Clear**
6. Also clear **Session Storage**

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Step 4: Test in Incognito/Private Mode

1. Open a new Incognito/Private window
2. Go to `http://localhost:4028/login`
3. Try logging in with:
   - Email: `student@cktutas.edu.gh`
   - Password: `Student@2026`

### Step 5: Check Browser Console

Open Developer Tools (`F12`) → Console tab

You should see these logs:
```
✅ User authenticated: [user-id]
Auth data: { userId: ..., email: ..., emailConfirmed: ..., session: 'exists' }
Session check: Active
Fetching profile for user: [user-id]
Profile fetch result: { hasProfile: true, hasError: false }
✅ User profile loaded: [profile-object]
```

If you see errors, note them down.

## Alternative: Test with Different Browser

If the issue persists, try a different browser:
- Chrome → Try Firefox
- Firefox → Try Chrome
- Edge → Try Brave

## Still Not Working?

### Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try logging in
4. Look for failed requests (red)
5. Click on the failed request
6. Check the **Response** tab

Common issues:
- **401 Unauthorized**: Session not established
- **403 Forbidden**: RLS policy blocking
- **404 Not Found**: Wrong API endpoint
- **CORS error**: Cross-origin issue

### Enable Verbose Logging

The updated code now logs detailed information. Check the console for:
- Authentication status
- Session status
- Profile fetch attempt
- Exact error messages

### Manual Test in Console

Open browser console and run:

```javascript
// Test Supabase connection
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'https://inogysmdiergapyvavbx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub2d5c21kaWVyZ2FweXZhdmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTI3MjgsImV4cCI6MjA4NDY4ODcyOH0.IfjghMUu9uSdQbWqb9EIuSxojcmkfikIEKEPHpc3PSA'
);

// Test login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@cktutas.edu.gh',
  password: 'Student@2026'
});

console.log('Auth result:', { data, error });

// Test profile fetch
if (data?.user) {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  console.log('Profile result:', { profile, profileError });
}
```

## What Changed in the Code

1. **Simplified Supabase client** - Removed unnecessary config that might cause issues
2. **Added session check** - Verifies session is active before fetching profile
3. **Changed to `maybeSingle()`** - More forgiving than `single()`
4. **Enhanced logging** - Shows exactly what's happening at each step
5. **Increased wait time** - 1.5 seconds for session establishment

## Expected Behavior

After clearing cache and restarting:
1. Login form loads ✅
2. Enter credentials ✅
3. Authentication succeeds ✅
4. Session established ✅
5. Profile fetched ✅
6. Redirect to dashboard ✅

## If All Else Fails

Try this nuclear option:

```bash
# Stop server
# Delete everything
rm -rf node_modules .next
# Reinstall
npm install
# Restart
npm run dev
```

Then clear browser cache again and test.
