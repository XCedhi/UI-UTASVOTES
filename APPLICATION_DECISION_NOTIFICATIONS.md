# Per-Student Application Decision Notifications

## Goal

When the Electoral Commission (or admin) **approves** or **rejects** a student's
candidate application, **only that specific student** receives an in-app
notification in their own account. Tapping the notification opens the **full
message** so the student can read it.

This feature keeps every student account fully individualised — decisions are
never broadcast to the whole student body.

## How It Works

```
Commission/Admin clicks Approve or Reject (with reason)
        ↓
candidates.status updated ('approved' / 'rejected')
        ↓
notifyCandidateOfDecision(candidateId, decision, { reason })
        ↓
1. Reads candidates.user_id  → the exact applicant (their user_profiles.id)
2. Inserts ONE row into notifications
     user_id       = that applicant only
     type          = 'application_approved' | 'application_rejected'
     title/message = full decision message (rejection reason included)
     action_url    = null  → Header opens /notifications/:id
        ↓
Student's Header bell (polled every 10s) shows the new notification
        ↓
Student taps it → full-message page /notifications/:id (auto marked read)
```

## What Changed

| File | Change |
|------|--------|
| `supabase/migrations/20260811_notifications_decision_types.sql` | **APPLIED** (2026-08-11, SQL Editor). Adds `application_approved` / `application_rejected` (and `application`) to the `notifications_type_check` constraint. Idempotent — safe to re-run. |
| `src/lib/application-decision-notifications.ts` | NEW shared helper `notifyCandidateOfDecision()` that sends the per-student notification. |
| `src/app/admin-election-management/applications/[id]/components/ApplicationDetailsInteractive.tsx` | Approve/Reject now call the helper. |
| `src/app/admin-system-control/election/applications/[id]/components/ApplicationDetailsInteractive.tsx` | Approve/Reject now call the helper. |
| `src/app/electoral-commission-panel/applications/[id]/components/ApplicationDetailsInteractive.tsx` | Approve/Reject now call the helper. |
| `src/components/common/Header.tsx` | Bell click without `action_url` now opens `/notifications/:id`; icons/colors for the two new types. |
| `src/components/common/NotificationCenter.tsx` | Same type support + fallback navigation. |
| `src/app/notifications/page.tsx` | NEW "View all notifications" page (list). |
| `src/app/notifications/components/NotificationsInteractive.tsx` | List page logic (filter, mark-all-read, open detail). |
| `src/app/notifications/[id]/page.tsx` | NEW notification detail page (full message). |
| `src/app/notifications/[id]/components/NotificationDetailInteractive.tsx` | Detail logic — fetches own notification only (RLS + `user_id` check), auto-marks read. |

## Database Setup (APPLIED 2026-08-11 — kept for reference)

The migration has been run in **Supabase Dashboard → SQL Editor**; the live
`notifications_type_check` constraint now accepts `application_approved` and
`application_rejected` (verified: `INSERT` succeeds with both new types).

To re-apply (e.g. on a fresh database), run this in **Supabase Dashboard → SQL Editor**:

1. Open `supabase/migrations/20260811_notifications_decision_types.sql`
2. Paste and click **RUN**

Expected output: a row showing the constraint `notifications_type_check` with the
new definition.

## How the student sees it

1. Student logs into their individual account.
2. Header bell (🔔) shows an unread badge.
3. Opening the bell lists their notification(s) — only their own (RLS-enforced).
4. Tapping it navigates to `/notifications/:id` which renders the **entire**
   message (approval congratulations OR rejection + reason).
5. The notification is automatically marked as read.

## Testing Checklist

- [x] Migration applied (2026-08-11) — constraint verified in the live DB.
- [x] DB-level verification: `application_approved` insert **ALLOWED** (helper path
      replicated via script, test row cleaned up). Full student pipeline verified
      live: insert → appears in that student's list (unread) → detail fetch +
      privacy match → auto mark-read → other students cannot see it.
- [ ] Login as commission (`commission@cktutas.edu.gh` / `Commission@2026`).
- [ ] Open an application → **Approve**.
- [ ] In Supabase: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;`
      → one row with `user_id` = the applicant and `type = 'application_approved'`.
- [ ] Login as that student → bell shows unread → tap → full message shows.
- [ ] Repeat with **Reject** (enter a reason) → `type = 'application_rejected'`,
      message contains the reason.
- [ ] Confirm a **different** student cannot see or open that notification.

## Troubleshooting

### `new row for relation "notifications" violates check constraint "notifications_type_check"`
The migration has not been run yet. Run
`supabase/migrations/20260811_notifications_decision_types.sql`.

### Student doesn't see the notification
- Confirm the candidate's `user_id` matches the student's `user_profiles.id`.
- The Header polls every 10 seconds — wait a moment or refresh the page.
- Check browser console for errors.
