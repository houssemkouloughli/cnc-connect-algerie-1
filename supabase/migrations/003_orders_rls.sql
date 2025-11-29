-- Migration: Policies RLS pour la table orders
-- Cette migration ajoute les politiques de sécurité Row Level Security pour la table orders

-- Activer RLS sur la table orders si ce n'est pas déjà fait
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop des policies existantes si elles existent (idempotence)
DROP POLICY IF EXISTS "Clients can view their own orders" ON orders;
DROP POLICY IF EXISTS "Partners can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Partners can update order status" ON orders;
DROP POLICY IF EXISTS "System can create orders" ON orders;

-- Policy 1: Les clients peuvent voir leurs propres commandes
CREATE POLICY "Clients can view their own orders"
ON orders FOR SELECT
USING (client_id = auth.uid());

-- Policy 2: Les partenaires peuvent voir les commandes qui leur sont attribuées
CREATE POLICY "Partners can view assigned orders"
ON orders FOR SELECT
USING (
  partner_id IN (
    SELECT id FROM partners WHERE profile_id = auth.uid()
  )
);

-- Policy 3: Les partenaires peuvent mettre à jour le statut des commandes qui leur sont attribuées
CREATE POLICY "Partners can update order status"
ON orders FOR UPDATE
USING (
  partner_id IN (
    SELECT id FROM partners WHERE profile_id = auth.uid()
  )
)
WITH CHECK (
  partner_id IN (
    SELECT id FROM partners WHERE profile_id = auth.uid()
  )
);

-- Policy 4: Le système peut créer des commandes (pour la fonction acceptBid)
-- Les utilisateurs authentifiés peuvent créer des commandes pour les devis qu'ils ont créés
CREATE POLICY "System can create orders"
ON orders FOR INSERT
WITH CHECK (
  client_id = auth.uid() OR
  partner_id IN (
    SELECT id FROM partners WHERE profile_id = auth.uid()
  )
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
