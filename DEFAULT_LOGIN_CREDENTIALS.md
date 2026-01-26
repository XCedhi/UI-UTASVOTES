# Default Login Credentials - UTASVotes

## 🔐 Test User Accounts

After setting up the database schema, use these credentials to test different user roles:

---

### 👨‍🎓 Student Account
```
Email:    student@cktutas.edu.gh
Password: Student@2026
Role:     Student
Access:   Vote, view elections, campaign feed, profile
```

**Dashboard**: `/student-dashboard`

**Features**:
- View active elections
- Cast votes
- View election results
- Engage with campaign feed (like, comment, share)
- Create posts
- View voting history
- Check deadlines

---

### 🎯 Candidate Account
```
Email:    candidate@cktutas.edu.gh
Password: Candidate@2026
Role:     Candidate (also has student access)
Access:   Apply for positions, campaign, vote
```

**Dashboard**: `/student-dashboard` (with candidate features)

**Features**:
- All student features
- Apply for election positions
- Upload manifesto and documents
- Pay application fees
- Create campaign posts
- View application status
- Track campaign engagement

---

### 🛡️ Electoral Commission Account
```
Email:    commission@cktutas.edu.gh
Password: Commission@2026
Role:     Electoral Commission
Access:   Manage elections, verify candidates, monitor results
```

**Dashboard**: `/electoral-commission-panel`

**Features**:
- Create and manage elections
- Review candidate applications
- Approve/reject candidates
- Import student voter data
- Monitor real-time election results
- Generate election reports
- Manage fee structures
- View system analytics

**Note**: Commission access is time-bound (expires after 1 year by default)

---

### 👑 Admin Account
```
Email:    admin@cktutas.edu.gh
Password: Admin@2026
Role:     Administrator
Access:   Full system control
```

**Dashboard**: `/admin-dashboard`

**Features**:
- All Electoral Commission features
- User management (invite, edit, deactivate)
- System settings configuration
- Security monitoring
- Activity logs and audit trail
- System alerts management
- Database operations
- Full override capabilities

---

## 🚨 Important Notes

### For Development/Testing Only
These credentials are for **development and testing purposes only**. 

**DO NOT use in production!**

### Setting Up Test Users

1. **Create users in Supabase Auth** (Dashboard → Authentication → Users)
2. **Run the seed script** (`supabase/seed_test_users.sql`)
3. **Verify profiles** were created in `user_profiles` table

See **`SETUP_TEST_USERS_GUIDE.md`** for detailed setup instructions.

### Password Requirements

All passwords must meet these requirements:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (@, #, $, etc.)

### Email Domain Restriction

All users must use institutional email: **`@cktutas.edu.gh`**

---

## 🔄 Role Switching

### Candidate Role
Candidates have **dual access**:
- Student features (voting, viewing results)
- Candidate features (campaigning, application management)

They can switch between views in the application.

### Commission Role
Commission members have **time-bound access**:
- Access automatically expires after the set period
- System automatically downgrades to student role after expiry
- Can be extended by admin before expiration

---

## 🧪 Testing Scenarios

### Test Student Features
Login as: `student@cktutas.edu.gh`
- Browse active elections
- Cast votes
- View results
- Engage with campaign feed

### Test Candidate Features
Login as: `candidate@cktutas.edu.gh`
- Apply for a position
- Upload documents
- Create campaign posts
- Track application status

### Test Commission Features
Login as: `commission@cktutas.edu.gh`
- Create an election
- Review applications
- Approve candidates
- Generate reports

### Test Admin Features
Login as: `admin@cktutas.edu.gh`
- Manage users
- Configure system settings
- View security logs
- Override any action

---

## 🔒 Security Best Practices

### For Production Deployment

1. **Remove test accounts** before going live
2. **Use strong, unique passwords** for real accounts
3. **Enable email verification** for new signups
4. **Implement MFA** for admin/commission accounts
5. **Rotate admin passwords** regularly
6. **Monitor login attempts** and security events
7. **Use environment variables** for sensitive data
8. **Enable audit logging** for all admin actions

---

## 📞 Support

If you have issues logging in:

1. **Check Supabase Auth** - Verify user exists
2. **Check user_profiles** - Verify profile was created
3. **Check RLS policies** - May be blocking access
4. **Check browser console** - Look for error messages
5. **Review logs** - Check Supabase Dashboard → Logs

---

## 📚 Related Documentation

- **`SETUP_TEST_USERS_GUIDE.md`** - Detailed setup instructions
- **`DATABASE_SCHEMA_DOCUMENTATION.md`** - Schema reference
- **`SCHEMA_MIGRATION_GUIDE.md`** - Migration steps
- **`COMPREHENSIVE_SCHEMA_SUMMARY.md`** - Complete overview

---

## ✅ Quick Verification

After setup, verify all accounts work:

```bash
# Test each login
1. Login as student@cktutas.edu.gh
   → Should redirect to /student-dashboard

2. Login as candidate@cktutas.edu.gh
   → Should redirect to /student-dashboard (with candidate features)

3. Login as commission@cktutas.edu.gh
   → Should redirect to /electoral-commission-panel

4. Login as admin@cktutas.edu.gh
   → Should redirect to /admin-dashboard
```

---

**Last Updated**: January 25, 2026
**Schema Version**: 1.0.0

