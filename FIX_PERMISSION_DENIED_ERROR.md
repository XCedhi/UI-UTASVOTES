# Fix: "permission denied for table user_profiles"

## 🎯 The Problem

The API can't write to the `user_profiles` table because:
1. The service role key isn't loaded, OR
2. The dev server needs to be restarted

## ✅ Quick Fix (Do This Now!)

### Step 1: Stop the Dev Server
Press **Ctrl+C** in your terminal to stop the server

### Step 2: Restart the Dev Server
```bash
npm run dev
```

### Step 3: Wait for Server to Start
Wait until you see:
```
✓ Ready in X.Xs
○ Local: http://localhost:4028
```

### Step 4: Try Import Again
1. Go to the import page
2. Upload your Excel file
3. Click Import

## 🔍 Why This Happens

Next.js loads environment variables **when the server starts**. If you:
- Added `SUPABASE_SERVICE_ROLE_KEY` to `.env` after starting the server
- Modified the `.env` file while server was running

The server won't see the new values until you restart it.

## ✅ Verify It's Fixed

After restarting and trying import, check the browser console (F12). You should see:

```
✅ Environment variables loaded
📍 Supabase URL: https://inogysmdiergapyvavbx.supabase.co
🔑 Service role key present: Yes
```

If you see this, the import should work!

## ❌ Still Getting Permission Denied?

### Check 1: Verify Service Role Key

1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Scroll to **Project API keys**
4. Copy the **service_role** key (NOT the anon key!)
5. Compare with your `.env` file

The key should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Check 2: Verify .env File Location

Make sure `.env` is in the **root** of your project:
```
utasvotes/
├── .env          ← Should be here
├── src/
├── public/
├── package.json
└── ...
```

NOT in:
- ❌ `src/.env`
- ❌ `src/app/.env`
- ❌ Any subfolder

### Check 3: Check for Typos

In `.env`, make sure it's exactly:
```
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

NOT:
- ❌ `SUPABASE_SERVICE_ROLE_KEY =` (space before =)
- ❌ `SUPABASE_SERVICE_ROLE_KEY= ` (space after =)
- ❌ `SUPABASE_SERVICE_ROLE_KEY="your-key"` (quotes)
- ❌ `SUPABASE_SERVICE_ROLEKEY` (missing underscore)

### Check 4: Verify Key Works

Test the key with this SQL query in Supabase SQL Editor:

```sql
-- This should return your tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

If you see `user_profiles` in the list, the table exists.

## 🧪 Alternative: Temporarily Disable RLS

**⚠️ ONLY FOR TESTING - NOT FOR PRODUCTION!**

If you need to test immediately, you can temporarily disable RLS:

1. Go to Supabase SQL Editor
2. Run:
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

3. Try import
4. **IMPORTANT**: Re-enable after testing:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

## 📋 Complete Restart Checklist

1. [ ] Stop dev server (Ctrl+C)
2. [ ] Verify `.env` has `SUPABASE_SERVICE_ROLE_KEY`
3. [ ] Verify key is correct (from Supabase Dashboard)
4. [ ] Clear terminal
5. [ ] Run `npm run dev`
6. [ ] Wait for "Ready" message
7. [ ] Refresh browser page
8. [ ] Try import again
9. [ ] Check console (F12) for environment variable logs

## 🎉 Success Indicators

After restart, you should see:
1. ✅ Console shows "Environment variables loaded"
2. ✅ Import completes successfully
3. ✅ Success message: "Successfully created X student accounts"
4. ✅ Students appear in User Management
5. ✅ Students appear in Supabase database

## 🆘 Still Not Working?

If after restarting you still get permission denied:

1. **Check server logs** in terminal for errors
2. **Check browser console** (F12) for the environment variable logs
3. **Share the console output** - it will show if the key is loaded

The updated code now shows exactly what's happening with the environment variables!
