# 🔐 OAuth Integration - Quick Reference

## ✨ Nouveautés implémentées

### Pages de connexion & inscription améliorées
- Google Login/Signup ✅
- GitHub Login/Signup ✅
- Email/Password classique ✅
- Gestion des erreurs ✅

### Flux complet OAuth
```
Utilisateur → Clique "Connexion Google/GitHub"
    ↓
Redirigé vers OAuth provider
    ↓
Autorise l'accès
    ↓
Callback → /auth/callback
    ↓
Session créée
    ↓
Profil créé automatiquement
    ↓
Redirection dashboard
```

## 📍 URLs disponibles

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Connexion avec email/Google/GitHub |
| Signup | `/signup` | Inscription avec email/Google/GitHub |
| OAuth Callback | `/auth/callback` | Gestion du callback OAuth |
| Comptes connectés | `/profile/connected-providers` | Gestion des comptes liés |

## 🎯 Fonctionnalités

### ✅ Authentication
- Email/Password
- Google OAuth
- GitHub OAuth
- Auto-création de profil
- Redirection intelligente par rôle

### ✅ Gestion de compte
- Lier/Délier Google
- Lier/Délier GitHub
- Voir l'état de connexion
- Messages de confirmation

### ✅ Sécurité
- Session gérée par Supabase
- RLS policies en place
- Validation des credentials
- Redirection URI sécurisée

## 🔧 Configuration

### Avant de tester, vous DEVEZ:

#### 1️⃣ Google OAuth (Obligatoire)
```bash
1. Allez à https://console.cloud.google.com
2. Créez un projet
3. Activez Google+ API
4. Créez OAuth credentials (Web application)
5. Ajoutez URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback?provider=google
6. Copiez Client ID et Secret
7. Allez à Supabase → Authentication → Providers → Google
8. Entrez Client ID et Secret
9. Activez et sauvegardez
```

#### 2️⃣ GitHub OAuth (Obligatoire)
```bash
1. Allez à https://github.com/settings/developers
2. Créez une nouvelle OAuth App
3. Authorization callback URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback?provider=github
4. Copiez Client ID et générez Client Secret
5. Allez à Supabase → Authentication → Providers → GitHub
6. Entrez Client ID et Secret
7. Activez et sauvegardez
```

## 🚀 Test immédiat

### En local (localhost:3000)
```bash
1. npm run dev
2. Allez à http://localhost:3000/login
3. Cliquez "Connexion Google" ou "Connexion GitHub"
4. Vérifiez la redirection
```

### En production
```bash
Remplacez dans les URLs d'autorisation:
localhost:3000 → votre domaine
```

## 📊 Fichiers modifiés/créés

```
✅ app/login/page.tsx - Google + GitHub buttons
✅ app/signup/page.tsx - Google + GitHub buttons + validation
✅ app/auth/callback/page.tsx - OAuth callback handler
✅ app/profile/connected-providers/page.tsx - Gestion comptes
✅ components/auth/OAuthButtons.tsx - Composant réutilisable
✅ OAUTH_SETUP.md - Documentation détaillée
✅ OAUTH_IMPLEMENTATION.md - Guide implémentation
```

## 🎨 Interface

### Login Page
```
┌──────────────────────┐
│   Connexion          │
├──────────────────────┤
│ Email: [________]    │
│ Password: [______]   │
│ [Se connecter]       │
│                      │
│   ─── Ou ───         │
│                      │
│ [Connexion Google]   │
│ [Connexion GitHub]   │
├──────────────────────┤
│ Pas de compte? Signup│
└──────────────────────┘
```

## 🔍 Variables d'environnement

Vérifiez que `.env.local` contient:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY
```

## 📞 Support

**Erreur courante #1: "Invalid redirect URI"**
→ Vérifiez l'URL exacte chez le provider

**Erreur courante #2: "OAuth app not found"**
→ Vérifiez que Client ID/Secret sont corrects

**Erreur courante #3: Profil non créé**
→ Vérifiez les RLS policies

## ✅ Checklist avant production

- [ ] Google OAuth configuré dans Supabase
- [ ] GitHub OAuth configuré dans Supabase
- [ ] Domaine configuré dans les callbacks
- [ ] .env.local a les bonnes clés
- [ ] Build sans erreurs: `npm run build`
- [ ] Test local fonctionne
- [ ] RLS policies vérifiées

## 🎯 Prochaines étapes optionnelles

1. Ajouter Discord OAuth
2. Ajouter Microsoft OAuth
3. Ajouter LinkedIn OAuth
4. Avatar depuis provider
5. Synchronisation des données

## 📚 Documentation complète

Voir:
- `OAUTH_SETUP.md` - Guide de configuration
- `OAUTH_IMPLEMENTATION.md` - Détails techniques
