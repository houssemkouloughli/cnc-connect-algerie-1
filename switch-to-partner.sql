-- Configurer le compte de test en tant que PARTENAIRE
-- ⚠️ Exécutez ceci dans le SQL Editor de Supabase

DO $$
DECLARE
    test_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
    -- 1. Mettre à jour le rôle dans auth.users
    UPDATE auth.users 
    SET raw_user_meta_data = '{"full_name":"Partner Test","role":"partner"}'
    WHERE id = test_user_id;

    -- 2. Mettre à jour le rôle dans profiles
    UPDATE profiles 
    SET role = 'partner', full_name = 'Partner Test'
    WHERE id = test_user_id;

    -- 3. Créer l'entrée dans la table partners (si n'existe pas)
    -- 3. Créer l'entrée dans la table partners (si n'existe pas)
    -- Note: On utilise le profile_id pour lier au user
    INSERT INTO partners (
        profile_id,
        company_name,
        description,
        capabilities,
        certifications,
        rating,
        completed_jobs,
        status,
        wilaya_code,
        created_at
    )
    VALUES (
        test_user_id,
        'Atelier Mécanique Pro',
        'Spécialiste usinage CNC haute précision',
        ARRAY['3-axis', '5-axis', 'lathe']::partner_capability[],
        ARRAY['ISO 9001'],
        4.8,
        12,
        'approved',
        '16', -- Alger
        NOW()
    )
    ON CONFLICT DO NOTHING; -- Pas de contrainte unique simple sur profile_id dans le schema initial, donc on suppose insert simple

    -- Mise à jour si existe déjà (via une requête séparée car pas de contrainte unique sur profile_id pour ON CONFLICT)
    UPDATE partners 
    SET company_name = 'Atelier Mécanique Pro', status = 'approved'
    WHERE profile_id = test_user_id;

    -- 4. S'assurer que les RLS permettent au partenaire de voir ses propres données
    -- (Normalement géré par les policies existantes, mais on peut forcer si besoin)
    
    RAISE NOTICE 'User % switched to PARTNER role with complete profile', test_user_id;
END $$;
