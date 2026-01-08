-- Fix Admin Orders Access
-- The admin dashboard uses separate authentication (admin_users table)
-- but RLS policies check auth.uid() which doesn't exist for admin dashboard users
-- Run this SQL in Supabase SQL Editor

-- SOLUTION: Update the orders policy to allow admin dashboard access
-- Since admin dashboard uses anon key without Supabase Auth, auth.uid() is NULL

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admin dashboard can view all orders" ON orders;

-- Create updated policy that allows:
-- 1. Users to see their own orders (auth.uid() = user_id)
-- 2. Admins to see all orders (is_admin check)
-- 3. Admin dashboard access (when auth.uid() is NULL - using anon key)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard (separate auth system)
  );

-- Alternative: If above doesn't work, create a more permissive policy
-- This allows all SELECT operations (for admin dashboard)
-- Drop first, then create
DROP POLICY IF EXISTS "Admin dashboard can view all orders" ON orders;
CREATE POLICY "Admin dashboard can view all orders" ON orders
  FOR SELECT USING (true);

-- Fix UPDATE policy for admin dashboard
-- Drop existing update policy
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Create updated UPDATE policy that allows admin dashboard
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard (separate auth system)
  )
  WITH CHECK (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard
  );

-- Alternative: More permissive UPDATE policy (if above doesn't work)
DROP POLICY IF EXISTS "Admin dashboard can update orders" ON orders;
CREATE POLICY "Admin dashboard can update orders" ON orders
  FOR UPDATE USING (true)
  WITH CHECK (true);

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
WHERE tablename = 'orders';

-- Test query (should return all orders)
SELECT COUNT(*) as total_orders FROM orders;
SELECT id, status, total, created_at FROM orders ORDER BY created_at DESC LIMIT 5;

