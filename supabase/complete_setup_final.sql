-- ========================================
-- SUPABASE COMPLETE SETUP - FINAL VERSION
-- ========================================
-- Safe, idempotent script - can run multiple times safely
-- Includes cleanup, schema creation, RLS, and seed data

-- ========================================
-- PHASE 1: SAFE CLEANUP (if tables exist)
-- ========================================

-- Drop tables first (they will drop policies automatically via CASCADE)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_id_by_email(TEXT) CASCADE;

-- Drop types
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS bid_status CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS partner_capability CASCADE;
DROP TYPE IF EXISTS partner_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ========================================
-- PHASE 2: CREATE SCHEMA
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

-- PROFILES TABLE (standalone, no external references)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- PHASE 3: ENABLE RLS
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Profiles - Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profiles - Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- PARTNERS POLICIES
CREATE POLICY "Partners - Approved partners visible to all"
ON partners FOR SELECT
USING (status = 'approved');

CREATE POLICY "Partners - Profile owners can see own"
ON partners FOR SELECT
USING (auth.uid() = profile_id);

-- QUOTES POLICIES
CREATE POLICY "Quotes - Clients can see own quotes"
ON quotes FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Quotes - Partners can see open quotes"
ON quotes FOR SELECT
USING (status = 'open');

-- BIDS POLICIES
CREATE POLICY "Bids - Users can see bids on own quotes"
ON bids FOR SELECT
USING (
  auth.uid() IN (SELECT client_id FROM quotes WHERE id = quote_id)
  OR
  auth.uid() IN (SELECT profile_id FROM partners WHERE id = partner_id)
);

-- ORDERS POLICIES
CREATE POLICY "Orders - Users can see own orders"
ON orders FOR SELECT
USING (
  auth.uid() = client_id 
  OR 
  auth.uid() IN (SELECT profile_id FROM partners WHERE id = partner_id)
);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Notifications - Users can see their own"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- ========================================
-- PHASE 4: STORAGE SETUP
-- ========================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', false)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT DO NOTHING;

-- STORAGE POLICIES

-- Users can upload their own files
DROP POLICY IF EXISTS "Users can upload own CAD files" ON storage.objects;
CREATE POLICY "Users can upload own CAD files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own files
DROP POLICY IF EXISTS "Users can view own CAD files" ON storage.objects;
CREATE POLICY "Users can view own CAD files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Partners can view CAD files for quotes they bid on
DROP POLICY IF EXISTS "Partners can view CAD files for their bids" ON storage.objects;
CREATE POLICY "Partners can view CAD files for their bids"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cad-files' AND
    EXISTS (
      SELECT 1 FROM bids b
      JOIN quotes q ON b.quote_id = q.id
      JOIN partners p ON b.partner_id = p.id
      WHERE p.profile_id = auth.uid()
      AND q.file_url LIKE '%' || name || '%'
    )
  );

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own CAD files" ON storage.objects;
CREATE POLICY "Users can delete own CAD files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view thumbnails (public bucket)
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- Users can upload thumbnails
DROP POLICY IF EXISTS "Users can upload thumbnails" ON storage.objects;
CREATE POLICY "Users can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
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
-- VERIFICATION QUERIES (run separately)
-- ========================================
-- Uncomment and run individually to verify:

-- SELECT COUNT(*) as "Total Tables" FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');
-- Expected: 6

-- SELECT company_name, rating, status FROM partners ORDER BY company_name;
-- Expected: 3 partners

-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');
-- Expected: All TRUE

-- ========================================
-- SETUP COMPLETE!
-- ========================================
