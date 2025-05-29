/*
  # Create initial users for the system

  1. Changes
    - Create admin user
    - Create monitor user
    - Add user profiles
*/

-- Insert admin user profile
INSERT INTO auth.users (id, email)
VALUES 
  ('d7bed83c-44a0-4a4f-8947-1b256b50d276', 'admin@example.com');

INSERT INTO public.profiles (id, email, role)
VALUES 
  ('d7bed83c-44a0-4a4f-8947-1b256b50d276', 'admin@example.com', 'admin');

-- Insert monitor user profile
INSERT INTO auth.users (id, email)
VALUES 
  ('e9b9f1b3-0cce-4a41-bc0a-b8013334c026', 'monitor@example.com');

INSERT INTO public.profiles (id, email, role)
VALUES 
  ('e9b9f1b3-0cce-4a41-bc0a-b8013334c026', 'monitor@example.com', 'monitor');