-- Complete script to make user admin
-- Run this entire script in Supabase SQL Editor

-- Step 1: Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Step 2: Create or update profile with admin role
-- This will insert if profile doesn't exist, or update if it does
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES ('00c3515b-0eb3-4136-990b-1babc2d1f67d', 'admin', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Step 3: Verify the update
SELECT id, role, created_at, updated_at 
FROM profiles 
WHERE id = '00c3515b-0eb3-4136-990b-1babc2d1f67d';

-- Step 4: Create the is_admin function (if not exists)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

