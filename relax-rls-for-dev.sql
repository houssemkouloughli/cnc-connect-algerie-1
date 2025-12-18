-- Désactiver temporairement les RLS pour le développement
-- ⚠️ À NE PAS FAIRE EN PRODUCTION

-- 1. Permettre la lecture publique des quotes (pour le Marketplace)
DROP POLICY IF EXISTS "Public read access for quotes in dev" ON quotes;
CREATE POLICY "Public read access for quotes in dev"
ON quotes FOR SELECT
USING (true);

-- 2. Permettre la lecture publique des partners (pour afficher les infos)
DROP POLICY IF EXISTS "Public read access for partners in dev" ON partners;
CREATE POLICY "Public read access for partners in dev"
ON partners FOR SELECT
USING (true);

-- 3. Permettre la lecture publique des profils (déjà fait, mais on confirme)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
ON profiles FOR SELECT
USING (true);
