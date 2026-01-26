# Student Import Error Troubleshooting

## Error: "Failed to create user profile"

This error means the auth user was created successfully, but the profile creation in `user_profiles` table failed.

## 🔍 Diagnostic Steps

### Step 1: Check Browser Console (F12)

After the error appears, press **F12** and look for detailed error messages. You should see:

```
❌ Error creating profile for student@cktutas.edu.gh: {
  message: "...",
  code: "...",
  details: "...",
  hint: "..."
}
```

The error message will tell you exactly what's wrong.

### Step 2: Clean Up Orphaned Data

#### Check Authentication
```
Supabase Dashboard → Authentication → Users
```
- Look for the email that failed
- If it exists, delete it (three dots → Delete user)

#### Check User Profiles
```
Supabase Dashboard → Table Editor → user_profiles
```
- Look for any row with that email
- If it exists, delete it

### Step 3: Verify Database Schema

Run this SQL query in Supabase SQL Editor:

```sql
-- Check if user_profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid, NOT NULL)
- `email` (text, NOT NULL)
- `full_name` (text, NOT NULL)
- `student_id` (text, nullable)
- `phone` (text, nullable)
- `department` (text, nullable)
- `level` (text, nullable)
- `role` (text, NOT NULL)
- `status` (text, NOT NULL)
- `created_at` (timestamp, NOT NULL)
- `updated_at` (timestamp, NOT NULL)

### Step 4: Check RLS Policies

Run this SQL query:

```sql
-- Check RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

The service role key should bypass RLS, but if there are issues, you can temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS for testing (re-enable after!)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ Remember to re-enable after testing:**
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

## 🐛 Common Error Messages & Fixes

### Error: "duplicate key value violates unique constraint"

**Cause**: A user with that email or student_id already exists

**Fix**:
1. Go to Table Editor → user_profiles
2. Search for the email or student_id
3. Delete the existing row
4. Try import again

### Error: "null value in column violates not-null constraint"

**Cause**: Required field is missing from Excel file

**Fix**:
1. Check your Excel file has all required columns:
   - Student ID
   - First Name
   - Last Name
   - Email
   - Department
   - Level
   - Program
2. Ensure no cells are empty for required fields

### Error: "relation 'user_profiles' does not exist"

**Cause**: Database table not created

**Fix**:
1. Go to Supabase SQL Editor
2. Run the schema file: `supabase/schema_comprehensive.sql`
3. Wait for completion
4. Try import again

### Error: "permission denied for table user_profiles"

**Cause**: Service role key not set or incorrect

**Fix**:
1. Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`
2. Verify the key is correct (from Supabase Dashboard → Settings → API)
3. Restart dev server: `npm run dev`

### Error: "violates foreign key constraint"

**Cause**: The `id` field references `auth.users.id` which doesn't exist

**Fix**:
1. This shouldn't happen as we create auth user first
2. Check Supabase logs: Dashboard → Logs → API Logs
3. Look for auth user creation errors

## 🧪 Test Import Process

### Create a Simple Test File

Create `test-import.xlsx`:

| Student ID | First Name | Last Name | Email | Department | Level | Program |
|------------|------------|-----------|-------|------------|-------|---------|
| 9999999 | Test | Student | test.import@cktutas.edu.gh | Computer Science | 100 | BSc CS |

### Import Steps

1. **Clean up first**:
   ```sql
   -- Delete test user if exists
   DELETE FROM user_profiles WHERE email = 'test.import@cktutas.edu.gh';
   ```

2. **Import the file**

3. **Check console** (F12) for detailed errors

4. **Verify in database**:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'test.import@cktutas.edu.gh';
   ```

## 🔧 Manual Profile Creation Test

Test if you can manually create a profile:

```sql
-- First, get a valid auth user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Then try to insert a profile (use the ID from above)
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  student_id,
  department,
  level,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'paste-auth-user-id-here',
  'manual.test@cktutas.edu.gh',
  'Manual Test',
  '8888888',
  'Computer Science',
  '100',
  'student',
  'active',
  NOW(),
  NOW()
);
```

If this fails, the error message will tell you exactly what's wrong with the table structure.

## 📋 Checklist Before Importing

- [ ] `user_profiles` table exists
- [ ] SUPABASE_SERVICE_ROLE_KEY is set in `.env`
- [ ] Dev server restarted after `.env` changes
- [ ] No orphaned auth users for the email
- [ ] No orphaned profiles for the email
- [ ] Excel file has all required columns
- [ ] All required fields have values
- [ ] Email ends with `@cktutas.edu.gh`
- [ ] Student ID is numeric only

## 🆘 Still Not Working?

1. **Check Supabase Logs**:
   ```
   Dashboard → Logs → API Logs
   ```
   Look for errors around the time of import

2. **Check Browser Network Tab**:
   - Press F12 → Network tab
   - Try import
   - Click on `/api/import-students` request
   - Check Response tab for error details

3. **Share the Error**:
   - Copy the full error from browser console
   - Copy the error from Supabase logs
   - This will help diagnose the exact issue

## 🎯 Next Steps

After updating the API code:
1. **Restart dev server** (if running)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try import again**
4. **Check console** (F12) for detailed error message
5. **Share the error** if still having issues

The updated code now shows the **actual database error message** instead of the generic "Failed to create user profile", which will help us identify the exact problem!
