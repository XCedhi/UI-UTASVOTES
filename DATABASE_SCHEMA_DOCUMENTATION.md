# UTASVotes Database Schema Documentation

## Overview

This document provides comprehensive documentation for the UTASVotes database schema. The schema is designed to support all features of the electoral system including user management, elections, voting, campaign feeds, notifications, and administrative functions.

## Schema Statistics

- **Total Tables**: 40+
- **Storage Buckets**: 5
- **Views**: 3
- **Triggers**: 8
- **Functions**: 6
- **Indexes**: 20+

## Table Categories

### 1. Users & Authentication (6 tables)

#### `user_profiles`
Extends Supabase auth.users with application-specific profile data.

**Key Fields**:
- `id` - References auth.users(id)
- `email`, `full_name`, `student_id`
- `role` - student, candidate, commission, admin
- `status` - active, inactive, pending, suspended
- `access_start_date`, `access_end_date` - For time-bound commission access
- `department`, `level`, `cgpa` - Student information
- `avatar_url`, `bio`, `manifesto` - Profile content

**Features**:
- Time-bound access for commission members
- Automatic role downgrade after access expiry
- Last login tracking

#### `account_requests`
Stores new user registration requests pending approval.

#### `user_invitations`
Manages invitations for commission/admin roles with expiry.

#### `user_sessions`
Tracks user login/logout sessions for security auditing.

#### `user_preferences`
Stores user-specific settings (theme, notifications, language).

#### `failed_login_attempts`
Tracks failed login attempts for security.

---

### 2. Elections (4 tables)

#### `elections`
Core election records with dates, status, and statistics.

**Key Fields**:
- `title`, `description`, `type` (departmental/university-wide)
- `status` - draft, scheduled, active, completed, cancelled
- `start_date`, `end_date`, `registration_start`, `registration_end`
- `total_voters`, `voted_count`, `turnout_percentage`
- `allow_abstain`, `show_live_results` - Configuration flags

**Auto-calculated**:
- `turnout_percentage` - Updated via trigger on vote insert

#### `election_positions`
Defines positions available in each election.

#### `fee_structures`
Application fees for different positions (in Ghana Cedis).

#### `deadlines`
Important dates and reminders for elections.

---

### 3. Candidates & Applications (1 table)

#### `candidates`
Complete candidate application and results data.

**Application Data**:
- Personal info: `full_name`, `student_id`, `email`, `department`, `level`, `cgpa`
- Position: `position`, `position_id`, `manifesto`, `key_points`
- Documents: `photo_url`, `manifesto_doc_url`, `student_id_doc_url`, `transcript_url`
- Eligibility: `eligibility_checklist` (JSONB), `eligibility_status`
- Payment: `payment_status`, `application_fee`, `transaction_id`

**Results Data**:
- `votes`, `vote_percentage`, `rank`, `is_winner`
- Auto-updated via triggers

**Status Flow**: pending → approved/rejected → (if approved) → voting → results

---

### 4. Voting (3 tables)

#### `votes`
Individual vote records with privacy protection.

**Key Fields**:
- `election_id`, `position_id`, `candidate_id`, `voter_id`
- `vote_hash` - For verification without revealing voter identity
- `is_abstain` - Support for abstention
- `ip_address`, `user_agent` - For fraud detection

**Privacy**: Strict RLS policies prevent vote disclosure

#### `voting_receipts`
Confirmation receipts issued to voters.

#### `voter_eligibility`
Controls who can vote in specific elections.

---

### 5. Campaign Feed & Social (10 tables)

#### `feed_items`
Posts, manifestos, videos, announcements from students and candidates.

**Content Types**: manifesto, video, announcement, qa, discussion

**Engagement Metrics**:
- `likes_count`, `comments_count`, `shares_count`
- Auto-updated via triggers

#### `post_likes`, `post_shares`
Track user engagement with posts.

#### `comments`
Comments on feed items.

#### `comment_likes`
Likes on comments.

#### `comment_replies`
Nested replies to comments.

#### `reply_likes`
Likes on replies.

#### `hashtags`, `post_hashtags`
Hashtag system for content discovery.

---

### 6. Notifications & Alerts (2 tables)

#### `notifications`
User-specific notifications.

**Types**: election, deadline, result, approval, system, comment, like, mention

**Features**:
- `is_read`, `read_at` tracking
- `action_url` for clickable notifications

#### `system_alerts`
System-wide alerts for admin/commission.

**Severity Levels**: critical, high, medium, low

---

### 7. Reports & Analytics (2 tables)

#### `reports`
Generated election reports and exports.

**Report Types**: election, candidate, voter, financial, comprehensive

**Formats**: PDF, CSV, Excel

#### `activity_logs`
Complete audit trail of all system actions.

**Action Types**: approval, rejection, update, creation, deletion, login, logout

---

### 8. Student Import (2 tables)

#### `student_imports`
Bulk student data import jobs.

**Status**: processing, completed, failed, partial

#### `student_import_records`
Individual records from import with success/failure status.

---

### 9. Settings & Configuration (2 tables)

#### `system_settings`
Global system configuration key-value pairs.

**Categories**: general, security, notifications, elections

#### `user_preferences`
Per-user settings and preferences.

---

### 10. Payments (1 table)

#### `payment_transactions`
All payment records for candidate applications.

**Payment Methods**: stripe, momo, card, bank_transfer

**Status**: pending, completed, failed, refunded

---

### 11. Security (2 tables)

#### `security_events`
Security incidents and suspicious activities.

**Event Types**: failed_login, suspicious_activity, multiple_votes, unauthorized_access

#### `failed_login_attempts`
Tracks failed logins for account lockout.

---

## Storage Buckets

### 1. `avatars` (Public)
User profile pictures and candidate photos.

### 2. `documents` (Private)
Application documents (ID cards, transcripts, manifestos).

### 3. `campaign-media` (Public)
Campaign images, videos, GIFs for feed posts.

### 4. `reports` (Private)
Generated election reports (admin/commission only).

### 5. `imports` (Private)
Student import CSV/Excel files.

---

## Key Features

### Automatic Updates via Triggers

1. **Election Statistics**: `voted_count` and `turnout_percentage` auto-update on vote insert
2. **Candidate Votes**: `votes` and `vote_percentage` auto-update on vote insert
3. **Post Engagement**: `likes_count`, `comments_count`, `shares_count` auto-update
4. **Timestamps**: `updated_at` auto-updates on all relevant tables

### Time-Bound Access

Commission members have `access_start_date` and `access_end_date`. A scheduled function automatically downgrades them to student role after expiry.

### Security Features

- Row Level Security (RLS) on all tables
- Vote privacy protection (voters can only see own votes)
- Failed login tracking and account lockout
- Security event logging
- IP address and user agent tracking

### Data Integrity

- Foreign key constraints ensure referential integrity
- Check constraints validate enum values
- Unique constraints prevent duplicates
- Cascading deletes maintain consistency

---

## Views

### `election_results`
Pre-joined view of elections with candidate results.

### `active_elections_stats`
Active elections with candidate and position counts.

### `user_activity_summary`
User engagement metrics (votes, posts, comments).

---

## Indexes

Performance indexes on:
- User lookups (email, student_id, role)
- Election queries (status, dates)
- Vote queries (election_id, candidate_id, voter_id)
- Feed queries (author_id, created_at)
- Notification queries (user_id, is_read)

---

## Migration from Current Schema

The current `schema.sql` has basic tables. To migrate:

1. **Backup existing data**
2. **Run comprehensive schema** (creates new tables, doesn't drop existing)
3. **Migrate data** from old tables to new structure
4. **Update application code** to use new table names/fields
5. **Test thoroughly** before production deployment

---

## Next Steps

1. ✅ Schema created
2. ⏳ Configure Supabase authentication
3. ⏳ Set up email templates
4. ⏳ Configure storage CORS
5. ⏳ Set up pg_cron for scheduled jobs
6. ⏳ Integrate Stripe payment gateway
7. ⏳ Update application code to use new schema

---

## Support

For questions or issues with the schema, contact the development team or refer to the Supabase documentation.

