/*
  # Update RLS policies for public access

  1. Changes
    - Remove authentication requirements from RLS policies
    - Allow public access to all tables
    - Update existing policies to be more permissive

  2. Security
    - Enable public access while maintaining basic RLS structure
    - Remove role-based restrictions
*/

-- Update blocks policies
DROP POLICY IF EXISTS "Enable read access for all users" ON blocks;
DROP POLICY IF EXISTS "Enable insert access for all users" ON blocks;

CREATE POLICY "Public read access for blocks"
  ON blocks
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for blocks"
  ON blocks
  FOR INSERT
  WITH CHECK (true);

-- Update rooms policies
DROP POLICY IF EXISTS "Enable read access for all users" ON rooms;
DROP POLICY IF EXISTS "Enable insert access for all users" ON rooms;

CREATE POLICY "Public read access for rooms"
  ON rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for rooms"
  ON rooms
  FOR INSERT
  WITH CHECK (true);

-- Update reservations policies
DROP POLICY IF EXISTS "Anyone can read reservations" ON reservations;
DROP POLICY IF EXISTS "Only admins can create reservations" ON reservations;

CREATE POLICY "Public read access for reservations"
  ON reservations
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Update attendance policies
DROP POLICY IF EXISTS "Anyone can read attendance" ON attendance;
DROP POLICY IF EXISTS "Only monitors can mark attendance" ON attendance;

CREATE POLICY "Public read access for attendance"
  ON attendance
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for attendance"
  ON attendance
  FOR INSERT
  WITH CHECK (true);