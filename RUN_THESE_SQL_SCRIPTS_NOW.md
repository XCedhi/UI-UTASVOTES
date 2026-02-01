# 🚨 URGENT: Run These SQL Scripts in Supabase Dashboard

You're getting errors because the database tables are missing required columns. Follow these steps **RIGHT NOW** to fix the issue:

---

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

---

## Step 2: Run Script 1 - Fix Elections Table

Copy and paste this entire script into the SQL Editor and click **RUN**:

```sql
-- Add missing columns to elections table
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS election_type TEXT DEFAULT 'university-wide',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS nomination_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nomination_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voting_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voting_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add comments
COMMENT ON COLUMN elections.election_type IS 'Type of election: university-wide or departmental';
COMMENT ON COLUMN elections.department IS 'Department name for departmental elections (null for university-wide)';
COMMENT ON COLUMN elections.nomination_start IS 'When candidate nominations open';
COMMENT ON COLUMN elections.nomination_end IS 'When candidate nominations close';
COMMENT ON COLUMN elections.voting_start IS 'When voting period begins';
COMMENT ON COLUMN elections.voting_end IS 'When voting period ends';
COMMENT ON COLUMN elections.created_by IS 'Admin user who created the election';

-- Add check constraint for election_type
ALTER TABLE elections 
DROP CONSTRAINT IF EXISTS elections_election_type_check;

ALTER TABLE elections 
ADD CONSTRAINT elections_election_type_check 
CHECK (election_type IN ('university-wide', 'departmental'));
```

✅ **Expected Result**: "Success. No rows returned"

---

## Step 3: Run Script 2 - Create Positions Table

Click **New Query** again, paste this script, and click **RUN**:

```sql
-- Create positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_candidates INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read positions
CREATE POLICY "Anyone can view positions" ON positions
  FOR SELECT USING (true);

-- Only admins and commission can create/update positions
CREATE POLICY "Admins and commission can manage positions" ON positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'commission')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_positions_election_id ON positions(election_id);
```

✅ **Expected Result**: "Success. No rows returned"

---

## Step 4: Run Script 3 - Add Fee Column to Positions

Click **New Query** again, paste this script, and click **RUN**:

```sql
-- Add application_fee column to positions table
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS application_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Add comment
COMMENT ON COLUMN positions.application_fee IS 'Application fee in Ghana Cedis (GHS) for this position';
```

✅ **Expected Result**: "Success. No rows returned"

---

## Step 5: Verify Everything Worked

Run this verification query to check all columns exist:

```sql
-- Check elections table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'elections' 
ORDER BY ordinal_position;

-- Check positions table exists and has all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'positions' 
ORDER BY ordinal_position;
```

You should see:
- **elections table** with columns: id, name, description, status, election_type, department, nomination_start, nomination_end, voting_start, voting_end, created_by, created_at, updated_at
- **positions table** with columns: id, election_id, title, description, max_candidates, application_fee, created_at, updated_at

---

## Step 6: Test Election Creation

1. Go back to your app: http://localhost:4028
2. Navigate to **Admin System Control** → **Election Management**
3. Click **Create Election**
4. Fill in the form:
   - Name: "Test Election 2026"
   - Description: "Testing election creation"
   - Type: University-Wide
   - Set nomination and voting dates
   - Add at least one position (e.g., "President")
5. Click **Create Election**

✅ **Expected Result**: "Election created successfully!" alert and redirect to election management page

---

## Step 7: Set Fees for Positions

1. Go to the **Fees** tab in Election Management
2. You should see your newly created election with its positions
3. Click the edit icon (pencil) next to a position
4. Enter a fee amount (e.g., 50.00 for GHS 50)
5. Click the checkmark to save

✅ **Expected Result**: Fee saved successfully and displayed

---

## Troubleshooting

### If you get "relation does not exist" errors:
- Make sure you're running the scripts in the correct order (1, 2, 3)
- Check that you're in the correct Supabase project

### If you get "column already exists" errors:
- This is fine! It means the column was already added
- Continue to the next script

### If you get "permission denied" errors:
- Make sure you're logged in as the project owner
- Try running the scripts in the Supabase SQL Editor, not in a database client

---

## What These Scripts Do

1. **fix-elections-table.sql**: Adds columns for election type, department, nomination dates, voting dates, and creator tracking
2. **create-positions-table.sql**: Creates a new table to store positions for each election with proper security policies
3. **add-fee-to-positions.sql**: Adds the application_fee column so you can set fees per position

After running these scripts, your election creation and fee management features will work perfectly! 🎉
