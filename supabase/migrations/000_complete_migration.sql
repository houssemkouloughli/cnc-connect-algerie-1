-- =========================================
-- SCRIPT DE MIGRATION COMPLET
-- À exécuter dans Supabase SQL Editor
-- =========================================

-- Ce script consolide toutes les migrations essentielles
-- Exécutez-le en une seule fois dans Supabase

-- =========================================
-- 1. SCHEMA INITIAL
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'partner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE partner_capability AS ENUM ('3-axis', '5-axis', 'lathe', 'sheet-metal', '3d-printing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('open', 'closed', 'awarded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'negotiating');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('new_bid', 'bid_accepted', 'order_status', 'new_message');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  wilaya_code TEXT,
  phone TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERS TABLE
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  wilaya_code TEXT NOT NULL,
  capabilities partner_capability[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00,
  completed_jobs INTEGER DEFAULT 0,
  status partner_status DEFAULT 'pending',
  factory_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  material TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  target_price DECIMAL(10,2),
  file_url TEXT,
  thumbnail_url TEXT,
  status quote_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BIDS TABLE
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  lead_time_days INTEGER NOT NULL,
  message TEXT,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id),
  bid_id UUID REFERENCES bids(id),
  partner_id UUID REFERENCES partners(id),
  client_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(10,2),
  status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- =========================================
-- 2. INDEXES
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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =========================================
-- 3. TRIGGERS
-- =========================================

-- Trigger to create profile on signup
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

-- Auto-update updated_at on orders
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

-- =========================================
-- 4. RLS POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PARTNERS policies
DROP POLICY IF EXISTS "Public can view approved partners" ON partners;
CREATE POLICY "Public can view approved partners" ON partners FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile" ON partners FOR UPDATE 
USING (profile_id = auth.uid());

-- QUOTES policies
DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
CREATE POLICY "Clients can view own quotes" ON quotes FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Partners can view open quotes" ON quotes;
CREATE POLICY "Partners can view open quotes" ON quotes FOR SELECT USING (status = 'open');

DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
CREATE POLICY "Clients can create quotes" ON quotes FOR INSERT WITH CHECK (client_id = auth.uid());

-- BIDS policies
DROP POLICY IF EXISTS "Clients can view bids on own quotes" ON bids;
CREATE POLICY "Clients can view bids on own quotes" ON bids FOR SELECT 
USING (quote_id IN (SELECT id FROM quotes WHERE client_id = auth.uid()));

DROP POLICY IF EXISTS "Partners can view own bids" ON bids;
CREATE POLICY "Partners can view own bids" ON bids FOR SELECT 
USING (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Partners can create bids" ON bids;
CREATE POLICY "Partners can create bids" ON bids FOR INSERT 
WITH CHECK (partner_id IN (SELECT id FROM partners WHERE profile_id = auth.uid()));

-- ORDERS policies
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

-- NOTIFICATIONS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- =========================================
-- 5. STORAGE (CAD Files)
-- =========================================

-- Create storage bucket for CAD files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view CAD files" ON storage.objects;
CREATE POLICY "Public can view CAD files"
ON storage.objects FOR SELECT
USING (bucket_id = 'cad-files');

DROP POLICY IF EXISTS "Authenticated users can upload CAD files" ON storage.objects;
CREATE POLICY "Authenticated users can upload CAD files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cad-files' AND auth.role() = 'authenticated');

-- =========================================
-- FIN DU SCRIPT
-- =========================================

SELECT 'Migration complète terminée avec succès !' as message;
