-- CNC Connect Algérie - Migration Verification Script
-- Run this to verify all migrations were applied correctly

\echo '========================================='
\echo 'CNC CONNECT ALGERIE - MIGRATION CHECK'
\echo '========================================='

-- Check if tables exist
\echo ''
\echo '1. Checking Tables...'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications')
ORDER BY table_name;

-- Check if ENUMS exist
\echo ''
\echo '2. Checking ENUM Types...'
SELECT typname FROM pg_type WHERE typtype = 'e' AND typname LIKE '%user_role%' OR typname LIKE '%partner%';

-- Check if indexes exist
\echo ''
\echo '3. Checking Indexes...'
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders');

-- Check RLS enabled
\echo ''
\echo '4. Checking RLS Status...'
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- Check storage buckets
\echo ''
\echo '5. Checking Storage Buckets...'
SELECT id, name, public FROM storage.buckets;

-- Check sample data
\echo ''
\echo '6. Checking Sample Data...'
SELECT 'Partners' as table_name, COUNT(*) as count FROM partners
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'Bids', COUNT(*) FROM bids
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;

\echo ''
\echo '========================================='
\echo 'Verification complete!'
\echo '========================================='
