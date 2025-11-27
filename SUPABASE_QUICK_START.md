# 🚀 QUICK START - Supabase Setup

## ⚡ FINAL VERSION - USE THIS ONE ✅

### 🆕 Nouvelle Version : `complete_setup_final.sql` ← **UTILISER CETTE VERSION**

**C'est la version FINALE et ROBUSTE qui:**
- ✅ Gère les erreurs et les réexécutions
- ✅ Transactions SQL complètes (BEGIN/COMMIT)
- ✅ Nettoyage sûr des politiques avant les tables
- ✅ ID UUID auto-généré (plus de problèmes de référence)
- ✅ Peut être exécutée plusieurs fois sans erreurs

### Instructions:

1. **Ouvrez** : `supabase/complete_setup_final.sql` dans VS Code
2. **Sélectionnez TOUT** : Ctrl+A
3. **Copier** : Ctrl+C
4. **Allez à Supabase** : https://supabase.com/dashboard/project/jvmnfweammcentqnzage/sql
5. **Coller** : Ctrl+V
6. **RUN** : Bouton vert
7. ✅ **Done!** Pas d'erreurs = succès

---

## ✅ Après exécution, vous aurez:

- 6 tables (profiles, partners, quotes, bids, orders, notifications)
- 6 types ENUM (user_role, partner_status, quote_status, bid_status, order_status, partner_capability)
- Indexes pour performance
- RLS (Row Level Security) activé
- 3 partenaires test:
  - MecaPrécision (Alger - Wilaya 16) - Approved
  - Oran Industries (Oran - Wilaya 31) - Approved
  - Constantine Usinage (Constantine - Wilaya 25) - Pending

---

## 📁 Fichiers Supabase:

| Fichier | Status | Usage |
|---------|--------|-------|
| `complete_setup_final.sql` | ⭐ **À UTILISER** | Version finale et robuste |
| `complete_setup_v2.sql` | Alternatif | Si final échoue |
| `complete_setup.sql` | Ancien | Ne pas utiliser |
| `verify_setup.sql` | Support | Vérification après |

---

## 🔐 Après le Setup:

### 1. Configurez `.env.local`

À la racine du projet:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jvmnfweammcentqnzage.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
```

### 2. Lancez le serveur

```bash
npm run dev
```

### 3. Accédez à l'app

http://localhost:3000

---

## 🔍 Vérifier le Setup:

Dans Supabase SQL Editor, exécutez:

```sql
-- Vérifier les 6 tables
SELECT COUNT(*) as "Tables" FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');
```
Expected: **6**

```sql
-- Vérifier les 3 partenaires
SELECT company_name, wilaya_code, status FROM partners;
```
Expected: **3 rows**

```sql
-- Vérifier RLS activé
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');
```
Expected: Tous **TRUE**

---

## ✅ Checklist Final

- [ ] `complete_setup_final.sql` exécuté
- [ ] Aucune erreur SQL
- [ ] 6 tables créées ✅
- [ ] 3 partenaires insérés ✅
- [ ] RLS activé ✅
- [ ] `.env.local` configuré
- [ ] `npm run dev` lancé
- [ ] http://localhost:3000 accessible
