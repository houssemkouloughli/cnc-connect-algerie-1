-- Migration: Système de Notifications
-- Crée la table notifications avec RLS pour les notifications in-app

-- Créer le type ENUM pour les types de notifications
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'new_bid',           -- Nouvelle offre reçue
        'bid_accepted',      -- Offre acceptée
        'order_status',      -- Changement statut commande
        'new_message'        -- Nouveau message (futur)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,  -- URL vers la ressource concernée (ex: /client/commandes/123)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Données contextuelles (JSON flexible pour stocker infos additionnelles)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop des policies existantes (idempotence)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Policy 1: Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy 2: Les utilisateurs peuvent mettre à jour leurs propres notifications (marquer comme lu)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 3: Le système peut créer des notifications pour n'importe quel utilisateur
-- (nécessaire pour les triggers et fonctions serveur)
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Fonction pour nettoyer les anciennes notifications (optionnel, à exécuter via cron)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = true;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON TABLE notifications IS 'Notifications in-app pour les utilisateurs';
COMMENT ON COLUMN notifications.metadata IS 'Données contextuelles en JSON (quote_id, order_id, etc.)';
COMMENT ON COLUMN notifications.link IS 'Lien relatif vers la ressource (ex: /client/commandes/abc123)';
