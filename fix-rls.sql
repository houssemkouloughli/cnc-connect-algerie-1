-- Corriger les permissions RLS pour la table profiles
-- ⚠️ Exécutez ceci dans le SQL Editor de Supabase

-- 1. Activer RLS (au cas où)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies conflictuelles (optionnel mais recommandé)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- 3. Créer des policies permissives pour le développement
-- Lecture : Tout le monde peut lire les profils (nécessaire pour voir les partenaires)
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT 
USING (true);

-- Insertion : Un utilisateur peut créer son propre profil
CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Mise à jour : Un utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Vérifier que l'utilisateur existe bien (rappel)
DO $$
DECLARE
    test_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
    -- Vérifier si le profil existe
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        INSERT INTO profiles (id, email, full_name, role)
        VALUES (test_user_id, 'client@test.com', 'Client Test', 'client');
        RAISE NOTICE 'Profil recréé pour %', test_user_id;
    END IF;
END $$;
