# Notifications Integration Points

## Overview

This document outlines where in the codebase notifications should be created when specific events occur.

## Events & Integration Points

### 1. Election Created

**Event:** Admin or Commission creates new election

**Location:** `src/app/api/elections/create/route.ts`

**Action:**
```typescript
// After successful election creation
const createdElection = await supabase
  .from('elections')
  .insert(electionData)
  .select()
  .single();

// Create notification for all students
await supabase
  .from('notifications')
  .insert(
    (await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'student')).data?.map(student => ({
        user_id: student.id,
        type: 'election',
        title: `New Election: ${createdElection.title}`,
        message: `A new election has been announced. Voting opens ${createdElection.start_date}`,
        action_url: '/student-dashboard',
        created_at: new Date()
      }))
  );
```

### 2. Candidate Application Submitted

**Event:** Student submits candidate application

**Location:** `src/app/api/candidate-application/submit/route.ts`

**Action:**
```typescript
// After successful application submission
const { data: submittedApp } = await supabase
  .from('candidates')
  .insert(applicationData)
  .select()
  .single();

// Notify the applicant
await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    type: 'application',
    title: 'Application Submitted',
    message: `Your candidate application for ${position} has been received and is under review.`,
    action_url: '/profile',
    created_at: new Date()
  });

// Notify commission
const commission = await supabase
  .from('user_profiles')
  .select('id')
  .eq('role', 'commission');

await supabase
  .from('notifications')
  .insert(
    commission.data?.map(user => ({
      user_id: user.id,
      type: 'application',
      title: 'New Application',
      message: `${applicantName} applied for ${position}. Review application.`,
      action_url: `/electoral-commission-panel/applications/${submittedApp.id}`,
      created_at: new Date()
    }))
  );
```

### 3. Application Approved

**Event:** Commission or Admin approves candidate application

**Location:** `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx` (approval button handler)

**Action:**
```typescript
// After updating candidate status to 'approved'
await supabase
  .from('notifications')
  .insert({
    user_id: candidateUserId,
    type: 'approval',
    title: 'Application Approved!',
    message: `Congratulations! Your application for ${position} has been approved. Payment is required to proceed.`,
    action_url: '/candidate-registration',
    created_at: new Date()
  });
```

### 4. Application Rejected

**Event:** Commission or Admin rejects candidate application

**Location:** `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx` (rejection button handler)

**Action:**
```typescript
// After updating candidate status to 'rejected'
await supabase
  .from('notifications')
  .insert({
    user_id: candidateUserId,
    type: 'application',
    title: 'Application Not Approved',
    message: `Your application for ${position} was not approved at this time. You may reapply for another position.`,
    action_url: '/candidate-registration',
    created_at: new Date()
  });
```

### 5. Election Results Published

**Event:** Commission publishes election results

**Location:** `src/app/electoral-commission-panel/election-results/components/CommissionElectionResultsInteractive.tsx` (publish button)

**Action:**
```typescript
// After publishing results, notify all students
const { data: students } = await supabase
  .from('user_profiles')
  .select('id')
  .eq('role', 'student');

await supabase
  .from('notifications')
  .insert(
    students?.map(student => ({
      user_id: student.id,
      type: 'result',
      title: `${electionName} - Results Available`,
      message: 'Election results are now available. View the winners and voting statistics.',
      action_url: '/student-election-results',
      created_at: new Date()
    }))
  );
```

### 6. Voting Window Opens

**Event:** Election status changes from 'pending' to 'active'

**Location:** Could be manual trigger or automatic via cron job

**SQL Approach (Recommended):**
```sql
-- Create trigger for when election.status = 'active'
CREATE OR REPLACE FUNCTION notify_voting_open()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
    SELECT 
      id,
      'election',
      CONCAT('Voting Now Open: ', NEW.title),
      CONCAT('You can now vote in ', NEW.title, '. Click to vote.'),
      '/voting-interface',
      NOW()
    FROM user_profiles
    WHERE role IN ('student', 'candidate');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER election_status_changed
AFTER UPDATE ON elections
FOR EACH ROW
EXECUTE FUNCTION notify_voting_open();
```

### 7. Voting Deadline Approaching

**Event:** 24 hours before election ends

**Location:** Should be handled by a cron job (e.g., `src/app/api/cron/check-election-deadlines/route.ts`)

**Action:**
```typescript
// This should run periodically (e.g., every hour via cron)
const upcomingDeadlines = await supabase
  .from('elections')
  .select('*')
  .eq('status', 'active')
  .lt('end_date', tomorrow)  // Ends within 24 hours
  .gt('end_date', today);    // But not yet ended

for (const election of upcomingDeadlines) {
  // Get all students who haven't voted yet
  const { data: notVoted } = await supabase
    .rpc('get_students_who_have_not_voted', { 
      election_id: election.id 
    });

  // Create notifications
  await supabase
    .from('notifications')
    .insert(
      notVoted?.map(student => ({
        user_id: student.id,
        type: 'deadline',
        title: 'Voting Ends Soon!',
        message: `Voting for ${election.title} ends in 24 hours. Don't miss out!`,
        action_url: '/voting-interface',
        created_at: new Date()
      }))
    );
}
```

### 8. Payment Received

**Event:** Candidate payment processed successfully

**Location:** `src/app/api/payment/momo/initiate/route.ts` or payment webhook handler

**Action:**
```typescript
// After successful payment
await supabase
  .from('notifications')
  .insert({
    user_id: candidateUserId,
    type: 'approval',
    title: 'Payment Confirmed',
    message: 'Your application fee payment has been received. Your candidacy is now confirmed.',
    action_url: '/profile',
    created_at: new Date()
  });

// Notify commission
const commission = await supabase
  .from('user_profiles')
  .select('id')
  .eq('role', 'commission');

await supabase
  .from('notifications')
  .insert(
    commission.data?.map(user => ({
      user_id: user.id,
      type: 'system',
      title: 'Payment Received',
      message: `Payment received from ${candidateName} for ${position}. Candidate is now confirmed.`,
      action_url: `/electoral-commission-panel/applications/${appId}`,
      created_at: new Date()
    }))
  );
```

### 9. Campaign Post Liked

**Event:** User likes campaign feed post

**Location:** `src/app/campaign-feed/components/CampaignFeedInteractive.tsx` (like button)

**Action:**
```typescript
// After recording like
await supabase
  .from('notifications')
  .insert({
    user_id: postAuthorId,
    type: 'like',
    title: `${likerName} liked your post`,
    message: postTitle,
    action_url: '/campaign-feed',
    created_at: new Date()
  });
```

### 10. Campaign Post Commented

**Event:** User comments on campaign feed post

**Location:** `src/app/campaign-feed/components/CampaignFeedInteractive.tsx` (comment submission)

**Action:**
```typescript
// After recording comment
await supabase
  .from('notifications')
  .insert({
    user_id: postAuthorId,
    type: 'comment',
    title: `${commenterName} commented on your post`,
    message: commentText,
    action_url: '/campaign-feed',
    created_at: new Date()
  });
```

## Helper Function

Create a reusable notification helper in `src/lib/notifications.ts`:

```typescript
import { supabase } from './supabase';

export interface NotificationPayload {
  user_id: string;
  type: 'election' | 'deadline' | 'result' | 'approval' | 'application' | 'system' | 'comment' | 'like' | 'mention';
  title: string;
  message: string;
  action_url?: string;
}

/**
 * Create a single notification
 */
export async function createNotification(payload: NotificationPayload) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      ...payload,
      created_at: new Date()
    });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotification(
  userIds: string[],
  payload: Omit<NotificationPayload, 'user_id'>
) {
  const notifications = userIds.map(userId => ({
    ...payload,
    user_id: userId,
    created_at: new Date()
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Failed to create bulk notifications:', error);
    throw error;
  }
}

/**
 * Create notification for all users with specific role
 */
export async function notifyRole(
  role: 'student' | 'candidate' | 'commission' | 'admin',
  payload: Omit<NotificationPayload, 'user_id'>
) {
  const { data: users, error: fetchError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', role);

  if (fetchError || !users) {
    console.error('Failed to fetch users:', fetchError);
    throw fetchError;
  }

  return createBulkNotification(
    users.map(u => u.id),
    payload
  );
}

/**
 * Example usage in your API route:
 *
 * import { createNotification, notifyRole } from '@/lib/notifications';
 *
 * // Notify one user
 * await createNotification({
 *   user_id: userId,
 *   type: 'approval',
 *   title: 'Application Approved',
 *   message: 'Your application has been approved!',
 *   action_url: '/profile'
 * });
 *
 * // Notify all students
 * await notifyRole('student', {
 *   type: 'election',
 *   title: 'New Election',
 *   message: 'A new election is now available.',
 *   action_url: '/student-dashboard'
 * });
 */
```

Then use it:
```typescript
import { createNotification, notifyRole } from '@/lib/notifications';

// In API route or component:
await createNotification({
  user_id: userId,
  type: 'approval',
  title: 'Application Approved',
  message: 'Your application has been approved!',
  action_url: '/profile'
});

// Or for all students:
await notifyRole('student', {
  type: 'election',
  title: 'New Election',
  message: 'A new election is now available.'
});
```

## Database Triggers (Advanced)

For automatic notifications on database changes, create triggers:

```sql
-- Auto-notify on election status change
CREATE OR REPLACE FUNCTION notify_election_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    -- Notify students
    INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
    SELECT id, 'election', 'Voting Open', 
           CONCAT('Voting for ', NEW.title, ' is now open'),
           '/voting-interface', NOW()
    FROM user_profiles WHERE role = 'student';
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Notify about results
    INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
    SELECT id, 'result', 'Results Available',
           CONCAT('Results for ', NEW.title, ' are now available'),
           '/student-election-results', NOW()
    FROM user_profiles WHERE role IN ('student', 'candidate', 'commission');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER election_status_change_trigger
AFTER UPDATE ON elections
FOR EACH ROW
EXECUTE FUNCTION notify_election_status_change();
```

## Testing Integration Points

When implementing each integration point:

1. **Insert test data** - Create test entity (election, application, etc.)
2. **Trigger action** - Perform action that should create notification
3. **Verify notification** - Check notifications table:
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```
4. **Check Header** - Refresh page, verify notification appears
5. **Click notification** - Verify mark-as-read and navigation work

## Summary

| Event | Type | Location | Status |
|-------|------|----------|--------|
| Election Created | `election` | api/elections/create | To implement |
| Application Submitted | `application` | api/candidate-application/submit | To implement |
| Application Approved | `approval` | commission panel | To implement |
| Application Rejected | `application` | commission panel | To implement |
| Results Published | `result` | commission results panel | To implement |
| Voting Opens | `election` | elections table trigger | To implement |
| Deadline Approaching | `deadline` | cron job | To implement |
| Payment Received | `approval` | payment handler | To implement |
| Post Liked | `like` | campaign feed | To implement |
| Post Commented | `comment` | campaign feed | To implement |

---

Use this guide to add notifications throughout the application as features are built out.
