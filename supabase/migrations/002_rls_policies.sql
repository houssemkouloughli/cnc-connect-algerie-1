-- CNC Connect Algérie - RLS Policies
-- Run this AFTER 001_initial_schema.sql

-- =====================================================
-- PROFILES TABLE - RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PARTNERS TABLE - RLS
-- =====================================================
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved partners
DROP POLICY IF EXISTS "Anyone can view approved partners" ON partners;
CREATE POLICY "Anyone can view approved partners"
  ON partners FOR SELECT
  USING (status = 'approved');

-- Partners can view their own profile (any status)
DROP POLICY IF EXISTS "Partners can view own profile" ON partners;
CREATE POLICY "Partners can view own profile"
  ON partners FOR SELECT
  USING (
    profile_id = auth.uid()
  );

-- Partners can update their own profile
DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile"
  ON partners FOR UPDATE
  USING (profile_id = auth.uid());

-- Partners can insert their own profile
DROP POLICY IF EXISTS "Partners can create own profile" ON partners;
CREATE POLICY "Partners can create own profile"
  ON partners FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage all partners" ON partners;
CREATE POLICY "Admins can manage all partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- QUOTES TABLE - RLS
-- =====================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Clients can view their own quotes
DROP POLICY IF EXISTS "Clients can view own quotes" ON quotes;
CREATE POLICY "Clients can view own quotes"
  ON quotes FOR SELECT
  USING (client_id = auth.uid());

-- Clients can create quotes
DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
CREATE POLICY "Clients can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can update their own quotes
DROP POLICY IF EXISTS "Clients can update own quotes" ON quotes;
CREATE POLICY "Clients can update own quotes"
  ON quotes FOR UPDATE
  USING (client_id = auth.uid());

-- Partners can view open quotes
DROP POLICY IF EXISTS "Partners can view open quotes" ON quotes;
CREATE POLICY "Partners can view open quotes"
  ON quotes FOR SELECT
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'partner'
    )
  );

-- Admins can view all quotes
DROP POLICY IF EXISTS "Admins can view all quotes" ON quotes;
CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- BIDS TABLE - RLS
-- =====================================================
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Partners can view their own bids
DROP POLICY IF EXISTS "Partners can view own bids" ON bids;
CREATE POLICY "Partners can view own bids"
  ON bids FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE profile_id = auth.uid()
    )
  );

-- Partners can create bids
DROP POLICY IF EXISTS "Partners can create bids" ON bids;
CREATE POLICY "Partners can create bids"
  ON bids FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE profile_id = auth.uid()
    )
  );

-- Clients can view bids on their quotes
DROP POLICY IF EXISTS "Clients can view bids on own quotes" ON bids;
CREATE POLICY "Clients can view bids on own quotes"
  ON bids FOR SELECT
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE client_id = auth.uid()
    )
  );

-- Clients can update bid status (accept/reject)
DROP POLICY IF EXISTS "Clients can update bid status" ON bids;
CREATE POLICY "Clients can update bid status"
  ON bids FOR UPDATE
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE client_id = auth.uid()
    )
  );

-- =====================================================
-- ORDERS TABLE - RLS
-- =====================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own orders
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING (client_id = auth.uid());

-- Partners can view their own orders
DROP POLICY IF EXISTS "Partners can view own orders" ON orders;
CREATE POLICY "Partners can view own orders"
  ON orders FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE profile_id = auth.uid()
    )
  );

-- Clients can create orders
DROP POLICY IF EXISTS "Clients can create orders" ON orders;
CREATE POLICY "Clients can create orders"
  ON orders FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Partners can update order status
DROP POLICY IF EXISTS "Partners can update order status" ON orders;
CREATE POLICY "Partners can update order status"
  ON orders FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE - RLS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications (via service role)
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
