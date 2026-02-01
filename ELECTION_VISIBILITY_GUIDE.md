# Election Visibility Guide

## When Do Elections Appear on Dashboards?

Elections appear on different dashboards based on their **status** and **dates**. Here's the complete breakdown:

---

## Election Statuses

Elections have 4 possible statuses:
1. **upcoming** - Election is scheduled but not yet started
2. **active** - Election is currently running (voting is open)
3. **completed** - Election has ended
4. **cancelled** - Election was cancelled

---

## Where Elections Appear

### 1. Admin Election Management Page
**Location:** `/admin-system-control/election`

**Visibility:**
- **Elections Tab**: Shows ALL elections regardless of status
- **Fees Tab**: Shows ALL elections with their positions
- Elections are sorted by creation date (newest first)

**When your election appears:**
- ✅ Immediately after creation
- ✅ Shows in both "Elections" and "Fees" tabs

**Why it might not appear:**
- ❌ Database query error (check browser console)
- ❌ RLS policy blocking read access
- ❌ Page needs refresh (try F5)

---

### 2. Admin Dashboard
**Location:** `/admin-dashboard`

**Visibility:**
- Shows **active elections only** in the live election indicator
- Shows election statistics (total elections, active elections)

**When your election appears:**
- ✅ When status = 'active'
- ✅ When current date is between `voting_start` and `voting_end`

**Why it might not appear:**
- ❌ Status is still 'upcoming' (not yet active)
- ❌ Voting period hasn't started yet
- ❌ Election has ended (status changed to 'completed')

---

### 3. Student Dashboard
**Location:** `/student-dashboard`

**Visibility:**
- Shows **active elections** where students can vote
- Shows **upcoming elections** in "Upcoming Deadlines" card
- Shows **completed elections** in "Voting History" card

**When your election appears:**
- ✅ Active elections: When status = 'active' AND voting is open
- ✅ Upcoming: When status = 'upcoming' AND nomination_start is in the future
- ✅ History: When status = 'completed'

---

### 4. Electoral Commission Panel
**Location:** `/electoral-commission-panel`

**Visibility:**
- Shows ALL elections (similar to admin)
- Can create, manage, and monitor elections

**When your election appears:**
- ✅ Immediately after creation
- ✅ All statuses visible

---

## Election Lifecycle

Here's how an election moves through its lifecycle:

```
1. CREATION
   ↓
   Status: 'upcoming'
   Appears in: Admin/EC management pages only
   
2. NOMINATION PERIOD STARTS
   ↓
   Status: Still 'upcoming'
   Candidates can apply for positions
   
3. VOTING PERIOD STARTS
   ↓
   Status: Changes to 'active' (manually or automatically)
   Appears in: ALL dashboards
   Students can vote
   
4. VOTING PERIOD ENDS
   ↓
   Status: Changes to 'completed' (manually or automatically)
   Appears in: Results pages, history
   
5. RESULTS PUBLISHED
   ↓
   Status: Still 'completed'
   Results visible to all users
```

---

## How to Make Your Election Visible

### For Testing (Make Election Active Now):

**Option 1: Update Status Manually in Supabase**
```sql
UPDATE elections 
SET status = 'active'
WHERE id = 'your-election-id';
```

**Option 2: Set Dates to Current Time**
```sql
UPDATE elections 
SET 
  nomination_start = NOW() - INTERVAL '1 day',
  nomination_end = NOW() + INTERVAL '7 days',
  voting_start = NOW(),
  voting_end = NOW() + INTERVAL '14 days',
  status = 'active'
WHERE id = 'your-election-id';
```

### For Production (Proper Scheduling):

1. **Create Election** with future dates
   - Status: 'upcoming'
   - Set nomination_start, nomination_end, voting_start, voting_end

2. **When Nomination Opens**
   - Status remains 'upcoming'
   - Candidates can apply

3. **When Voting Opens**
   - Manually change status to 'active' OR
   - Set up automatic status change based on voting_start date

4. **When Voting Closes**
   - Manually change status to 'completed' OR
   - Set up automatic status change based on voting_end date

---

## Automatic Status Updates (Recommended)

You can create a database function to automatically update election status:

```sql
-- Create function to update election status
CREATE OR REPLACE FUNCTION update_election_status()
RETURNS void AS $$
BEGIN
  -- Set to active when voting starts
  UPDATE elections
  SET status = 'active'
  WHERE status = 'upcoming'
    AND voting_start <= NOW()
    AND voting_end > NOW();
  
  -- Set to completed when voting ends
  UPDATE elections
  SET status = 'completed'
  WHERE status = 'active'
    AND voting_end <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run this every hour
-- (Requires pg_cron extension in Supabase)
SELECT cron.schedule(
  'update-election-status',
  '0 * * * *', -- Every hour
  $$SELECT update_election_status()$$
);
```

---

## Troubleshooting

### "I created an election but don't see it anywhere"

**Check 1: Verify election was created**
```sql
SELECT id, name, status, created_at 
FROM elections 
ORDER BY created_at DESC 
LIMIT 5;
```

**Check 2: Check browser console for errors**
- Open DevTools (F12)
- Look for red errors
- Common issues: RLS policy errors, network errors

**Check 3: Refresh the page**
- Press F5 or Ctrl+R
- Elections are fetched on page load

### "Election appears in Fees tab but not Elections tab"

This shouldn't happen - both tabs fetch from the same source. Try:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### "Election doesn't appear on student dashboard"

**Reason:** Status is 'upcoming', not 'active'

**Solution:** 
- Wait until voting_start date OR
- Manually set status to 'active' for testing

### "Election disappeared from dashboard"

**Reason:** Status changed to 'completed' or voting period ended

**Solution:**
- Check election status in database
- Extend voting_end date if needed
- Or view in "Completed Elections" section

---

## Quick Reference

| Dashboard | Shows Upcoming | Shows Active | Shows Completed |
|-----------|---------------|--------------|-----------------|
| Admin Election Management | ✅ | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ | ❌ |
| Student Dashboard | ✅ | ✅ | ✅ (history) |
| EC Panel | ✅ | ✅ | ✅ |
| Voting Interface | ❌ | ✅ | ❌ |
| Results Pages | ❌ | ✅ | ✅ |

---

## Summary

**Your election is working correctly!** It appears in the Admin Election Management page (both Elections and Fees tabs) because:
- ✅ It was created successfully
- ✅ Status is 'upcoming'
- ✅ Database query is working

**To make it appear on other dashboards:**
- Change status to 'active' when voting should start
- Or wait until the voting_start date and manually activate it
- Or set up automatic status updates (recommended for production)

**For immediate testing:**
```sql
UPDATE elections 
SET status = 'active', 
    voting_start = NOW(), 
    voting_end = NOW() + INTERVAL '7 days'
WHERE name = 'Your Election Name';
```

Then refresh your dashboard - the election will appear as a live election!
