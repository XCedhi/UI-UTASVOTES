-- =====================================================
-- VERIFY STUDENT PROFILE EXISTS
-- =====================================================

-- Check if student user exists in auth.users
SELECT 
    'AUTH USER CHECK' as check_type,
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
        ELSE '❌ Email Not Confirmed'
    END as email_status
FROM auth.users 
WHERE email = 'student@cktutas.edu.gh';

-- Check if student profile exists in user_profiles
SELECT 
    'PROFILE CHECK' as check_type,
    id,
    email,
    role,
    full_name,
    student_id,
    department,
    requires_password_change,
    created_at
FROM user_profiles 
WHERE email = 'student@cktutas.edu.gh';

-- Check for orphaned auth user (user without profile)
SELECT 
    'ORPHANED USER CHECK' as check_type,
    au.id,
    au.email,
    CASE 
        WHEN up.id IS NULL THEN '❌ NO PROFILE - NEEDS FIX'
        ELSE '✅ HAS PROFILE'
    END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'student@cktutas.edu.gh';

-- If profile is missing, create it
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'student@cktutas.edu.gh';
    
    -- Check if user exists
    IF v_user_id IS NOT NULL THEN
        -- Check if profile already exists
        IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = v_user_id) THEN
            -- Create the profile
            INSERT INTO user_profiles (
                id,
                email,
                role,
                full_name,
                student_id,
                department,
                requires_password_change,
                created_at,
                updated_at
            ) VALUES (
                v_user_id,
                'student@cktutas.edu.gh',
                'student',
                'Test Student',
                '2026001',
                'Computer Science',
                false,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '✅ Profile created for student@cktutas.edu.gh';
        ELSE
            RAISE NOTICE '✅ Profile already exists for student@cktutas.edu.gh';
        END IF;
    ELSE
        RAISE NOTICE '❌ User not found in auth.users - Please create the user first';
    END IF;
END $$;

-- Verify the profile was created/exists
SELECT 
    'FINAL VERIFICATION' as check_type,
    up.id,
    up.email,
    up.role,
    up.full_name,
    up.student_id,
    up.department,
    '✅ READY TO LOGIN' as status
FROM user_profiles up
WHERE up.email = 'student@cktutas.edu.gh';
