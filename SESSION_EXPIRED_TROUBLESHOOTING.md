# Session Expired Error - Troubleshooting Guide

## What I Changed

Simplified the session handling code to be more direct and added extensive console logging to help debug the issue.

## Steps to Debug

### 1. Open Browser Console
Press `F12` to open Developer Tools, then click on the "Console" tab.

### 2. Try to Save Profile Changes
1. Go to `/admin-profile`
2. Click "Edit Profile"
3. Change something (name, phone, etc.)
4. Click "Save Changes"
5. **Watch the console output**

### 3. Look for These Console Logs

You should see logs in this order:

```
💾 Saving profile changes...
✅ Session found, User ID: [your-user-id]
📝 Updating profile with data: {...}
📡 API response status: 200
📡 API response data: {...}
✅ Profile updated successfully via API
🔄 Refreshing profile data from database...
🔍 Fetching admin profile from database...
👤 Session user ID: [your-user-id]
✅ Profile data fetched: {...}
```

### 4. If You See "❌ No session found"

The console will show:
```
❌ No session found
Session data: null (or undefined)
```

**This means**: Your Supabase session is not being stored properly.

**Solutions**:
1. **Hard refresh the page**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache and cookies**
3. **Log out and log back in**
4. **Check if cookies are enabled** in your browser
5. **Check if you're in incognito/private mode** (sessions don't persist well there)

### 5. If API Response Status is NOT 200

The console will show:
```
📡 API response status: 401 (or 500, etc.)
❌ API error: [error message]
```

**This means**: The API route is failing.

**Check**:
1. Is `SUPABASE_SERVICE_ROLE_KEY` set in your `.env` file?
2. Run this in terminal:
   ```bash
   node -e "console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Key is set' : 'Key is MISSING')"
   ```
3. Restart your dev server after adding the key

### 6. Check Network Tab

1. In Developer Tools, click "Network" tab
2. Try saving again
3. Look for a request to `/api/admin/update-profile`
4. Click on it
5. Check:
   - **Status**: Should be 200
   - **Request Payload**: Should have userId, fullName, phone, etc.
   - **Response**: Should have success: true

## Common Issues & Solutions

### Issue 1: "Session expired" but you just logged in
**Cause**: Browser not storing Supabase session in localStorage

**Solution**:
1. Check browser console for localStorage errors
2. Make sure you're not in incognito mode
3. Check browser settings - cookies must be enabled
4. Try a different browser

### Issue 2: Session exists but API fails
**Cause**: Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY`

**Solution**:
1. Check `.env` file has this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
2. Get the key from Supabase Dashboard → Settings → API → service_role key
3. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue 3: Everything works but UI doesn't update
**Cause**: State not refreshing after save

**Solution**: This should be fixed now with `await fetchAdminProfile()` after save

### Issue 4: Console shows no logs at all
**Cause**: Code not running or page not refreshed

**Solution**:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear `.next` folder: Delete it and restart dev server
3. Check if you're on the right page: `/admin-profile`

## Manual Session Check

Run this in browser console to check if session exists:

```javascript
// Check localStorage
const keys = Object.keys(localStorage);
const supabaseKey = keys.find(k => k.includes('supabase.auth.token'));
console.log('Supabase key:', supabaseKey);
console.log('Session data:', localStorage.getItem(supabaseKey));
```

If this returns `null` or `undefined`, your session is not being stored.

## Still Not Working?

Please provide:
1. **All console logs** when you click "Save Changes"
2. **Network tab** screenshot showing the `/api/admin/update-profile` request
3. **Browser and version** you're using
4. **Are you in incognito mode?**
5. **Any errors in the console** (red text)

## Quick Fix to Try Right Now

1. **Log out completely**
2. **Close all browser tabs** for localhost:4028
3. **Clear browser cache**: Ctrl+Shift+Delete → Clear cache
4. **Restart dev server**: Stop and run `npm run dev`
5. **Open fresh tab**: Go to `http://localhost:4028/login`
6. **Log in again**: admin@cktutas.edu.gh / Admin@2026
7. **Try editing profile again**

This forces a fresh session to be created.
