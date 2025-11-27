# Guide de Déploiement - CNC Connect Algérie

Ce guide vous accompagne étape par étape pour déployer l'application CNC Connect Algérie sur Vercel.

## 📋 Prérequis

- [x] Compte GitHub avec un repository pour ce projet
- [x] Compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- [x] Compte Supabase avec projet configuré
- [x] Node.js 20+ installé localement

## 🚀 Étapes de Déploiement

### 1. Préparation du Repository Git

```bash
# Depuis le dossier du projet
cd c:\Users\lenvo\OneDrive\Desktop\cnc-connect-algerie

# Initialiser Git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - CNC Connect Algérie"

# Créer un repository sur GitHub puis :
git remote add origin https://github.com/VOTRE_USERNAME/cnc-connect-algerie.git
git branch -M main
git push -u origin main
```

### 2. Configuration de Supabase

#### A. Exécuter les Migrations

Allez sur votre dashboard Supabase : https://supabase.com/dashboard/project/jvmnfweammcentqnzage

1. **SQL Editor** → Exécuter les migrations dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_setup.sql`
   - `supabase/migrations/004_seed_data.sql`
   - `supabase/migrations/005_fix_auth_trigger.sql`

2. **Storage** → Vérifier les buckets :
   - `cad-files` (public)
   - `documents` (public)

#### B. Configuration OAuth (Optionnel)

Si vous utilisez l'authentification Google/GitHub :
1. **Authentication** → **Providers**
2. Activer les providers souhaités
3. Configurer les redirects URLs

### 3. Déploiement sur Vercel

#### A. Via l'Interface Vercel (Recommandé)

1. Allez sur [vercel.com/new](https://vercel.com/new)

2. **Import Git Repository**
   - Sélectionnez votre repository GitHub
   - Cliquez sur "Import"

3. **Configure Project**
   - **Framework Preset** : Next.js
   - **Root Directory** : `./`
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

4. **Environment Variables** - Ajouter :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jvmnfweammcentqnzage.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
   ```

5. **Deploy** → Cliquez sur "Deploy"

#### B. Via CLI Vercel (Alternative)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions interactives
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - Project name? cnc-connect-algerie
# - Directory? ./
# - Override settings? No

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Redéployer avec les variables
vercel --prod
```

### 4. Configuration Post-Déploiement

#### A. Configurer Supabase Authentication

1. Dans Supabase Dashboard → **Authentication** → **URL Configuration**

2. Ajouter votre URL Vercel aux **Redirect URLs** :
   ```
   https://VOTRE_APP.vercel.app/auth/callback
   https://VOTRE_APP.vercel.app/login
   https://VOTRE_APP.vercel.app
   ```

3. Ajouter aux **Site URL** :
   ```
   https://VOTRE_APP.vercel.app
   ```

#### B. Vérifier les Buckets Storage

Dans **Storage** → Vérifier que les buckets sont publics :
- `cad-files` : Public access
- `documents` : Public access

### 5. Tests Post-Déploiement

#### ✅ Checklist de Vérification

- [ ] L'application se charge sur l'URL Vercel
- [ ] La page d'accueil s'affiche correctement
- [ ] L'inscription/connexion fonctionne
- [ ] Les images et assets se chargent
- [ ] L'upload de fichiers CAD fonctionne
- [ ] Les devis peuvent être créés
- [ ] Le réseau de partenaires s'affiche
- [ ] Pas d'erreurs dans la console

#### 🧪 Tests Fonctionnels

```bash
# Tester l'URL de production
curl https://VOTRE_APP.vercel.app

# Vérifier les headers de sécurité
curl -I https://VOTRE_APP.vercel.app

# Tester l'API Supabase
curl https://jvmnfweammcentqnzage.supabase.co/rest/v1/
```

## 🔧 Maintenance et Mises à Jour

### Déploiement Continu

Chaque push sur `main` déclenchera automatiquement un nouveau déploiement sur Vercel.

```bash
# Faire des modifications
git add .
git commit -m "Description des changements"
git push origin main

# Vercel déploiera automatiquement
```

### Rollback en cas de problème

1. Allez sur le dashboard Vercel
2. **Deployments** → Sélectionnez un déploiement précédent
3. Cliquez sur **Promote to Production**

### Logs et Monitoring

- **Logs en temps réel** : Vercel Dashboard → **Deployments** → Sélectionner un déploiement → **Logs**
- **Analytics** : Vercel Dashboard → **Analytics**
- **Supabase Logs** : Supabase Dashboard → **Logs**

## 🐛 Dépannage

### Erreur de Build

```bash
# Tester le build localement
npm run build

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Vérifier les dépendances
npm audit fix
```

### Erreur de Variables d'Environnement

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Vérifier que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis
3. Redéployer après modification

### Problèmes d'Authentification

1. Vérifier les **Redirect URLs** dans Supabase
2. S'assurer que l'URL Vercel est correctement configurée
3. Vérifier les logs Supabase pour les erreurs d'auth

## 📞 Support

- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)

## 🎉 Félicitations !

Votre application CNC Connect Algérie est maintenant déployée et accessible en production ! 🚀
