# Commission Access Period - Example Scenarios

## Scenario 1: New Election Cycle

### Context
University is starting a new academic year with student elections scheduled for October 2026.

### Invitation Details
- **User**: Dr. Kwame Mensah
- **Role**: Electoral Commission
- **Position**: Electoral Commissioner
- **Access Start Date**: September 1, 2026
- **Access End Date**: December 31, 2026
- **Duration**: 122 days (4 months)

### Timeline

**September 1, 2026** - Access Begins
- Dr. Mensah receives invitation email
- Sets password and activates account
- Gains full commission access
- Can manage elections, verify candidates, view results

**October 15, 2026** - Active Period
- Full commission privileges
- Managing ongoing elections
- No warnings or restrictions

**December 24, 2026** - 7 Days Before Expiration
- System sends warning email
- Banner appears in dashboard: "⚠️ Your commission access expires in 7 days"
- Can request extension from admin

**December 31, 2026** - Access Expires
- Automatic role downgrade to 'student'
- Commission routes become inaccessible
- Receives expiration notification email
- Can still login as student

**January 1, 2027** - After Expiration
- Logs in as student
- Redirected to student dashboard
- Can vote, view results, but cannot manage elections
- Can be re-invited if needed for next cycle

---

## Scenario 2: Full Academic Year Access

### Context
Commission member needed for entire academic year to oversee multiple election cycles.

### Invitation Details
- **User**: Prof. Akosua Boateng
- **Role**: Electoral Commission
- **Position**: Deputy Commissioner
- **Access Start Date**: August 1, 2026
- **Access End Date**: July 31, 2027
- **Duration**: 365 days (12 months)

### Benefits
- Covers full academic calendar
- Manages both semester elections
- Consistent oversight throughout year
- Automatic cleanup after academic year

---

## Scenario 3: Admin with Permanent Access

### Context
System administrator needs ongoing access for platform maintenance.

### Invitation Details
- **User**: Mr. Yaw Asante
- **Role**: Administrator
- **Position**: System Administrator
- **Access Period**: N/A (Permanent)

### Key Differences
- No access start/end dates required
- No automatic expiration
- Permanent access to all features
- Cannot be auto-downgraded

---

## Scenario 4: Emergency Extension

### Context
Election delayed, commission member needs extended access.

### Original Access
- **End Date**: December 31, 2026
- **Status**: Expiring in 3 days

### Extension Process
1. Admin opens User Management
2. Finds commission member
3. Clicks "Extend Access" button
4. Sets new end date: January 31, 2027
5. User receives extension notification
6. Access continues without interruption

---

## Scenario 5: Early Revocation

### Context
Commission member leaves university mid-term.

### Original Access
- **End Date**: July 31, 2027
- **Current Date**: March 15, 2027
- **Remaining**: 138 days

### Revocation Process
1. Admin opens User Management
2. Finds commission member
3. Clicks "Revoke Access" button
4. Confirms action
5. User immediately downgraded to student
6. Receives notification email
7. Logged in audit trail

---

## User Interface Examples

### Invitation Modal - Commission Member
```
┌─────────────────────────────────────────────────┐
│ Invite New User                            [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ User Role *                                     │
│ ┌──────────────────┐  ┌──────────────────┐    │
│ │ 🛡️ Electoral     │  │ 🔑 Administrator │    │
│ │ Commission       │  │                  │    │
│ │ [SELECTED]       │  │                  │    │
│ └──────────────────┘  └──────────────────┘    │
│                                                 │
│ First Name *          Last Name *              │
│ [Kwame            ]   [Mensah            ]     │
│                                                 │
│ Institutional Email *                          │
│ [kwame.mensah@cktutas.edu.gh            ]     │
│                                                 │
│ Position/Title *                               │
│ [Electoral Commissioner                  ]     │
│                                                 │
│ Department (Optional)                          │
│ [Administration                          ]     │
│                                                 │
│ ⚠️ Time-Bound Access                           │
│ Commission access is temporary. After the      │
│ end date, the user will automatically be       │
│ downgraded to student role.                    │
│                                                 │
│ Access Start Date *   Access End Date *        │
│ [2026-09-01      ]   [2026-12-31      ]       │
│                                                 │
│ Access Duration: 122 days                      │
│                                                 │
│ ℹ️ What happens next?                          │
│ • Invitation email sent                        │
│ • User sets password via secure link           │
│ • Account activated                            │
│ • Invitation expires in 7 days if not accepted │
│ • Commission access expires on Dec 31, 2026    │
│                                                 │
├─────────────────────────────────────────────────┤
│                    [Cancel] [Send Invitation]  │
└─────────────────────────────────────────────────┘
```

### User Management Table - With Access Status
```
┌────────────────────────────────────────────────────────────────────────────┐
│ All Users                                                                  │
├────────────────────────────────────────────────────────────────────────────┤
│ Name              Email                    Role        Status    Access    │
├────────────────────────────────────────────────────────────────────────────┤
│ Dr. Kwame Mensah  kwame@cktutas.edu.gh    Commission  🟢 Active  45 days  │
│ Prof. Akosua      akosua@cktutas.edu.gh   Commission  🟡 Soon    6 days   │
│ Mr. Yaw Asante    yaw@cktutas.edu.gh      Admin       🟢 Active  ∞        │
│ Ms. Ama Osei      ama@cktutas.edu.gh      Commission  🔴 Expired -        │
│ John Mensah       john@cktutas.edu.gh     Student     🟢 Active  -        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Commission Member Dashboard - Expiring Soon
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Your commission access expires in 7 days                    │
│ Contact admin if you need an extension                         │
│                                                    [Dismiss]    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Electoral Commission Panel                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Commission Access                                               │
│ ⏰ 7 days remaining                                             │
│ Expires: December 31, 2026                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Email Notification - Access Expiring Soon
```
Subject: Your Commission Access Expires Soon

Dear Dr. Kwame Mensah,

Your Electoral Commission access will expire in 7 days on December 31, 2026.

After this date, your account will automatically revert to student access.

Current Access Period:
• Start Date: September 1, 2026
• End Date: December 31, 2026
• Days Remaining: 7

If you need extended access, please contact the system administrator.

Thank you for your service on the Electoral Commission.

---
UTASVotes Electoral System
University of Technical and Applied Sciences
```

### Email Notification - Access Expired
```
Subject: Commission Access Expired

Dear Dr. Kwame Mensah,

Your Electoral Commission access has expired as of December 31, 2026.

Your account has been automatically changed to student access.

You can still:
✓ Vote in elections
✓ View election results
✓ Access campaign information
✓ View your voting history

You can no longer:
✗ Manage elections
✗ Verify candidates
✗ Access commission panel
✗ Generate certified reports

Thank you for your service on the Electoral Commission during the 2026 election cycle.

If you believe this is an error, please contact the system administrator.

---
UTASVotes Electoral System
University of Technical and Applied Sciences
```

---

## Best Practices

### For Administrators

1. **Set Realistic Periods**
   - Match access to election cycle duration
   - Add buffer time for post-election tasks
   - Consider academic calendar

2. **Monitor Expiring Access**
   - Review users expiring in next 30 days
   - Proactively extend if needed
   - Plan for replacements

3. **Document Extensions**
   - Note reason for extension
   - Set clear new end date
   - Inform relevant parties

4. **Regular Audits**
   - Monthly review of commission members
   - Verify access periods are appropriate
   - Remove unnecessary access

### For Commission Members

1. **Track Your Access**
   - Note your end date
   - Request extension early if needed
   - Complete tasks before expiration

2. **Prepare for Transition**
   - Document ongoing work
   - Transfer responsibilities
   - Export needed reports

3. **After Expiration**
   - Understand student access limitations
   - Contact admin if re-invitation needed
   - Maintain institutional email access

---

## Technical Implementation Notes

### Automatic Downgrade Logic
```typescript
// Checked on every login/session validation
const effectiveRole = getEffectiveRole({
  role: 'commission',
  accessEndDate: '2026-12-31',
  originalRole: 'student'
});

// If current date > 2026-12-31
// effectiveRole = 'student'
// User redirected to student dashboard
```

### Background Job (Daily at Midnight)
```typescript
// Processes all expired commission members
await processExpiredAccess();

// Finds users where:
// - role = 'commission'
// - access_end_date < NOW()
// - access_downgraded = false

// For each user:
// 1. Update role to 'student'
// 2. Set access_downgraded = true
// 3. Send notification email
// 4. Log in audit trail
```

---

**See Also:**
- `TIME_BOUND_ACCESS_FEATURE.md` - Complete technical documentation
- `USER_INVITATION_FEATURE.md` - Invitation system details
- `src/lib/role-management.ts` - Implementation code
