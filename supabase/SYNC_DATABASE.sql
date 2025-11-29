-- =========================================
-- SCRIPT DE SYNCHRONISATION COMPLETE
-- Renomme les tables françaises → anglaises
-- Et applique toute la configuration nécessaire
-- =========================================

-- ÉTAPE 1 : Nettoyer les tables inutiles
-- =========================================
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS ateliers CASCADE;
DROP TABLE IF EXISTS dépenses CASCADE;
DROP TABLE IF EXISTS inventaire CASCADE;
DROP TABLE IF EXISTS employés CASCADE;

-- ÉTAPE 2 : Renommer les tables existantes
-- =========================================
ALTER TABLE IF EXISTS profils RENAME TO profiles;
ALTER TABLE IF EXISTS partenaires RENAME TO partners;
ALTER TABLE IF EXISTS ordres RENAME TO orders;
ALTER TABLE IF EXISTS offres RENAME TO bids;
ALTER TABLE IF EXISTS citations RENAME TO quotes;
-- notifications existe déjà avec le bon nom

-- ÉTAPE 3 : Appliquer le schema complet (si colonnes manquent)
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types (idempotent)
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('client', 'partner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE partner_capability AS ENUM ('3-axis', '5-axis', 'lathe', 'sheet-metal', '3d-printing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE quote_status AS ENUM ('open', 'closed', 'awarded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'negotiating');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('new_bid', 'bid_accepted', 'order_status', 'new_message');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ÉTAPE 4 : Ajouter colonnes manquantes (sécurisé)
-- =========================================

-- PROFILES
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wilaya_code TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- PARTNERS
DO $$ BEGIN
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS wilaya_code TEXT NOT NULL;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS capabilities partner_capability[] DEFAULT '{}';
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS completed_jobs INTEGER DEFAULT 0;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS status partner_status DEFAULT 'pending';
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS factory_address TEXT;
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- QUOTES
DO $$ BEGIN
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS part_name TEXT NOT NULL;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS material TEXT NOT NULL;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS target_price DECIMAL(10,2);
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS file_url TEXT;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status quote_status DEFAULT 'open';
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- BIDS
DO $$ BEGIN
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE CASCADE;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS lead_time_days INTEGER NOT NULL;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS message TEXT;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS status bid_status DEFAULT 'pending';
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- ORDERS
DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES bids(id);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS status order_status DEFAULT 'pending';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- NOTIFICATIONS (déjà créée normalement)
DO $$ BEGIN
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type notification_type NOT NULL;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT NOT NULL;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- ÉTAPE 5 : Index de performance
-- =========================================
CREATE INDEX IF NOT EXISTS idx_partners_profile_id ON partners(profile_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_bids_quote_id ON bids(quote_id);
CREATE INDEX IF NOT EXISTS idx_bids_partner_id ON bids(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ÉTAPE 6 : Triggers
-- =========================================

-- Trigger: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'client')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-update orders.updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- ÉTAPE 7 : RLS Policies  
-- =========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PARTNERS
DROP POLICY IF EXISTS "Public can view approved partners" ON partners;
CREATE POLICY "Public can view approved partners" ON partners FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile" ON partners FOR UPDATE USING (profile_id = auth.uid());

-- QUOTES
DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
CREATE POLICY "Clients can view own quotes" ON quotes FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Partners can view open quotes" ON quotes;
CREATE POLICY "Partners can view open quotes" ON quotes FOR SELECT USING (status = 'open');

DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
CREATE POLICY "Clients can create quotes" ON quotes FOR INSERT WITH CHECK (client_id = auth.uid());

-- BIDS
DROP POLICY IF EXISTS "Clients can view bids on own quotes" ON bids;
CREATE POLICY "Clients can view bids on own quotes" ON bids FOR SELECT 
USING (quote_id IN (SELECT id FROM quotes WHERE client_id = auth.uid()));

DROP POLICY IF EXISTS "Partners can view own bids" ON bids;
CREATE POLICY "Partners can view own bids" ON bids FOR SELECT 
USING (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Partners can create bids" ON bids;
CREATE POLICY "Partners can create bids" ON bids FOR INSERT 
WITH CHECK (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

-- ORDERS
DROP POLICY IF EXISTS "Clients can view their own orders" ON orders;
CREATE POLICY "Clients can view their own orders" ON orders FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Partners can view assigned orders" ON orders;
CREATE POLICY "Partners can view assigned orders" ON orders FOR SELECT 
USING (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Partners can update order status" ON orders;
CREATE POLICY "Partners can update order status" ON orders FOR UPDATE 
USING (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "System can create orders" ON orders;
CREATE POLICY "System can create orders" ON orders FOR INSERT WITH CHECK (true);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- ÉTAPE 8 : Storage (CAD Files)
-- =========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view CAD files" ON storage.objects;
CREATE POLICY "Public can view CAD files"
ON storage.objects FOR SELECT
USING (bucket_id = 'cad-files');

DROP POLICY IF EXISTS "Authenticated users can upload CAD files" ON storage.objects;
CREATE POLICY "Authenticated users can upload CAD files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cad-files' AND auth.role() = 'authenticated');

-- =========================================
-- VÉRIFICATION FINALE
-- =========================================

-- Liste des tables (doit montrer toutes les tables en anglais)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Message de succès
SELECT '✅ Migration complète réussie ! Tables renommées et configurées.' as status;
