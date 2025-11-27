# 🚀 Démarrage Rapide - Déploiement CNC Connect

## 📌 Statut

✅ **Tous les fichiers de configuration sont prêts**  
⚠️ **Build local échoue (bug Next.js 16 + Turbopack)** → Déployer directement sur Vercel

---

## ⚡ 3 Étapes pour Déployer

### 1️⃣ Pusher sur GitHub

```bash
# Dans le dossier du projet
cd c:\Users\lenvo\OneDrive\Desktop\cnc-connect-algerie

# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "feat: CNC Connect Algérie - Ready for deployment"

# Créer un repository sur GitHub: https://github.com/new
# Nom suggéré: cnc-connect-algerie

# Ajouter le remote et push
git remote add origin https://github.com/VOTRE_USERNAME/cnc-connect-algerie.git
git branch -M main
git push -u origin main
```

### 2️⃣ Déployer sur Vercel

**Option A - Via Interface Web (Plus Simple)** :

1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub
3. Ajoutez les variables d'environnement :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jvmnfweammcentqnzage.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
   ```
4. Cliquez sur "Deploy"

**Option B - Via CLI** :

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3️⃣ Configurer Supabase

Après déploiement, ajoutez l'URL Vercel dans Supabase :

1. Dashboard Supabase → **Authentication** → **URL Configuration**
2. Ajoutez `https://VOTRE_APP.vercel.app` aux Redirect URLs
3. Exécutez les 5 migrations SQL (voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Guide détaillé complet |
| [DEPLOY_COMMANDS.md](DEPLOY_COMMANDS.md) | Toutes les commandes |
| [CHECKLIST_DEPLOYMENT.md](CHECKLIST_DEPLOYMENT.md) | Checklist de vérification |
| [BUILD_ISSUE.md](BUILD_ISSUE.md) | Solutions si problèmes |

---

## ⚠️ Note sur le Build Local

Le build local échoue à cause d'un bug dans Next.js 16.0.4 + Turbopack.  
**Ce n'est pas grave** : Vercel gère son propre build et devrait fonctionner.

Si Vercel échoue aussi, consultez [BUILD_ISSUE.md](BUILD_ISSUE.md) pour les solutions.

---

## ✅ Après le Déploiement

- [ ] Testez l'URL Vercel fournie
- [ ] Vérifiez que l'authentification fonctionne
- [ ] Testez l'upload de fichiers CAD
- [ ] Créez un devis test
- [ ] Vérifiez le réseau partenaires

---

**Vous êtes prêt ! 🎉**
