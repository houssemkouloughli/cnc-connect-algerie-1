-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cad-files', 'cad-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload CAD files" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to CAD files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own CAD files" ON storage.objects;

-- Policy: Anyone can upload (authenticated)
CREATE POLICY "Authenticated users can upload CAD files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'cad-files' );

-- Policy: Anyone can view (public bucket)
CREATE POLICY "Public Access to CAD files"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'cad-files' );

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own CAD files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'cad-files' AND auth.uid() = owner );

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Public read access to profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING ( true );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( auth.uid() = id );

-- =====================================================
-- PARTNERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Approved partners are viewable by everyone" ON partners;
DROP POLICY IF EXISTS "Partners can create their own entry" ON partners;
DROP POLICY IF EXISTS "Partners can update their own entry" ON partners;

-- Public read access to approved partners
CREATE POLICY "Approved partners are viewable by everyone"
ON partners FOR SELECT
USING ( status = 'approved' OR auth.uid() = profile_id );

-- Partners can create their own entry
CREATE POLICY "Partners can create their own entry"
ON partners FOR INSERT
WITH CHECK ( auth.uid() = profile_id );

-- Partners can update their own entry
CREATE POLICY "Partners can update their own entry"
ON partners FOR UPDATE
USING ( auth.uid() = profile_id );

-- =====================================================
-- QUOTES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Partners can view open quotes" ON quotes;
DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
DROP POLICY IF EXISTS "Clients can update own quotes" ON quotes;

-- Clients can see their own quotes
CREATE POLICY "Clients can view own quotes"
ON quotes FOR SELECT
USING ( auth.uid() = client_id );

-- Partners can see open quotes
CREATE POLICY "Partners can view open quotes"
ON quotes FOR SELECT
USING ( 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'partner'
  )
  AND status = 'open'
);

-- Clients can create quotes
CREATE POLICY "Clients can create quotes"
ON quotes FOR INSERT
WITH CHECK ( auth.uid() = client_id );

-- Clients can update their own quotes
CREATE POLICY "Clients can update own quotes"
ON quotes FOR UPDATE
USING ( auth.uid() = client_id );

-- =====================================================
-- BIDS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Clients can view bids on their quotes" ON bids;
DROP POLICY IF EXISTS "Partners can view own bids" ON bids;
DROP POLICY IF EXISTS "Partners can create bids" ON bids;

-- Clients can view bids on their quotes
CREATE POLICY "Clients can view bids on their quotes"
ON bids FOR SELECT
USING ( 
  EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = bids.quote_id 
    AND quotes.client_id = auth.uid()
  )
);

-- Partners can view their own bids
CREATE POLICY "Partners can view own bids"
ON bids FOR SELECT
USING ( 
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = bids.partner_id 
    AND partners.profile_id = auth.uid()
  )
);

-- Partners can create bids
CREATE POLICY "Partners can create bids"
ON bids FOR INSERT
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = partner_id 
    AND partners.profile_id = auth.uid()
  )
);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
DROP POLICY IF EXISTS "Partners can view assigned orders" ON orders;

-- Clients can view their own orders
CREATE POLICY "Clients can view own orders"
ON orders FOR SELECT
USING ( client_id = auth.uid() );

-- Partners can view orders assigned to them
CREATE POLICY "Partners can view assigned orders"
ON orders FOR SELECT
USING ( 
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = orders.partner_id 
    AND partners.profile_id = auth.uid()
  )
);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING ( user_id = auth.uid() );
