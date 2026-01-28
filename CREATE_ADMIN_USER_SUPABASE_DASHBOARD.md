# Create Admin User in Supabase Dashboard

## The Right Way to Create Users

You **cannot** directly insert into `auth.users` via SQL. Supabase manages this table internally. Instead, use the Dashboard or API.

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Go to Authentication
1. Open your Supabase project dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab

### Step 2: Add User
1. Click **"Add user"** button (top right)
2. Fill in the form:
   - **Email**: `admin@cktutas.edu.gh`
   - **Password**: `Admin@2026`
   - **Auto Confirm User**: ✅ Check this box (important!)
3. Click **"Create user"**

### Step 3: Copy the User ID
1. After creating, you'll see the user in the list
2. Click on the user to see details
3. **Copy the UUID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 4: Create Profile in Database
Now run this SQL in **SQL Editor**, replacing `YOUR_USER_ID_HERE` with the UUID you copied:

```sql
-- Replace YOUR_USER_ID_HERE with the actual UUID from step 3
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  status,
  department,
  position,
  phone,
  created_at,
  updated_at
)
VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS with the UUID you copied
  'admin@cktutas.edu.gh',
  'System Administrator',
  'admin',
  'active',
  'IT & Systems',
  'System Administrator',
  '+233 24 123 4567',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'System Administrator',
  role = 'admin',
  status = 'active',
  updated_at = NOW();
```

### Step 5: Verify
Run this to check:

```sql
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  au.email_confirmed_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'admin@cktutas.edu.gh';
```

You should see one row with the admin user.

## Method 2: Using Supabase Admin API (Alternative)

If you prefer to do it programmatically, create a script:

```javascript
// create-admin-via-api.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@cktutas.edu.gh',
    password: 'Admin@2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'System Administrator'
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    return;
  }

  console.log('✅ Auth user created:', authData.user.id);

  // Create profile
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email: 'admin@cktutas.edu.gh',
      full_name: 'System Administrator',
      role: 'admin',
      status: 'active',
      department: 'IT & Systems',
      position: 'System Administrator',
      phone: '+233 24 123 4567'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    return;
  }

  console.log('✅ Profile created successfully!');
  console.log('User ID:', authData.user.id);
}

createAdminUser();
```

Run with: `node create-admin-via-api.js`

## After Creating the User

Once the user is created, you can test login:

1. Go to `http://localhost:4028/login`
2. Enter:
   - Email: `admin@cktutas.edu.gh`
   - Password: `Admin@2026`
3. Should redirect to dashboard

## Important Notes

- ✅ **Auto Confirm User** must be checked, otherwise the user needs to verify email
- ✅ The **user ID** from `auth.users` must match `user_profiles.id`
- ✅ Make sure `email_confirmed_at` is set (happens automatically with Auto Confirm)
- ✅ The profile must exist in `user_profiles` table

## Troubleshooting

### User created but can't log in
- Check if `email_confirmed_at` is set in `auth.users`
- Go to Authentication → Users → Click user → Click "Send confirmation email" or manually set confirmed

### Profile not found
- Make sure you ran the INSERT into `user_profiles` with the correct user ID
- Check: `SELECT * FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';`

### Wrong password
- Reset password in Dashboard: Authentication → Users → Click user → "Send password reset"
- Or set new password directly in Dashboard

## Next Steps

After creating the admin user:
1. I'll update the login form to use real Supabase auth
2. Update session management to use Supabase sessions
3. All data will flow from database properly

Ready to proceed?
