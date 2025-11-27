# 🚀 Commandes de Déploiement Rapide

Ce fichier contient toutes les commandes nécessaires pour déployer CNC Connect Algérie.

## 📋 Préparation

### 1. Vérifier les dépendances

```bash
cd c:\Users\lenvo\OneDrive\Desktop\cnc-connect-algerie
npm install
```

### 2. Tester le build local

```bash
npm run build
```

Si des erreurs apparaissent, corrigez-les avant de continuer.

### 3. Tester en production locale

```bash
npm run start
```

Ouvrez http://localhost:3000 pour vérifier.

## 🔧 Git Setup

### Initialiser Git (si nécessaire)

```bash
# Initialiser le repository
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: Initial deployment setup for CNC Connect Algérie"

# Créer le repository distant
# 1. Allez sur https://github.com/new
# 2. Créez un nouveau repository "cnc-connect-algerie"
# 3. NE PAS initialiser avec README, .gitignore ou license

# Ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/cnc-connect-algerie.git

# Pousser le code
git branch -M main
git push -u origin main
```

### Si Git est déjà initialisé

```bash
# Vérifier le statut
git status

# Ajouter les changements
git add .

# Commit
git commit -m "feat: Deployment configuration"

# Pousser
git push origin main
```

## ☁️ Déploiement Vercel (Méthode CLI)

### Installation de Vercel CLI

```bash
npm i -g vercel
```

### Connexion à Vercel

```bash
vercel login
```

### Premier déploiement

```bash
# Déploiement en preview
vercel

# Répondre aux questions :
# ? Set up and deploy? [Y/n] Y
# ? Which scope? Sélectionnez votre compte
# ? Link to existing project? [y/N] N
# ? What's your project's name? cnc-connect-algerie
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
```

### Ajouter les variables d'environnement

```bash
# URL Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Quand demandé, entrez :
# Value: https://jvmnfweammcentqnzage.supabase.co
# Environment: Production, Preview, Development

# Clé Supabase
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Quand demandé, entrez :
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
# Environment: Production, Preview, Development
```

### Déploiement en production

```bash
vercel --prod
```

## 🌐 Déploiement Vercel (Méthode GUI)

### Via le Dashboard

1. **Connexion**
   ```
   https://vercel.com/login
   ```

2. **Import Project**
   - Cliquez sur "Add New..." → "Project"
   - Sélectionnez "Import Git Repository"
   - Choisissez votre repository GitHub

3. **Configuration**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables**
   
   Ajoutez ces variables :
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://jvmnfweammcentqnzage.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
   ```

5. **Deploy**
   - Cliquez sur "Deploy"
   - Attendez que le déploiement se termine

## 🗄️ Configuration Supabase

### Exécuter les migrations

Allez sur : https://supabase.com/dashboard/project/jvmnfweammcentqnzage/sql

**Exécutez dans l'ordre :**

1. **Migration 001** - Schéma initial
   ```bash
   # Copiez le contenu de : supabase/migrations/001_initial_schema.sql
   # Collez dans SQL Editor et exécutez
   ```

2. **Migration 002** - Politiques RLS
   ```bash
   # Copiez le contenu de : supabase/migrations/002_rls_policies.sql
   # Collez dans SQL Editor et exécutez
   ```

3. **Migration 003** - Configuration Storage
   ```bash
   # Copiez le contenu de : supabase/migrations/003_storage_setup.sql
   # Collez dans SQL Editor et exécutez
   ```

4. **Migration 004** - Données de démarrage
   ```bash
   # Copiez le contenu de : supabase/migrations/004_seed_data.sql
   # Collez dans SQL Editor et exécutez
   ```

5. **Migration 005** - Fix trigger auth
   ```bash
   # Copiez le contenu de : supabase/migrations/005_fix_auth_trigger.sql
   # Collez dans SQL Editor et exécutez
   ```

### Configurer les Redirect URLs

1. Allez sur : **Authentication** → **URL Configuration**

2. Ajoutez vos URLs (remplacez VOTRE_APP par votre URL Vercel) :
   ```
   https://VOTRE_APP.vercel.app/auth/callback
   https://VOTRE_APP.vercel.app/login
   https://VOTRE_APP.vercel.app
   http://localhost:3000/auth/callback
   http://localhost:3000/login
   http://localhost:3000
   ```

3. Site URL :
   ```
   https://VOTRE_APP.vercel.app
   ```

## 🧪 Vérification

### Tester l'URL de production

```bash
# Remplacez VOTRE_APP par votre URL Vercel
curl https://VOTRE_APP.vercel.app
```

### Vérifier les logs Vercel

```bash
vercel logs VOTRE_APP.vercel.app
```

### Vérifier les headers de sécurité

```bash
curl -I https://VOTRE_APP.vercel.app
```

## 🔄 Déploiements futurs

### Déploiement automatique (recommandé)

Chaque `git push` sur `main` déclenchera un déploiement automatique.

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

### Déploiement manuel

```bash
vercel --prod
```

## 📊 Monitoring

### Voir les déploiements

```bash
vercel ls
```

### Voir les logs en temps réel

```bash
vercel logs --follow
```

### Ouvrir le dashboard

```bash
vercel dashboard
```

## 🚨 Rollback

### Via CLI

```bash
# Lister les déploiements
vercel ls

# Promouvoir un déploiement précédent
vercel promote [deployment-url]
```

### Via Dashboard

1. Allez sur Vercel Dashboard
2. Sélectionnez votre projet
3. Onglet "Deployments"
4. Sélectionnez un déploiement précédent
5. "Promote to Production"

## 🎉 C'est fait !

Votre application est déployée ! 🚀

**URL Production** : https://VOTRE_APP.vercel.app

**Prochaines étapes** :
1. Testez toutes les fonctionnalités
2. Partagez l'URL avec votre équipe
3. Configurez le monitoring
4. Collectez les retours utilisateurs
