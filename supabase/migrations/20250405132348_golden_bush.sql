/*
  # Fix authentication schema

  1. Changes
    - Drop the foreign key constraint from profiles table that references non-existent users table
    - Update profiles table to use auth.users instead
    
  2. Security
    - Enable RLS on profiles table
    - Add policy for authenticated users to read their own profile
*/

-- First remove the foreign key constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update the policy to use auth.uid() function
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);