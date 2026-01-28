# ⚡ Quick Admin Promotion

## Make jkorkugah23.stu@cktutas.edu.gh an Admin

This is the **fastest and easiest** way to get admin access working!

---

## 🚀 Do This Now (30 seconds)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to SQL Editor**
3. **Paste and run this**:

```sql
-- Promote user to admin
UPDATE public.user_profiles
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';

-- Verify it worked
SELECT 
  email,
  full_name,
  role,
  status,
  CASE 
    WHEN role = 'admin' THEN '✅ SUCCESS - User is now admin!'
    ELSE '❌ FAILED - Still not admin'
  END as result
FROM public.user_profiles
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

4. **Check the result** - Should show: `✅ SUCCESS - User is now admin!`

5. **Test login**:
   - Go to: http://localhost:4028/login
   - Login with: `jkorkugah23.stu@cktutas.edu.gh` and your password
   - You'll be redirected to admin dashboard!

---

## ✅ Done!

That's it! No password resets, no user creation, no complications.

The user already exists, you just changed their role from `student` to `admin`.

---

## 🔍 If It Doesn't Work

### Check if user exists:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'jkorkugah23.stu@cktutas.edu.gh';
```

**If no results:**
- User doesn't exist yet
- See `PROMOTE_TO_ADMIN_GUIDE.md` for how to create the user first

**If results show but role is still not 'admin':**
- Run the UPDATE query again
- Make sure there are no typos in the email

---

## 📋 Quick Reference

**Admin Email:**
```
jkorkugah23.stu@cktutas.edu.gh
```

**Login URL:**
```
http://localhost:4028/login
```

**What Changed:**
- Before: `role = 'student'`
- After: `role = 'admin'`

**Access:**
- ✅ Admin Dashboard
- ✅ Admin System Control
- ✅ User Management
- ✅ Election Management
- ✅ All admin features

---

**This is way easier than creating a new admin user!**
