-- Add role column to existing profiles table
-- Run this in your Supabase SQL Editor

-- Add role column if it doesn't exist
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

-- Create the is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now set your user as admin (replace with your user ID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = '00c3515b-0eb3-4136-990b-1babc2d1f67d';

-- Verify the update
SELECT id, role FROM profiles WHERE id = '00c3515b-0eb3-4136-990b-1babc2d1f67d';

