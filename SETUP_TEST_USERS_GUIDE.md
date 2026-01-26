# Setting Up Test Users for UTASVotes

## Overview

After running the comprehensive schema, you need to create test users to login and test the application. This guide shows you how to set up the default test accounts.

---

## Current Mock Credentials (from LoginForm.tsx)

Your application currently uses these mock credentials for testing:

| Role | Email | Password | Name |
|------|-------|----------|------|
| **Student** | `student@cktutas.edu.gh` | `Student@2026` | John Mensah |
| **Candidate** | `candidate@cktutas.edu.gh` | `Candidate@2026` | Ama Osei |
| **Commission** | `commission@cktutas.edu.gh` | `Commission@2026` | Dr. Kwame Nkrumah |
| **Admin** | `admin@cktutas.edu.gh` | `Admin@2026` | System Administrator |

---

## Option 1: Create Users via Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Users**

### Step 2: Create Each User

Click **"Add user"** and create each test user:

#### 1. Student User
- **Email**: `student@cktutas.edu.gh`
- **Password**: `Student@2026`
- **Auto Confirm User**: ✅ Yes (for testing)
- Click **"Create user"**

#### 2. Candidate User
- **Email**: `candidate@cktutas.edu.gh`
- **Password**: `Candidate@2026`
- **Auto Confirm User**: ✅ Yes
- Click **"Create user"**

#### 3. Commission User
- **Email**: `commission@cktutas.edu.gh`
- **Password**: `Commission@2026`
- **Auto Confirm User**: ✅ Yes
- Click **"Create user"**

#### 4. Admin User
- **Email**: `admin@cktutas.edu.gh`
- **Password**: `Admin@2026`
- **Auto Confirm User**: ✅ Yes
- Click **"Create user"**

### Step 3: Copy User IDs

After creating each user:
1. Click on the user in the list
2. Copy their **UUID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. Keep these UUIDs handy for the next step

### Step 4: Create User Profiles

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `supabase/seed_test_users.sql`
3. **Replace the placeholder UUIDs** with the actual UUIDs you copied:

```sql
-- Replace this:
'00000000-0000-0000-0000-000000000001'

-- With the actual UUID from Supabase Auth:
'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
```

4. Execute the SQL script
5. Verify profiles were created:

```sql
SELECT id, email, full_name, role, status 
FROM public.user_profiles;
```

---

## Option 2: Create Users via Supabase API (Programmatic)

If you prefer to automate user creation, use this Node.js script:

### Create `scripts/create-test-users.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service role key!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'student@cktutas.edu.gh',
    password: 'Student@2026',
    profile: {
      full_name: 'John Mensah',
      student_id: 'UTAS2024001',
      department: 'Computer Science',
      level: '300',
      cgpa: 3.45,
      role: 'student',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    }
  },
  {
    email: 'candidate@cktutas.edu.gh',
    password: 'Candidate@2026',
    profile: {
      full_name: 'Ama Osei',
      student_id: 'UTAS2024002',
      department: 'Business Administration',
      level: '400',
      cgpa: 3.67,
      role: 'candidate',
      status: 'active',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      bio: 'Aspiring SRC President committed to student welfare.'
    }
  },
  {
    email: 'commission@cktutas.edu.gh',
    password: 'Commission@2026',
    profile: {
      full_name: 'Dr. Kwame Nkrumah',
      position: 'Electoral Commissioner',
      department: 'Student Affairs',
      role: 'commission',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      access_start_date: new Date().toISOString(),
      access_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    email: 'admin@cktutas.edu.gh',
    password: 'Admin@2026',
    profile: {
      full_name: 'System Administrator',
      position: 'System Administrator',
      role: 'admin',
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    }
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Failed to create ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created auth user: ${user.email}`);

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          ...user.profile
        });

      if (profileError) {
        console.error(`❌ Failed to create profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for: ${user.email}\n`);
      }

    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Test user creation complete!');
  console.log('\nYou can now login with:');
  testUsers.forEach(user => {
    console.log(`- ${user.email} / ${user.password}`);
  });
}

createTestUsers();
```

### Run the script:

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run the script
node scripts/create-test-users.js
```

---

## Option 3: Keep Using Mock Authentication (Development Only)

If you want to continue using the mock authentication from `LoginForm.tsx` without real Supabase users:

### Update `src/lib/auth-utils.ts`:

```typescript
export const setUserSession = (user: {
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name);
    if (user.avatar) {
      localStorage.setItem('userAvatar', user.avatar);
    }
  }
};
```

This keeps the mock login working, but you won't have real database records.

---

## Verification

After creating users, verify they work:

### 1. Check Auth Users

```sql
-- In Supabase SQL Editor
SELECT id, email, created_at 
FROM auth.users;
```

### 2. Check User Profiles

```sql
SELECT id, email, full_name, role, status 
FROM public.user_profiles;
```

### 3. Test Login

1. Go to your application: `http://localhost:4028/login`
2. Try logging in with each test account
3. Verify you're redirected to the correct dashboard

---

## Troubleshooting

### Issue: "User not found" after login

**Solution**: Make sure you created the user profile in `user_profiles` table after creating the auth user.

### Issue: "Invalid login credentials"

**Solution**: 
- Check the email is exactly `@cktutas.edu.gh`
- Verify password meets requirements (8+ chars, uppercase, lowercase, number, special char)
- Make sure user is confirmed in Supabase Auth

### Issue: "Access denied" or wrong dashboard

**Solution**: Check the `role` field in `user_profiles` table matches the expected role.

### Issue: RLS policy blocking access

**Solution**: Temporarily disable RLS for testing:

```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

(Re-enable after testing!)

---

## Production Setup

For production, **DO NOT** use these test credentials:

1. **Disable mock authentication** in `LoginForm.tsx`
2. **Use real Supabase Auth** signup flow
3. **Require email verification**
4. **Implement password reset**
5. **Use strong, unique passwords**
6. **Enable MFA** for admin/commission accounts

---

## Summary

**Recommended Approach**:
1. ✅ Create users via Supabase Dashboard (Option 1)
2. ✅ Update UUIDs in `seed_test_users.sql`
3. ✅ Run the seed script
4. ✅ Test login with all 4 accounts
5. ✅ Verify correct dashboard access

**Quick Test Credentials**:
- Student: `student@cktutas.edu.gh` / `Student@2026`
- Candidate: `candidate@cktutas.edu.gh` / `Candidate@2026`
- Commission: `commission@cktutas.edu.gh` / `Commission@2026`
- Admin: `admin@cktutas.edu.gh` / `Admin@2026`

Now you're ready to test all features of UTASVotes! 🎉

