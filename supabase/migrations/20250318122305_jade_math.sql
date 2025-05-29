/*
  # Add passwords for existing users

  1. Changes
    - Update existing users to add encrypted passwords
    - Set email_confirmed_at to enable immediate login
    - Update raw_app_meta_data for proper authentication

  2. Security
    - Passwords are encrypted using bcrypt
    - Email confirmation is set to allow immediate login
*/

-- Update admin user
UPDATE auth.users
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{}'::jsonb,
  aud = 'authenticated',
  role = 'authenticated'
WHERE id = 'd7bed83c-44a0-4a4f-8947-1b256b50d276';

-- Update monitor user
UPDATE auth.users
SET 
  encrypted_password = crypt('monitor123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{}'::jsonb,
  aud = 'authenticated',
  role = 'authenticated'
WHERE id = 'e9b9f1b3-0cce-4a41-bc0a-b8013334c026';