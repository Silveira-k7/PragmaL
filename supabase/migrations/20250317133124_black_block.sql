/*
  # Update RLS policies for public access

  1. Changes
    - Update policies for blocks table to allow public access
    - Update policies for rooms table to allow public access
    - Update policies for reservations table to allow public access

  2. Security
    - Allow public access for read and write operations
    - Remove authentication requirements
*/

-- Update blocks policies
DROP POLICY IF EXISTS "Anyone can read blocks" ON blocks;
DROP POLICY IF EXISTS "Authenticated users can create blocks" ON blocks;

CREATE POLICY "Enable read access for all users"
  ON blocks
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON blocks
  FOR INSERT
  WITH CHECK (true);

-- Update rooms policies
DROP POLICY IF EXISTS "Anyone can read rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;

CREATE POLICY "Enable read access for all users"
  ON rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON rooms
  FOR INSERT
  WITH CHECK (true);

-- Update reservations policies
DROP POLICY IF EXISTS "Anyone can read reservations" ON reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON reservations;

CREATE POLICY "Enable read access for all users"
  ON reservations
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON reservations
  FOR INSERT
  WITH CHECK (true);