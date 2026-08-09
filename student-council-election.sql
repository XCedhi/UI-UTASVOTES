-- =====================================================
-- INSERT STUDENT COUNCIL ELECTIONS 2026
-- =====================================================
-- Run this in the Supabase SQL Editor
-- This creates the "Student Council Elections 2026" that
-- you see referenced throughout the app but is missing
-- from the elections table (so it doesn't appear in the
-- Commission Panel -> Elections tab).
-- =====================================================

DO $$
DECLARE
  election_name TEXT := 'Student Council Elections 2026';
  election_id UUID;
  positions_count INTEGER;
BEGIN
  -- Step 1: Find the unnamed election (with NULL name)
  -- This was likely created through the API but the name didn't save
  SELECT id INTO election_id
  FROM elections
  WHERE name IS NULL
    AND election_type = 'university-wide'
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF election_id IS NOT NULL THEN
    -- Rename the unnamed election to Student Council Elections 2026
    UPDATE elections
    SET name = election_name,
        description = 'Annual Student Council Elections for the 2026 academic year. Vote for your student representatives.',
        updated_at = NOW()
    WHERE id = election_id;

    RAISE NOTICE '✅ Renamed unnamed election (ID: %) to "%"', election_id, election_name;

    -- Check if positions are already associated
    SELECT COUNT(*) INTO positions_count
    FROM positions
    WHERE election_id = election_id;

    IF positions_count = 0 THEN
      -- Create positions for the renamed election
      INSERT INTO positions (
        election_id,
        title,
        description,
        max_candidates,
        application_fee,
        created_at,
        updated_at
      ) VALUES
        (election_id, 'President', 'Student Council President', 10, 50.00, NOW(), NOW()),
        (election_id, 'Vice President', 'Student Council Vice President', 10, 40.00, NOW(), NOW()),
        (election_id, 'General Secretary', 'Student Council General Secretary', 10, 35.00, NOW(), NOW()),
        (election_id, 'Financial Secretary', 'Student Council Financial Secretary', 10, 35.00, NOW(), NOW()),
        (election_id, 'Treasurer', 'Student Council Treasurer', 10, 30.00, NOW(), NOW()),
        (election_id, 'Public Relations Officer', 'Student Council PRO', 10, 30.00, NOW(), NOW());

      RAISE NOTICE '✅ Created 6 positions for "%"', election_name;
    ELSE
      RAISE NOTICE 'ℹ️ "%" already has % positions — skipping position creation', election_name, positions_count;
    END IF;

  ELSE
    -- No unnamed election found, check if Student Council Elections 2026 already exists
    SELECT id INTO election_id
    FROM elections
    WHERE name = election_name
    LIMIT 1;

    IF election_id IS NULL THEN
      -- Insert the election if it doesn't exist
      INSERT INTO elections (
        name,
        description,
        election_type,
        department,
        nomination_start,
        nomination_end,
        voting_start,
        voting_end,
        status,
        created_at,
        updated_at
      ) VALUES (
        election_name,
        'Annual Student Council Elections for the 2026 academic year. Vote for your student representatives.',
        'university-wide',
        NULL,
        '2026-01-15T08:00:00+00:00',
        '2026-02-15T23:59:59+00:00',
        '2026-01-25T08:00:00+00:00',
        '2026-02-15T23:59:59+00:00',
        'active',
        NOW(),
        NOW()
      )
      RETURNING id INTO election_id;

      RAISE NOTICE '✅ Created election "%" with ID: %', election_name, election_id;

      -- Insert positions for the Student Council election
      INSERT INTO positions (
        election_id,
        title,
        description,
        max_candidates,
        application_fee,
        created_at,
        updated_at
      ) VALUES
        (election_id, 'President', 'Student Council President', 10, 50.00, NOW(), NOW()),
        (election_id, 'Vice President', 'Student Council Vice President', 10, 40.00, NOW(), NOW()),
        (election_id, 'General Secretary', 'Student Council General Secretary', 10, 35.00, NOW(), NOW()),
        (election_id, 'Financial Secretary', 'Student Council Financial Secretary', 10, 35.00, NOW(), NOW()),
        (election_id, 'Treasurer', 'Student Council Treasurer', 10, 30.00, NOW(), NOW()),
        (election_id, 'Public Relations Officer', 'Student Council PRO', 10, 30.00, NOW(), NOW());

      RAISE NOTICE '✅ Created 6 positions for "%"', election_name;
    ELSE
      RAISE NOTICE 'ℹ️ Election "%" already exists with ID: % — skipping insert', election_name, election_id;
    END IF;
  END IF;
END $$;

-- Step 2: Create an announcement for the election
INSERT INTO announcements (type, title, message, priority, is_active, published_at)
SELECT
  'election',
  'Student Council Elections 2026 Now Open',
  'Voting for the Student Council Elections 2026 is now live. Cast your vote before the deadline. Make your voice heard!',
  'high',
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM announcements WHERE title LIKE '%Student Council Elections 2026%'
);

-- Step 3: Verify the result
SELECT
  id,
  name,
  election_type,
  department,
  status,
  nomination_start,
  nomination_end,
  voting_start,
  voting_end,
  created_at
FROM elections
WHERE name = 'Student Council Elections 2026'
ORDER BY created_at DESC;

-- Check positions for the Student Council election
SELECT
  p.id,
  p.election_id,
  p.title,
  p.application_fee
FROM positions p
JOIN elections e ON e.id = p.election_id
WHERE e.name = 'Student Council Elections 2026'
ORDER BY p.created_at;

-- Final summary
SELECT '✅ Student Council Elections 2026 is now in the database and will appear in the Commission Panel -> Elections tab.' as message;