# 🔧 Fix Login Page - Missing Data Issue

## Problem
The login page components (announcements, system status) are not showing data from the database because the required tables don't exist or are empty.

---

## ✅ Complete Fix (Run This Once)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**

### Step 2: Run the Complete Setup Script

Copy and paste this entire script and click **Run**:

```sql
-- This script will be in setup-missing-tables.sql
-- It creates:
-- 1. announcements table with sample data
-- 2. elections table with sample data
-- 3. candidates table (empty for now)
-- 4. Proper RLS policies for all tables
```

Or simply run the file: **setup-missing-tables.sql**

### Step 3: Fix the Admin User Profile

Run this to ensure your admin user has a profile:

```sql
-- Create/update admin profile
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  'Admin User',
  'admin',
  'active',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'jkorkugah23.stu@cktutas.edu.gh'
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(NULLIF(user_profiles.full_name, ''), 'Admin User'),
  role = 'admin',
  status = 'active',
  avatar_url = COALESCE(user_profiles.avatar_url, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'),
  updated_at = NOW();

-- Verify
SELECT 
  email, full_name, role, status 
FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

### Step 4: Test the Login Page

1. **Clear browser cache**: `Ctrl + Shift + Delete`
2. Go to: http://localhost:4028/login
3. You should now see:
   - ✅ **Election Updates** section with 5 announcements
   - ✅ **System Status** showing metrics (users, elections, candidates)
   - ✅ Login form working properly

### Step 5: Test Login

Login with:
- Email: `jkorkugah23.stu@cktutas.edu.gh`
- Password: `Admin@2026`

You should be redirected to: **http://localhost:4028/admin-dashboard**

---

## 📋 What This Fixes

### 1. Announcements Component
- **Before**: "No announcements at this time"
- **After**: Shows 5 sample announcements with different types and priorities

### 2. System Status Component
- **Before**: Shows "0" for all metrics
- **After**: Shows actual counts:
  - System Status: Idle/Operational
  - Active Elections: 1
  - Registered Users: (actual count)
  - Total Candidates: 0 (will increase as candidates apply)

### 3. User Profile
- **Before**: "Failed to load user profile"
- **After**: Profile loads correctly with admin role

---

## 🔍 Verification Queries

Run these to verify everything is set up:

```sql
-- Check announcements
SELECT COUNT(*) as announcements FROM public.announcements WHERE is_active = true;
-- Should return: 5

-- Check elections
SELECT COUNT(*) as elections FROM public.elections;
-- Should return: 1

-- Check admin user
SELECT email, role, status FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
-- Should return: admin role, active status

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('announcements', 'elections', 'candidates', 'user_profiles')
ORDER BY table_name;
-- Should return all 4 tables
```

---

## 📊 Sample Data Created

### Announcements (5 items):
1. **System**: Welcome to UTASVotes (High priority)
2. **Election**: Student Union Elections 2026 (High priority)
3. **Deadline**: Application Deadline Approaching (Medium priority)
4. **Fee Update**: Application Fee Structure (Low priority)
5. **General**: Campaign Guidelines Released (Medium priority)

### Elections (1 item):
- **Title**: Student Union Elections 2026
- **Status**: Upcoming
- **Type**: General
- **Start**: 7 days from now
- **End**: 14 days from now

---

## 🚨 Troubleshooting

### Issue: Still seeing "No announcements"

**Check browser console** (F12):
```javascript
// Look for errors like:
// "relation 'public.announcements' does not exist"
```

**Solution**: Run the setup script again

### Issue: "Failed to load user profile"

**Check if profile exists**:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

**If no results**: Run Step 3 again

### Issue: System Status shows "0" for everything

**Check if tables have data**:
```sql
SELECT 
  (SELECT COUNT(*) FROM public.elections) as elections,
  (SELECT COUNT(*) FROM public.user_profiles) as users,
  (SELECT COUNT(*) FROM public.candidates) as candidates;
```

**If all 0**: Run the setup script again

### Issue: RLS Policy errors

**Temporarily disable RLS** (for testing only):
```sql
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
```

**Then re-enable after testing**:
```sql
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Success Checklist

After running the setup:

- [ ] Announcements table exists with 5 records
- [ ] Elections table exists with 1 record
- [ ] Candidates table exists (empty is OK)
- [ ] User profile exists for jkorkugah23.stu@cktutas.edu.gh
- [ ] User role is 'admin'
- [ ] Login page shows announcements
- [ ] Login page shows system metrics
- [ ] Can login successfully
- [ ] Redirected to admin dashboard

---

## 📚 Files Created

1. **setup-missing-tables.sql** - Complete setup script
2. **fix-profile-issue.sql** - Admin profile fix
3. **FIX_LOGIN_PAGE_DATA.md** - This guide

---

## 🎯 Quick Summary

**Problem**: Login page components not showing data  
**Cause**: Missing database tables (announcements, elections, candidates)  
**Solution**: Run `setup-missing-tables.sql` in Supabase SQL Editor  
**Result**: Login page displays all data correctly  

**Time to fix**: 2 minutes  
**Difficulty**: Easy (just run SQL script)  
