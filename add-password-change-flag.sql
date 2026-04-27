-- Add requires_password_change column to user_profiles table

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_requires_password_change 
ON user_profiles(requires_password_change);

-- Update existing students to not require password change (they already have accounts)
UPDATE user_profiles 
SET requires_password_change = FALSE 
WHERE requires_password_change IS NULL;

COMMENT ON COLUMN user_profiles.requires_password_change IS 'Flag indicating if user must change password on next login';
