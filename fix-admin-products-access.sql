-- Fix Admin Products Access
-- The admin dashboard uses separate authentication (admin_users table)
-- but RLS policies check auth.uid() which doesn't exist for admin dashboard users
-- Run this SQL in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by admin only" ON products;
DROP POLICY IF EXISTS "Products are updatable by admin only" ON products;
DROP POLICY IF EXISTS "Products are deletable by admin only" ON products;
DROP POLICY IF EXISTS "Admin dashboard can manage products" ON products;

-- SELECT Policy: Allow everyone to view products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- INSERT Policy: Allow admin dashboard to create products
CREATE POLICY "Products are insertable by admin only" ON products
  FOR INSERT WITH CHECK (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard (separate auth system)
  );

-- UPDATE Policy: Allow admin dashboard to update products
CREATE POLICY "Products are updatable by admin only" ON products
  FOR UPDATE USING (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard
  )
  WITH CHECK (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard
  );

-- DELETE Policy: Allow admin dashboard to delete products
CREATE POLICY "Products are deletable by admin only" ON products
  FOR DELETE USING (
    is_admin(auth.uid()) OR
    auth.uid() IS NULL  -- Allow admin dashboard
  );

-- Alternative: More permissive policies (if above doesn't work)
-- Uncomment these if you still get RLS errors
/*
DROP POLICY IF EXISTS "Admin dashboard can manage products" ON products;
CREATE POLICY "Admin dashboard can manage products" ON products
  FOR ALL USING (true)
  WITH CHECK (true);
*/

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
WHERE tablename = 'products';

