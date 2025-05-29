/*
  # Lab Scheduling System Schema

  1. New Tables
    - `blocks`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `rooms`
      - `id` (uuid, primary key)
      - `block_id` (uuid, foreign key to blocks)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `reservations`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `teacher_name` (text)
      - `start_time` (timestamp with time zone)
      - `end_time` (timestamp with time zone)
      - `purpose` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - Add policies for authenticated users to create new records
*/

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blocks"
  ON blocks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blocks"
  ON blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES blocks(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  teacher_name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  purpose text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reservations"
  ON reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster reservation lookups
CREATE INDEX IF NOT EXISTS reservations_time_range_idx 
  ON reservations (start_time, end_time);

-- Create index for room lookups within a block
CREATE INDEX IF NOT EXISTS rooms_block_id_idx 
  ON rooms (block_id);