# UTASVotes Testing Guide

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   ```
   http://localhost:4028
   ```

3. **You'll be redirected to `/login`**

## 🔐 Test Credentials

### Admin Account
```
Email: admin@cktutas.edu.gh
Password: Admin@2026
Dashboard: /admin-dashboard
```

**Admin Can Access:**
- ✅ Admin Dashboard
- ✅ Election Management
- ✅ User Management
- ✅ System Status
- ✅ Security Alerts
- ✅ Admin Election Results
- ✅ All student/commission pages

### Electoral Commission Account
```
Email: commission@cktutas.edu.gh
Password: Commission@2026
Dashboard: /electoral-commission-panel
```

**Commission Can Access:**
- ✅ Electoral Commission Panel
- ✅ Admin Election Results
- ✅ Student Election Results
- ❌ Admin Dashboard (redirected)
- ❌ Admin System Control (redirected)

### Student Account
```
Email: student@cktutas.edu.gh
Password: Student@2026
Dashboard: /student-dashboard
```

**Student Can Access:**
- ✅ Student Dashboard
- ✅ Voting Interface
- ✅ Candidate Registration
- ✅ Student Election Results
- ✅ Campaign Feed
- ✅ Profile
- ✅ Settings
- ✅ Election Guidelines
- ✅ Contact Admin
- ✅ Report Issue
- ❌ Admin pages (redirected)
- ❌ Commission pages (redirected)

### Candidate Account
```
Email: candidate@cktutas.edu.gh
Password: Candidate@2026
Dashboard: /student-dashboard
```

**Candidate Can Access:**
- Same as Student (candidates are students who applied)

## 🧪 Testing Scenarios

### Scenario 1: Admin Login & Navigation
1. Login as admin
2. Click "Manage Elections" → Should open Election Management
3. Click "User Management" → Should open User Management
4. Click "System Status" → Should open System Status
5. Click "Security Alerts" → Should open Security Alerts
6. Click "View Results" → Should open Admin Election Results
7. Click profile menu → Logout → Should return to login
8. **Try accessing any protected page without login → Should redirect to login**

### Scenario 2: Student Login & Voting
1. Login as student
2. View dashboard with elections
3. Click "Vote" in header → Should open Voting Interface
4. Click "Apply" in header → Should open Candidate Registration
5. Click "Results" → Should open Student Election Results
6. **Try to access `/admin-dashboard` → Should redirect to student dashboard**
7. **Try to access `/electoral-commission-panel` → Should redirect to student dashboard**

### Scenario 3: Commission Login & Management
1. Login as commission
2. View Electoral Commission Panel
3. Click "Results" → Should open Admin Election Results
4. **Try to access `/admin-dashboard` → Should redirect to commission panel**
5. **Try to access `/admin-system-control/users/manage` → Should redirect to commission panel**

### Scenario 4: Role-Based Access Control (CRITICAL TEST)
1. Login as student
2. Manually navigate to `/admin-dashboard` → **Redirected to `/student-dashboard`**
3. Manually navigate to `/admin-system-control/election` → **Redirected to `/student-dashboard`**
4. Logout
5. Login as admin
6. Navigate to `/admin-dashboard` → **Access granted**
7. Navigate to `/student-dashboard` → **Access granted (admin can access all)**
8. Logout
9. Try to access `/profile` without login → **Redirected to `/login`**

### Scenario 5: Form Submissions
1. Login as student
2. Go to `/contact-admin`
3. Fill out form and submit → Success message with ticket
4. Go to `/report-issue`
5. Fill out bug report → Success with ticket number
6. Go to `/profile`
7. Edit profile information → Save changes

### Scenario 6: Password Reset Flow
1. On login page, click "Forgot password?"
2. Enter email: `student@cktutas.edu.gh`
3. Submit → Success message
4. Navigate to `/reset-password`
5. Enter new password with requirements
6. Submit → Success, redirect to login

## 🔍 Button Testing Checklist

### Header Buttons (All Roles)
- [ ] Logo → Redirects to appropriate dashboard
- [ ] Dashboard link → Opens role-specific dashboard
- [ ] Vote link (students only) → Opens voting interface
- [ ] Apply link (students only) → Opens candidate registration
- [ ] Results link → Opens role-specific results page
- [ ] Manage Elections (admin/commission) → Opens management panel
- [ ] Notifications bell → Opens dropdown
- [ ] Profile menu → Opens with options
- [ ] View Profile → Opens profile page
- [ ] Settings → Opens settings page
- [ ] Help & Support → Opens contact admin
- [ ] Logout → Clears session, returns to login

### Admin Dashboard Buttons
- [ ] Manage Elections → `/admin-system-control/election`
- [ ] User Management → `/admin-system-control/users/manage`
- [ ] View Results → `/admin-election-results`
- [ ] System Status → `/admin-system-control/ops/status`
- [ ] Security Alerts → `/admin-system-control/ops/alerts`
- [ ] Export Data → Alert (simulated)

### Admin Election Results Buttons
- [ ] Export PDF → Alert (simulated)
- [ ] Export CSV → Alert (simulated)
- [ ] Certify & Send Results → Alert (simulated)

### Election Management Buttons
- [ ] Create Election → Alert (simulated)
- [ ] Edit Election → Alert (simulated)
- [ ] Back → Returns to previous page

### User Management Buttons
- [ ] Invite User → Alert (simulated)
- [ ] Edit User → Alert (simulated)
- [ ] Back → Returns to previous page

### Profile Page Buttons
- [ ] Edit Profile → Enables editing
- [ ] Save Changes → Saves and shows success
- [ ] Cancel → Cancels editing
- [ ] Change Password → Redirects to forgot password
- [ ] Upload Photo → Opens file picker (simulated)

### Settings Page Buttons
- [ ] Toggle switches → Enable/disable settings
- [ ] Theme selection → Changes theme preference
- [ ] Save Changes → Saves settings
- [ ] Cancel → Returns to previous page

### Form Submission Buttons
- [ ] Login → Authenticates and redirects
- [ ] Forgot Password → Sends reset email
- [ ] Reset Password → Updates password
- [ ] Contact Admin → Submits ticket
- [ ] Report Issue → Creates bug report
- [ ] Candidate Registration → Multi-step submission

## 🎯 Expected Behaviors

### Authentication
- ✅ Invalid credentials → Error message
- ✅ Valid credentials → Redirect to role dashboard
- ✅ Session persists on page reload
- ✅ Logout clears session completely

### Navigation
- ✅ Protected routes check authentication
- ✅ Role-based access enforced
- ✅ Unauthorized access redirects appropriately
- ✅ Back buttons work correctly

### Forms
- ✅ Validation shows errors inline
- ✅ Required fields enforced
- ✅ Email format validated
- ✅ Password strength checked
- ✅ Success messages displayed
- ✅ Loading states shown during submission

### UI/UX
- ✅ Smooth transitions (250ms)
- ✅ Hover effects on buttons
- ✅ Loading spinners during async operations
- ✅ Icons display correctly
- ✅ Responsive on mobile/tablet/desktop
- ✅ Glassmorphism effects visible

## 🐛 Known Limitations (Mock Data)

1. **Authentication**: Uses localStorage, not real Supabase auth
2. **Data Persistence**: No real database, data resets on refresh
3. **File Uploads**: Simulated, files not actually stored
4. **Payments**: Stripe integration not implemented
5. **Emails**: Email sending simulated with alerts
6. **Real-time Updates**: Not connected to Supabase subscriptions
7. **Export Functions**: Generate alerts instead of actual files

## ✅ What's Fully Functional

1. **Role-based routing** - Complete and working with ProtectedRoute wrapper
2. **Login/Logout** - Fully functional with session management
3. **Navigation** - All links work correctly
4. **Route Protection** - All protected pages enforce authentication and role checks
5. **Form validation** - Client-side validation working
6. **UI interactions** - Buttons, modals, dropdowns functional
7. **Responsive design** - Works on all screen sizes
8. **Loading states** - Shown during operations
9. **Error handling** - Displays appropriate messages
10. **Access control** - Unauthorized access properly redirected

## 🔄 Next Steps for Production

1. Replace localStorage auth with Supabase Auth
2. Connect all forms to Supabase database
3. Implement real file upload to Supabase Storage
4. Add Stripe payment integration
5. Configure email service (SendGrid/AWS SES)
6. Add real-time subscriptions
7. Implement actual PDF/CSV export
8. Add comprehensive error logging
9. Set up monitoring and analytics
10. Deploy to production environment

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify you're using correct test credentials
3. Clear localStorage and try again
4. Restart development server
5. Check that all dependencies are installed

---

**Happy Testing! 🎉**
