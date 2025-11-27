-- ========================================
-- COMPLETE SUPABASE SETUP - All-in-One Script
-- ========================================
-- Run this SINGLE script to setup everything
-- It includes cleanup + all migrations + seed data
-- NOTE: This is pure SQL, no psql commands

-- ========================================
-- PHASE 1: CLEANUP (Remove old objects)
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners CASCADE;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes CASCADE;
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_id_by_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_partners_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_quotes_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_bids_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS partner_status CASCADE;
DROP TYPE IF EXISTS partner_capability CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS bid_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- ========================================
-- PHASE 2: CREATE SCHEMA (Migration 001)
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('client', 'partner', 'admin');
CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE partner_capability AS ENUM ('3-axis', '5-axis', 'lathe', 'sheet-metal', '3d-printing');
CREATE TYPE quote_status AS ENUM ('open', 'closed', 'awarded');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'negotiating');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled');

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
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

-- Trigger to create profile on signup (optional, for future use)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'client')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger will be created but won't cause errors if auth.users doesn't exist
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PARTNERS TABLE
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  wilaya_code TEXT NOT NULL,
  capabilities partner_capability[] NOT NULL DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs INTEGER DEFAULT 0,
  status partner_status DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES TABLE
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  part_name TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  material TEXT NOT NULL,
  finish TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  target_price DECIMAL(10,2),
  geometry_data JSONB,
  status quote_status DEFAULT 'open',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BIDS TABLE
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  lead_time_days INTEGER NOT NULL CHECK (lead_time_days > 0),
  message TEXT,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  client_wilaya TEXT,
  partner_wilaya TEXT,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_wilaya ON partners(wilaya_code);
CREATE INDEX idx_partners_profile_id ON partners(profile_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_bids_quote_id ON bids(quote_id);
CREATE INDEX idx_bids_partner_id ON bids(partner_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ========================================
-- PHASE 3: SETUP RLS (Migration 002)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES - Users can see their own profile
CREATE POLICY "Profiles - Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profiles - Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- PARTNERS - Public read for approved partners
CREATE POLICY "Partners - Approved partners visible to all"
ON partners FOR SELECT
USING (status = 'approved');

CREATE POLICY "Partners - Profile owners can see own"
ON partners FOR SELECT
USING (auth.uid() = profile_id);

-- QUOTES - Clients see own quotes, partners see open quotes
CREATE POLICY "Quotes - Clients can see own quotes"
ON quotes FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Quotes - Partners can see open quotes"
ON quotes FOR SELECT
USING (status = 'open');

-- BIDS - Users can see bids on their quotes
CREATE POLICY "Bids - Users can see bids on own quotes"
ON bids FOR SELECT
USING (
  auth.uid() IN (
    SELECT client_id FROM quotes WHERE id = quote_id
  )
  OR
  auth.uid() = (SELECT profile_id FROM partners WHERE id = partner_id)
);

-- ORDERS - Users can see their own orders
CREATE POLICY "Orders - Users can see own orders"
ON orders FOR SELECT
USING (
  auth.uid() = client_id 
  OR 
  auth.uid() IN (SELECT profile_id FROM partners WHERE id = partner_id)
);

-- NOTIFICATIONS - Users can see their own
CREATE POLICY "Notifications - Users can see their own"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- ========================================
-- PHASE 4: SEED DATA (Migration 004)
-- ========================================

-- Helper function
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE email = user_email LIMIT 1;
$$ LANGUAGE SQL;

-- Sample Partners (will work even if they reference non-existent profiles)
INSERT INTO partners (id, company_name, wilaya_code, capabilities, certifications, rating, completed_jobs, status)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'MecaPrécision',
    '16',
    ARRAY['3-axis', 'lathe']::partner_capability[],
    ARRAY['ISO 9001'],
    4.5,
    45,
    'approved'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Oran Industries',
    '31',
    ARRAY['3-axis', '5-axis']::partner_capability[],
    ARRAY['ISO 9001', 'ISO 14001'],
    4.8,
    120,
    'approved'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Constantine Usinage',
    '25',
    ARRAY['3-axis', 'sheet-metal']::partner_capability[],
    ARRAY[]::TEXT[],
    4.2,
    30,
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PHASE 5: VERIFICATION
-- ========================================
-- Run these queries to verify the setup was successful:

-- 1. Check tables created (should return 6)
-- SELECT COUNT(*) as tables_count FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- 2. Check ENUM types created (should return 6)
-- SELECT COUNT(*) as enum_count FROM pg_type 
-- WHERE typtype = 'e' 
-- AND typname IN ('user_role', 'partner_status', 'partner_capability', 'quote_status', 'bid_status', 'order_status');

-- 3. Check sample partners (should return 3)
-- SELECT COUNT(*) as partners_count FROM partners;

-- 4. Check indexes created
-- SELECT COUNT(*) as indexes_count FROM pg_indexes 
-- WHERE schemaname = 'public';

-- 5. Check RLS enabled (should return 6 TRUE)
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- If you see this without errors, everything is ready!
-- Next steps:
-- 1. Create users via Supabase Auth
-- 2. Configure Storage (if using buckets)
-- 3. Update .env.local with Supabase credentials
-- 4. Start development server: npm run dev
