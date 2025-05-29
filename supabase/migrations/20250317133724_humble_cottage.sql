/*
  # Add user roles and attendance tracking

  1. New Tables
    - `profiles`
      - Stores user profile information and role
    - `attendance`
      - Tracks attendance for reservations
  
  2. Changes
    - Update reservation policies for role-based access
    - Add attendance tracking capabilities
    
  3. Security
    - Enable RLS on new tables
    - Add role-based policies
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'monitor');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'monitor',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  status boolean NOT NULL, -- true = present, false = absent
  marked_by uuid REFERENCES auth.users(id) NOT NULL,
  marked_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Update existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON reservations;
DROP POLICY IF EXISTS "Enable insert access for all users" ON reservations;

-- New policies for reservations
CREATE POLICY "Anyone can read reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create reservations"
  ON reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policies for attendance
CREATE POLICY "Anyone can read attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only monitors can mark attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'monitor'
    )
  );