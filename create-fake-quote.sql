-- Créer une fausse demande de devis (Quote) pour tester le Marketplace
-- ⚠️ Exécutez ceci dans le SQL Editor de Supabase

DO $$
DECLARE
    fake_client_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- 1. Créer un faux client (pour que la quote ait un propriétaire)
    INSERT INTO auth.users (id, email)
    VALUES (fake_client_id, 'fake.client@test.com')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, email, full_name, role, wilaya_code)
    VALUES (fake_client_id, 'fake.client@test.com', 'Industrie Sarl', 'client', '31') -- Oran
    ON CONFLICT (id) DO NOTHING;

    -- 2. Créer la demande de devis (Quote)
    INSERT INTO quotes (
        client_id,
        part_name,
        material,
        quantity,
        target_price,
        status,
        deadline,
        created_at
    )
    VALUES (
        fake_client_id,
        'Support Moteur Aluminium',
        'Aluminium 6061',
        50,
        150000, -- 150,000 DZD
        'open', -- Important: doit être 'open' pour apparaître dans le marketplace
        NOW() + INTERVAL '7 days',
        NOW()
    );

    RAISE NOTICE 'Fausse demande de devis créée avec succès !';
END $$;
