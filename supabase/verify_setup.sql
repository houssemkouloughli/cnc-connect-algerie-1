-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these queries AFTER complete_setup.sql to verify everything works

-- 1. ✅ Check all 6 tables exist
SELECT COUNT(*) as "Total Tables" FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- Expected: 6

---

-- 2. ✅ Check all 6 ENUM types exist
SELECT COUNT(*) as "Total ENUM Types" FROM pg_type 
WHERE typtype = 'e' 
AND typname IN ('user_role', 'partner_status', 'partner_capability', 'quote_status', 'bid_status', 'order_status');

-- Expected: 6

---

-- 3. ✅ Check 3 sample partners inserted
SELECT company_name, wilaya_code, rating, status FROM partners ORDER BY company_name;

-- Expected: 3 rows
-- - Constantine Usinage, 25, 4.2, pending
-- - MecaPrécision, 16, 4.5, approved
-- - Oran Industries, 31, 4.8, approved

---

-- 4. ✅ Check RLS enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications')
ORDER BY tablename;

-- Expected: All should have rowsecurity = true

---

-- 5. ✅ Check indexes created
SELECT COUNT(*) as "Total Indexes" FROM pg_indexes 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- Expected: 15+ indexes

---

-- 6. ✅ Check all table columns exist
SELECT table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications')
GROUP BY table_name
ORDER BY table_name;

-- Expected output example:
-- bids | 7
-- notifications | 6
-- orders | 10
-- partners | 9
-- profiles | 9
-- quotes | 10

---

-- 7. ✅ Check constraints exist
SELECT constraint_name, table_name FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications')
ORDER BY table_name;

-- Expected: Multiple primary keys, foreign keys, unique constraints

---

-- 🎉 IF ALL QUERIES RETURN EXPECTED RESULTS: SETUP IS COMPLETE!
