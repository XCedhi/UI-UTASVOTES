# Commission Auto-Logout Fix

## Problem
Commission users were being logged out automatically after any activity (clicking buttons, navigating, etc.). This was caused by unreliable session management that relied only on localStorage.

## Root Cause
The `ProtectedRoute` component was checking ONLY localStorage for session data on every route change. If localStorage was temporarily unavailable or cleared during navigation, users would be logged out even though their Supabase authentication session was still valid.

## Solution
Updated session recovery logic to:

1. **Check Supabase auth first** - More reliable than localStorage
2. **Auto-restore localStorage** - If Supabase session exists but localStorage is missing, reconstruct it from the database
3. **Fallback gracefully** - Only redirect to login if both Supabase and localStorage sessions are invalid

### Files Changed

#### `src/components/common/ProtectedRoute.tsx`
- Added Supabase auth session check before localStorage
- Implements automatic session restoration from database
- Better logging for debugging
- Distinguishes between "checking" and "unauthorized" states

#### `src/components/common/Header.tsx`
- Updated `handleLogout()` to properly sign out from Supabase
- Ensures clean logout on both client and server sides

## Testing Steps

1. **Login as Commission**
   - Use credentials: `commission@cktutas.edu.gh` / `Commission@2026`

2. **Perform Activities**
   - Click on different navigation items
   - Create an election
   - Manage fees
   - Import students
   - Click any buttons on the page
   - Switch between different commission pages

3. **Verify No Logout**
   - Session should persist across all activities
   - Browser DevTools Console should show:
     - `✅ Access granted for commission to [path]` (normal navigation)
     - `🔄 Restoring session from Supabase auth...` (if localStorage was cleared)
     - `✅ Session restored from Supabase` (successful restoration)

4. **Test Actual Logout**
   - Click the user avatar → Logout
   - Should be redirected to login page
   - Console should show clean logout

## How It Works

```
Route Navigation
  ↓
ProtectedRoute Component Loads
  ↓
Check Supabase Auth Session
  ├─ ✅ Valid Supabase Session Found
  │  ├─ Check localStorage
  │  ├─ ❌ localStorage empty?
  │  │  └─ Query database for user profile
  │  │  └─ Restore localStorage from profile
  │  └─ Proceed with authorization check
  ├─ ❌ No Supabase Session
  │  └─ Redirect to login
  ↓
Check Route Permissions (canAccessRoute)
  ├─ ✅ User can access
  │  └─ Render page
  └─ ❌ User cannot access
     └─ Redirect to appropriate dashboard
```

## Key Improvements

- **Session Persistence**: Session now survives across navigation and page reloads
- **Better Reliability**: Uses Supabase auth as source of truth
- **Automatic Recovery**: Recovers from localStorage corruption/loss
- **Clean Logout**: Properly signs out from both client and Supabase
- **Better Logging**: Console logs help debug session issues

## Environment Variables Required

No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Rollback (if needed)

If issues occur, revert:
- `src/components/common/ProtectedRoute.tsx`
- `src/components/common/Header.tsx`

From git history.
