/*
  # Create initial users for the system

  1. Changes
    - Create admin user with proper authentication fields if not exists
    - Create monitor user with proper authentication fields if not exists
    - Add user profiles if not exists
  
  2. Security
    - Check for existing users before insertion
    - Maintain data integrity with proper error handling
*/

DO $$
BEGIN
    -- Create admin user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'd7bed83c-44a0-4a4f-8947-1b256b50d276') THEN
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
    END IF;

    -- Create admin profile if not exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'd7bed83c-44a0-4a4f-8947-1b256b50d276') THEN
        INSERT INTO public.profiles (id, email, role)
        VALUES ('d7bed83c-44a0-4a4f-8947-1b256b50d276', 'admin@example.com', 'admin');
    END IF;

    -- Create monitor user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'e9b9f1b3-0cce-4a41-bc0a-b8013334c026') THEN
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
    END IF;

    -- Create monitor profile if not exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'e9b9f1b3-0cce-4a41-bc0a-b8013334c026') THEN
        INSERT INTO public.profiles (id, email, role)
        VALUES ('e9b9f1b3-0cce-4a41-bc0a-b8013334c026', 'monitor@example.com', 'monitor');
    END IF;
END $$;