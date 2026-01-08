-- Admin Users Table (Separate from regular users)
-- Run this in your Supabase SQL Editor

-- Create admin_users table for separate admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Admin users policies (only admins can access)
-- Note: For initial setup, you may need to temporarily disable RLS
-- or use service role key for admin operations

-- For now, allow authenticated admins to view (we'll handle auth in app)
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (true); -- Temporarily open, secure in production

-- Insert default admin user
-- NOTE: For production, implement proper password hashing (bcrypt)
-- For now, password is stored as plain text (NOT SECURE - for demo only)
-- TODO: Implement bcrypt password hashing in production

-- Create your first admin user (change email and password!)
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES (
  'admin@example.com',
  'admin123', -- CHANGE THIS PASSWORD! Use proper hashing in production
  'Admin User',
  true
)
ON CONFLICT (email) DO NOTHING;

-- To add more admin users:
-- INSERT INTO admin_users (email, password_hash, name, is_active)
-- VALUES ('another@admin.com', 'password123', 'Another Admin', true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users
  FOR EACH ROW 
  EXECUTE FUNCTION update_admin_users_updated_at();

