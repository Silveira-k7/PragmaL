/*
  # Fix authentication credentials

  1. Changes
    - Drop and recreate users with correct credentials
    - Ensure proper password encryption
    - Set up correct authentication metadata
  
  2. Security
    - Use proper password hashing
    - Maintain existing security policies
*/

-- First, clean up existing users to avoid conflicts
DELETE FROM auth.users WHERE email IN ('admin@example.com', 'monitor@example.com');
DELETE FROM public.profiles WHERE email IN ('admin@example.com', 'monitor@example.com');

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'd7bed83c-44a0-4a4f-8947-1b256b50d276',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
);

-- Create admin profile
INSERT INTO public.profiles (id, email, role)
VALUES (
  'd7bed83c-44a0-4a4f-8947-1b256b50d276',
  'admin@example.com',
  'admin'
);

-- Create monitor user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'e9b9f1b3-0cce-4a41-bc0a-b8013334c026',
  '00000000-0000-0000-0000-000000000000',
  'monitor@example.com',
  crypt('monitor123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
);

-- Create monitor profile
INSERT INTO public.profiles (id, email, role)
VALUES (
  'e9b9f1b3-0cce-4a41-bc0a-b8013334c026',
  'monitor@example.com',
  'monitor'
);