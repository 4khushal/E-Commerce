-- Fix Admin Profiles Access
-- The admin dashboard needs to access profiles to show customer names
-- but RLS policies are blocking access when auth.uid() is NULL
-- Run this SQL in Supabase SQL Editor

-- Drop existing SELECT policy for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin dashboard can view profiles" ON profiles;

-- Create updated SELECT policy that allows:
-- 1. Users to see their own profile (auth.uid() = id)
-- 2. Admins to see all profiles (is_admin check)
-- 3. Admin dashboard access (when auth.uid() is NULL)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard (separate auth system)
  );

-- Alternative: More permissive policy (if above doesn't work)
-- This allows all SELECT operations (for admin dashboard)
CREATE POLICY "Admin dashboard can view profiles" ON profiles
  FOR SELECT USING (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

