# Fix Admin Dashboard Not Loading

## Problem
The admin dashboard is stuck on loading screen because it's trying to query tables that don't exist:
- `votes` - stores election votes
- `system_alerts` - system-wide alerts
- `activity_logs` - audit trail of system activities

## Solution

### Step 1: Run SQL Script in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `create-missing-dashboard-tables.sql`
6. Click "Run" or press Ctrl+Enter

### Step 2: Verify Tables Were Created

After running the script, verify the tables exist:

1. In Supabase Dashboard, go to "Table Editor"
2. You should now see these new tables:
   - `votes`
   - `system_alerts`
   - `activity_logs`

### Step 3: Test the Dashboard

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Go to http://localhost:4028/login
3. Login with: `jkorkugah23.stu@cktutas.edu.gh` / `Admin@2026`
4. The dashboard should now load properly

## What the Script Does

The SQL script creates three essential tables:

1. **votes** - Stores all votes cast in elections
   - Links to elections, users, and candidates
   - Prevents duplicate votes (one vote per position per election)

2. **system_alerts** - System-wide alerts for administrators
   - Tracks security issues, warnings, and system events
   - Can be marked as resolved

3. **activity_logs** - Audit trail of all system activities
   - Records user actions, system events
   - Helps with debugging and security monitoring

All tables have:
- Row Level Security (RLS) enabled
- Proper access policies for different user roles
- Indexes for better performance

## Expected Dashboard Behavior After Fix

Once the tables are created, the dashboard will show:

✅ System Metrics:
- Total Users: 4
- Active Elections: 0
- Total Votes Cast: 0
- System Uptime: 99.9%
- Pending Applications: 0
- Security Alerts: 0

✅ Quick Actions:
- Import Student Data
- User Management
- View Results
- System Status
- Security Alerts
- Export Data

✅ Recent Activity:
- "System Initialized" activity log entry

## Troubleshooting

If dashboard still doesn't load after running the script:

1. **Check browser console** (F12 → Console tab)
   - Look for any error messages
   - Share them with me

2. **Verify localStorage**
   - Open browser console (F12)
   - Type: `localStorage.getItem('userRole')`
   - Should return: `"admin"`
   - Type: `localStorage.getItem('userEmail')`
   - Should return: `"jkorkugah23.stu@cktutas.edu.gh"`

3. **Check Supabase connection**
   - Run: `node diagnose-admin-dashboard.js`
   - All tables should show ✅ instead of ❌

4. **Restart dev server**
   - Stop the server (Ctrl+C)
   - Run: `npm run dev`
   - Try logging in again

## Current Login Credentials

- **Admin**: `jkorkugah23.stu@cktutas.edu.gh` / `Admin@2026`
- **Commission**: `commission@cktutas.edu.gh` / `Commission@2026`
- **Student**: `student@cktutas.edu.gh` / `Student@2026`
