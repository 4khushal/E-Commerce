-- Create a test order for admin dashboard
-- Run this in Supabase SQL Editor to test the orders page

-- First, check if you have any products
SELECT id, name, price FROM products LIMIT 5;

-- Create a test order (replace user_id with an actual user ID from auth.users)
-- You can get a user ID from: SELECT id FROM auth.users LIMIT 1;

INSERT INTO orders (
  user_id,
  items,
  total,
  shipping_address,
  status,
  created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user, or replace with specific user_id
  '[
    {
      "id": "test-product-1",
      "name": "Test Product",
      "price": 2999,
      "quantity": 2,
      "image": "https://via.placeholder.com/300"
    }
  ]'::jsonb,
  5998.00,
  '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Test Street",
    "city": "Test City",
    "state": "TS",
    "zipCode": "12345"
  }'::jsonb,
  'pending',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify the order was created
SELECT 
  id,
  status,
  total,
  shipping_address->>'firstName' as first_name,
  shipping_address->>'email' as email,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

