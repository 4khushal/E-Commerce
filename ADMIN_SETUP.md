# Admin Dashboard Setup Guide

## Prerequisites

1. **Admin User Setup**
   - Run the updated `supabase-schema.sql` in your Supabase SQL Editor
   - To make a user an admin, update their profile:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = 'user-uuid-here';
   ```

2. **Supabase Storage Setup**
   - Go to Supabase Dashboard > Storage
   - Create a new bucket named `product-images`
   - Set it to Public (or configure policies for authenticated users)
   - Add the following policy for public access:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'product-images');
   ```

3. **Phone Notifications**
   - The notification service is currently a placeholder
   - To enable SMS notifications, you'll need to:
     - Set up a backend API endpoint (Node.js/Express recommended)
     - Integrate with Twilio, AWS SNS, or similar SMS service
     - Update `src/services/notifications.js` to call your API
   - Example backend implementation is included in the comments

## Admin Routes

- `/admin` - Dashboard with statistics
- `/admin/products` - Manage products (list, edit, delete)
- `/admin/products/new` - Add new product
- `/admin/products/:id/edit` - Edit product
- `/admin/orders` - View and manage orders (approve/reject)
- `/admin/categories` - Manage product categories

## Features

✅ **Product Management**
- Add, edit, delete products
- Upload product images to Supabase Storage
- Manage stock and pricing
- Category assignment

✅ **Order Management**
- View all orders
- Filter by status
- Approve/reject orders
- Update order status (pending → confirmed → processing → shipped → delivered)
- Phone notifications when orders are confirmed

✅ **Category Management**
- View existing categories
- Add new categories
- Remove custom categories

✅ **Protected Routes**
- Admin-only access
- Automatic redirect for non-admin users
- Role-based permissions in database

## Making a User Admin

1. Get the user's UUID from Supabase Auth
2. Run this SQL:
```sql
-- Insert or update profile with admin role
INSERT INTO profiles (id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

## Image Upload

Product images are uploaded to Supabase Storage in the `product-images` bucket. Make sure:
- The bucket exists and is public
- Storage policies allow uploads from authenticated admin users
- The bucket name matches `product-images` in `src/services/supabase.js`

