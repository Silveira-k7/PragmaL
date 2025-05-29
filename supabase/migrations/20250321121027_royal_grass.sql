/*
  # Add delete policies for all tables

  1. Changes
    - Add delete policies for blocks table
    - Add delete policies for rooms table
    - Add delete policies for reservations table
    - Add delete policies for attendance table

  2. Security
    - Allow public delete access for all tables
    - Maintain RLS enabled
*/

-- Add delete policies for blocks
CREATE POLICY "Enable delete access for all users"
  ON blocks
  FOR DELETE
  USING (true);

-- Add delete policies for rooms
CREATE POLICY "Enable delete access for all users"
  ON rooms
  FOR DELETE
  USING (true);

-- Add delete policies for reservations
CREATE POLICY "Enable delete access for all users"
  ON reservations
  FOR DELETE
  USING (true);

-- Add delete policies for attendance
CREATE POLICY "Enable delete access for all users"
  ON attendance
  FOR DELETE
  USING (true);