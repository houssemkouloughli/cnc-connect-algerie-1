-- CNC Connect Algérie - Seed Data
-- Run this AFTER all migrations (001, 002, 003)
-- NOTE: You'll need to create users via Supabase Auth first, then update UUIDs here

-- =====================================================
-- VERIFY TABLES EXIST
-- =====================================================
-- Check if partners table exists before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
    RAISE EXCEPTION 'Table partners does not exist. Please run 001_initial_schema.sql first!';
  END IF;
END $$;

-- =====================================================
-- SEED ADMIN USER
-- =====================================================
-- First, create admin user via Supabase Dashboard or Auth API
-- Then update their role:
-- UPDATE profiles SET role = 'admin', full_name = 'Admin CNC Connect' WHERE email = 'admin@cncconnect.dz';

-- =====================================================
-- SEED SAMPLE PARTNERS
-- =====================================================
-- Sample Partner 1: MecaPrécision (Alger)
INSERT INTO partners (id, company_name, wilaya_code, capabilities, certifications, rating, completed_jobs, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'MecaPrécision',
  '16',
  ARRAY['3-axis', 'lathe']::partner_capability[],
  ARRAY['ISO 9001'],
  4.5,
  45,
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- Sample Partner 2: Oran Industries (Oran)
INSERT INTO partners (id, company_name, wilaya_code, capabilities, certifications, rating, completed_jobs, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Oran Industries',
  '31',
  ARRAY['3-axis', '5-axis']::partner_capability[],
  ARRAY['ISO 9001', 'ISO 14001'],
  4.8,
  120,
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- Sample Partner 3: Constantine Usinage (Constantine)
INSERT INTO partners (id, company_name, wilaya_code, capabilities, certifications, rating, completed_jobs, status)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Constantine Usinage',
  '25',
  ARRAY['3-axis', 'sheet-metal']::partner_capability[],
  ARRAY[]::TEXT[],
  4.2,
  30,
  'pending'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED SAMPLE QUOTES (for testing)
-- =====================================================
-- Note: Replace client_id with actual user UUID after creating test client

-- Sample Quote 1
-- INSERT INTO quotes (part_name, material, finish, quantity, target_price, status)
-- VALUES (
--   'Support Moteur V2',
--   'Aluminium 6061',
--   'Anodisation',
--   50,
--   2500.00,
--   'open'
-- );

-- =====================================================
-- HELPER FUNCTION: Get User ID by Email
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE email = user_email LIMIT 1;
$$ LANGUAGE SQL;

-- Usage: SELECT get_user_id_by_email('admin@cncconnect.dz');
