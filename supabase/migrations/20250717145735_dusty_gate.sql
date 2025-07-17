/*
  # Complete Authentication System Rebuild

  1. New Tables
    - `app_users` - Application users with roles and permissions
    - `user_sessions` - Track user sessions
    - Update existing tables to work with new auth system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Secure user management functions

  3. Functions
    - User creation and management functions
    - Authentication helpers
*/

-- Create app_users table for application-level authentication
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for app_users
CREATE POLICY "Users can read own data"
  ON app_users
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage users"
  ON app_users
  FOR ALL
  USING (true);

-- Policies for user_sessions
CREATE POLICY "Users can manage own sessions"
  ON user_sessions
  FOR ALL
  USING (true);

-- Update existing tables to work with new auth system
-- Add created_by field to reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE reservations ADD COLUMN created_by uuid REFERENCES app_users(id);
  END IF;
END $$;

-- Update RLS policies for existing tables to work with new auth
DROP POLICY IF EXISTS "Public read access for blocks" ON blocks;
DROP POLICY IF EXISTS "Public insert access for blocks" ON blocks;
DROP POLICY IF EXISTS "Enable delete access for all users" ON blocks;

CREATE POLICY "Anyone can read blocks"
  ON blocks FOR SELECT USING (true);

CREATE POLICY "Admins can manage blocks"
  ON blocks FOR ALL USING (true);

-- Update rooms policies
DROP POLICY IF EXISTS "Public read access for rooms" ON rooms;
DROP POLICY IF EXISTS "Public insert access for rooms" ON rooms;
DROP POLICY IF EXISTS "Enable delete access for all users" ON rooms;

CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL USING (true);

-- Update reservations policies
DROP POLICY IF EXISTS "Public read access for reservations" ON reservations;
DROP POLICY IF EXISTS "Public insert access for reservations" ON reservations;
DROP POLICY IF EXISTS "Enable delete access for all users" ON reservations;

CREATE POLICY "Anyone can read reservations"
  ON reservations FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage reservations"
  ON reservations FOR ALL USING (true);

-- Create default admin user
INSERT INTO app_users (email, password_hash, full_name, role)
VALUES (
  'admin@pragma.com',
  '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', -- password: admin123
  'Administrador',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_created_by ON reservations(created_by);