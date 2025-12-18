# IMPORTANT: Dev Mode Authentication Bypass

## 🚀 Quick Start - Testing Without Login

### 1. Activer le mode Dev
Créez `.env.local` avec:
```env
NEXT_PUBLIC_BYPASS_AUTH=true
NEXT_PUBLIC_DEV_USER_ID=dev-client-123
NEXT_PUBLIC_DEV_USER_EMAIL=client@test.com
NEXT_PUBLIC_DEV_USER_NAME=Client Test
NEXT_PUBLIC_DEV_USER_ROLE=client
```

### 2. Lancer l'app
```bash
npm run dev
```

### 3. Tester directement
- Pas de login requis ✅
- Upload fichier → marche directement
- Création quote → attribué à "Client Test"
- Toutes les fonctionnalités accessibles

## 🔄 Changer de rôle

**Tester en tant que PARTNER:**
```env
NEXT_PUBLIC_DEV_USER_ROLE=partner
```

**Tester en tant que ADMIN:**
```env
NEXT_PUBLIC_DEV_USER_ROLE=admin
```

## 🔒 Mode Production

Pour réactiver l'authentification:
```env
NEXT_PUBLIC_BYPASS_AUTH=false
```

## ⚠️ Limitations du Mode Dev

- Les RLS policies Supabase sont bypassées
- Pas de validation d'email
- User ID fixe (pas de multi-utilisateurs)

## ✅ Ce qui fonctionne

- Upload 3D ✅
- Création quotes ✅
- Soumission bids ✅
- Messagerie ✅
- Génération PDF ✅
- Calcul shipping ✅

**C'est parfait pour tester toutes les fonctionnalités rapidement !**
