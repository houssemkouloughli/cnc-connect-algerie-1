-- Créer un utilisateur test dans auth.users et profiles
-- ⚠️ Exécutez ceci dans le SQL Editor de votre Supabase Dashboard

-- UUID à utiliser pour le dev
DO $$
DECLARE
    test_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- UUID fixe pour dev
BEGIN
    -- 1. Insérer dans auth.users (table système)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
    )
    VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        'client@test.com',
        '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash',
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Client Test","role":"client"}',
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insérer dans profiles
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        created_at
    )
    VALUES (
        test_user_id,
        'client@test.com',
        'Client Test',
        'client',
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Test user created with ID: %', test_user_id;
END $$;

-- ✅ Après ça, mettez à jour .env.local avec:
-- NEXT_PUBLIC_DEV_USER_ID=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
