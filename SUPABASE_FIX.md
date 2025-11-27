# 🔧 Guide de Fixation - Problèmes Supabase

## ❌ Problèmes Détectés
```
ERROR 42P07: la relation « quotes » existe déjà
ERROR 42P01: la relation « partners » n'existe pas
```

## 🎯 Cause
Les migrations ont été exécutées **partiellement ou en désordre**, créant des tables incomplètes et causant des conflits.

---

## ✅ Solution Rapide (Recommandée) - 2 minutes ⚡

### 🚀 SETUP COMPLET EN UNE SEULE COMMANDE

1. Allez à **Supabase Dashboard → SQL Editor**
2. Ouvrez le fichier: `supabase/complete_setup.sql`
3. **Copier-coller TOUT le contenu**
4. Cliquez sur **RUN** (bouton vert "Courir CTRL ↵")
5. ✅ **DONE!** Votre base est prête

**Avantages:**
- ✅ Une seule exécution
- ✅ Cleanup automatique
- ✅ Toutes les migrations en une fois
- ✅ Vérification intégrée
- ✅ Données test incluses (3 partenaires)

---

## ✅ Solution Manuelle (Si vous préférez)

### Étape 1: Nettoyer la Base de Données

Si vous avez des migrations cassées:

1. **Supabase Dashboard → SQL Editor**
2. Ouvrez: `supabase/cleanup_database.sql`
3. Exécutez le script complet

---

### Étape 2: Exécuter les Migrations en Ordre

Allez à **Supabase Dashboard → SQL Editor** et exécutez les fichiers **dans cet ordre exact** :

#### 🔹 Migration 1: Schéma Initial
**Fichier:** `supabase/migrations/001_initial_schema.sql`

**Attendu:** ✅ Pas d'erreurs  
**Créé:** Tables + Types ENUM + Indexes + Triggers

---

#### 🔹 Migration 2: Politiques de Sécurité (RLS)
**Fichier:** `supabase/migrations/002_rls_policies.sql`

**Attendu:** ✅ Pas d'erreurs  
**Créé:** Politiques RLS pour chaque table

---

#### 🔹 Migration 3: Stockage
**Fichier:** `supabase/migrations/003_storage_setup.sql`

**Attendu:** ✅ Pas d'erreurs  
**Créé:** Buckets storage + Politiques

---

#### 🔹 Migration 4: Données Test (Seed)
**Fichier:** `supabase/migrations/004_seed_data.sql`

**Attendu:** ✅ 3 partners insérés  
**Créé:** Données exemple

---

## 🚨 Troubleshooting

### Erreur: "relation « XXX » existe déjà"
**Solution:** Utilisez `supabase/cleanup_database.sql` ou `supabase/complete_setup.sql`

### Erreur: "type « XXX » does not exist"
**Solution:** Exécutez la migration 001 en premier

### Erreur: "relation does not exist"
**Solution:** Exécutez les migrations dans l'ordre (001 → 004)

---

## 📊 État Attendu Après Setup

Vérifiez avec ces requêtes SQL:

```sql
-- 1. Vérifier les tables (devrait retourner 6)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partners', 'quotes', 'bids', 'orders', 'notifications');

-- 2. Vérifier les données test (devrait retourner 3)
SELECT COUNT(*) FROM partners;

-- 3. Vérifier les types ENUM (devrait retourner 6)
SELECT COUNT(*) FROM pg_type WHERE typtype = 'e';
```

---

## 📝 Checklist Finale

- [ ] Setup exécuté (complete_setup.sql OU migrations 001-004)
- [ ] Pas d'erreurs dans l'exécution
- [ ] 6 tables présentes
- [ ] 3 partenaires test présents
- [ ] 6 types ENUM présents
- [ ] RLS activé
- [ ] `.env.local` configuré avec credentials Supabase

---

## 📞 Support

Si vous avez encore des problèmes:
1. Vérifiez les logs: **Supabase Dashboard → Logs**
2. Relancez `complete_setup.sql`
