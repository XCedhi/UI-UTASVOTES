-- Fix: Create auth user to match existing user_profiles entry
-- Run this in Supabase SQL Editor

-- First, check if admin profile exists
SELECT id, email, full_name FROM user_profiles WHERE email = 'admin@cktutas.edu.gh';

-- If you see a result, copy the ID and use it below
-- If no result, first run the INSERT from QUICK_FIX_ADMIN_PROFILE.md

-- Now let's check if there's a trigger causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Temporarily disable the trigger if it exists
-- (This is what's likely causing the "Database error creating new user")
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Now try creating the auth user via Supabase Dashboard again
-- After creating, re-enable triggers:
ALTER TABLE auth.users ENABLE TRIGGER ALL;
