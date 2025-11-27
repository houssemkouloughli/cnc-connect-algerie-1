-- ========================================
-- CLEANUP SCRIPT - Supabase Database Reset
-- ========================================
-- This script safely removes all objects created by migrations
-- Run this BEFORE re-running migrations 001-004

-- Step 1: Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Step 2: Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_id_by_email(TEXT);
DROP FUNCTION IF EXISTS update_profiles_updated_at();
DROP FUNCTION IF EXISTS update_partners_updated_at();
DROP FUNCTION IF EXISTS update_quotes_updated_at();
DROP FUNCTION IF EXISTS update_bids_updated_at();
DROP FUNCTION IF EXISTS update_orders_updated_at();

-- Step 3: Drop all tables (with CASCADE to remove dependencies)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 4: Drop all ENUM types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS partner_status CASCADE;
DROP TYPE IF EXISTS partner_capability CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS bid_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Step 5: Verify cleanup
SELECT 'Cleanup complete!' as status;
SELECT COUNT(*) as remaining_tables FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) as remaining_types FROM pg_type WHERE typtype = 'e';

\echo ''
\echo '✅ Database cleaned! You can now run migrations 001-004 again.'
