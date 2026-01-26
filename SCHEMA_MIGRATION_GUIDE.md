# Schema Migration Guide

## Overview

This guide helps you migrate from the current basic schema to the comprehensive schema that supports all UTASVotes features.

## Current Schema vs New Schema

### Current Tables (6)
- `account_requests`
- `feed_items`
- `comments`
- `elections`
- `candidates`
- `notifications`

### New Schema (40+ tables)
Complete coverage of all application features with proper relationships, indexes, triggers, and RLS policies.

---

## Migration Strategy

### Option 1: Fresh Installation (Recommended for Development)

If you're in development and can afford to lose existing data:

```bash
# 1. Backup current database (just in case)
pg_dump your_database > backup.sql

# 2. Drop existing schema (CAUTION: This deletes all data!)
# In Supabase SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

# 3. Run comprehensive schema
# Copy contents of supabase/schema_comprehensive.sql
# Paste into Supabase SQL Editor and execute
```

### Option 2: Incremental Migration (Recommended for Production)

Keep existing data and add new tables:

#### Step 1: Create New Tables

```sql
-- Run the comprehensive schema
-- It uses "CREATE TABLE IF NOT EXISTS" so won't conflict with existing tables
-- Execute: supabase/schema_comprehensive.sql
```

#### Step 2: Migrate Existing Data

```sql
-- Migrate account_requests (already compatible)
-- No changes needed

-- Migrate feed_items to new structure
INSERT INTO public.feed_items (
  id, author_id, author_name, author_avatar, author_role,
  type, title, content, created_at
)
SELECT 
  id,
  NULL as author_id, -- You'll need to map this
  candidate_name as author_name,
  candidate_avatar as author_avatar,
  'candidate' as author_role,
  type,
  title,
  content,
  created_at
FROM public.feed_items_old
ON CONFLICT (id) DO NOTHING;

-- Migrate comments (already compatible)
-- No changes needed

-- Migrate elections
-- Add new fields with defaults
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'university-wide';
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS registration_start TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS registration_end TIMESTAMPTZ;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS total_voters INTEGER DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS voted_count INTEGER DEFAULT 0;
ALTER TABLE public.elections ADD COLUMN IF NOT EXISTS turnout_percentage DECIMAL(5,2) DEFAULT 0;

-- Migrate candidates
-- Add new fields
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS position_id UUID;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS eligibility_checklist JSONB;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS eligibility_status TEXT DEFAULT 'pending';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10,2);
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS vote_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

-- Migrate notifications (already compatible)
-- No changes needed
```

#### Step 3: Create User Profiles from Auth Users

```sql
-- Create user profiles for existing auth users
INSERT INTO public.user_profiles (
  id, email, full_name, role, status, created_at
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'student' as role,
  'active' as status,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

#### Step 4: Apply Triggers and Functions

```sql
-- The comprehensive schema includes all triggers
-- They will be created automatically
-- Verify with:
SELECT * FROM pg_trigger WHERE tgname LIKE '%update%';
```

#### Step 5: Apply RLS Policies

```sql
-- The comprehensive schema includes all RLS policies
-- They will be created automatically
-- Verify with:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## Post-Migration Tasks

### 1. Verify Data Integrity

```sql
-- Check user profiles
SELECT COUNT(*) FROM public.user_profiles;

-- Check elections
SELECT id, title, status, total_voters, voted_count 
FROM public.elections;

-- Check candidates
SELECT id, full_name, position, status, votes 
FROM public.candidates;

-- Check votes (should be empty initially)
SELECT COUNT(*) FROM public.votes;
```

### 2. Seed Initial Data

```sql
-- Fee structures (already seeded in schema)
SELECT * FROM public.fee_structures;

-- System settings (already seeded in schema)
SELECT * FROM public.system_settings;
```

### 3. Configure Storage Buckets

In Supabase Dashboard → Storage:

1. Create buckets (if not exist):
   - `avatars` (public)
   - `documents` (private)
   - `campaign-media` (public)
   - `reports` (private)
   - `imports` (private)

2. Apply storage policies (already in schema)

### 4. Test RLS Policies

```sql
-- Test as student
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO '<student_user_id>';

-- Should see all elections
SELECT * FROM public.elections;

-- Should only see own votes
SELECT * FROM public.votes;

-- Should not see other users' documents
SELECT * FROM storage.objects WHERE bucket_id = 'documents';
```

### 5. Update Application Code

Update your application to use new table structures:

#### Before (Old Schema):
```typescript
const { data } = await supabase
  .from('feed_items')
  .select('candidate_name, content');
```

#### After (New Schema):
```typescript
const { data } = await supabase
  .from('feed_items')
  .select('author_name, author_avatar, content, likes_count, comments_count');
```

---

## Application Code Updates

### 1. Authentication Context

Update `src/contexts/AuthContext.tsx` to use `user_profiles`:

```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### 2. Election Context

Update `src/contexts/ElectionContext.tsx` to use new fields:

```typescript
interface Election {
  id: string;
  title: string;
  type: 'departmental' | 'university-wide';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  total_voters: number;
  voted_count: number;
  turnout_percentage: number;
  // ... other fields
}
```

### 3. Voting Interface

Update voting to use new `votes` table:

```typescript
const { data, error } = await supabase
  .from('votes')
  .insert({
    election_id: electionId,
    position_id: positionId,
    candidate_id: candidateId,
    voter_id: userId,
    vote_hash: generateVoteHash(),
  });
```

### 4. Campaign Feed

Update feed to use engagement metrics:

```typescript
const { data } = await supabase
  .from('feed_items')
  .select(`
    *,
    post_likes(count),
    comments(count)
  `)
  .order('created_at', { ascending: false });
```

---

## Rollback Plan

If migration fails, you can rollback:

```sql
-- 1. Restore from backup
psql your_database < backup.sql

-- 2. Or drop new tables
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- ... drop other new tables
```

---

## Testing Checklist

After migration, test these features:

- [ ] User login and profile loading
- [ ] Election listing and details
- [ ] Candidate registration flow
- [ ] Voting process
- [ ] Campaign feed (create, like, comment)
- [ ] Notifications
- [ ] Admin election management
- [ ] Commission candidate approval
- [ ] Report generation
- [ ] Student import
- [ ] User invitation
- [ ] Payment processing

---

## Performance Optimization

After migration:

1. **Analyze tables**:
```sql
ANALYZE public.user_profiles;
ANALYZE public.elections;
ANALYZE public.candidates;
ANALYZE public.votes;
ANALYZE public.feed_items;
```

2. **Check index usage**:
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

3. **Monitor query performance**:
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

---

## Support

If you encounter issues during migration:

1. Check Supabase logs in Dashboard → Logs
2. Review error messages carefully
3. Verify RLS policies aren't blocking operations
4. Test with RLS disabled temporarily (for debugging only)
5. Contact development team with specific error details

---

## Timeline

Recommended migration timeline:

- **Day 1**: Backup and test migration in development
- **Day 2**: Update application code
- **Day 3**: Test all features thoroughly
- **Day 4**: Migrate staging environment
- **Day 5**: Final testing and validation
- **Day 6**: Production migration (during low-traffic period)
- **Day 7**: Monitor and fix any issues

---

## Success Criteria

Migration is successful when:

✅ All existing data is preserved
✅ All new tables are created
✅ All triggers are functioning
✅ All RLS policies are active
✅ Application loads without errors
✅ Users can login and access their data
✅ Elections and voting work correctly
✅ Campaign feed is functional
✅ Admin/Commission features work
✅ No performance degradation

