# CNC Connect Algérie

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)

**CNC Connect Algérie** est une plateforme B2B connectant les clients industriels avec des ateliers CNC en Algérie. 

🚀 **[Voir la démo en ligne](https://cnc-connect-algerie-1.vercel.app)**

---

## ✨ Fonctionnalités Principales

- **Upload & Visualisation 3D** : Téléchargez vos fichiers STL et visualisez-les en 3D avec Three.js
- **Analyse Géométrique Avancée** : Calcul automatique du volume, surface, complexité et fabricabilité (DFM)
- **Devis Instantané** : Recevez des estimations de prix basées sur l'analyse de votre modèle 3D
- **Dashboard Temps Réel** : Suivez vos devis, commandes et statistiques
- **Performance Optimisée** : Web Workers, Lazy Loading, Cache IndexedDB pour un chargement ultra-rapide

---

## 🛠️ Technologies

- **Frontend** : Next.js 14.2 (App Router), TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, RLS)
- **3D Engine** : Three.js avec Web Workers
- **Hosting** : Vercel

---

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm
- Compte Supabase (gratuit)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/cnc-connect-algerie.git
cd cnc-connect-algerie
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

4. **Exécuter les migrations Supabase**

Sur Supabase Dashboard → SQL Editor :
- Exécutez `supabase/migrations/001_initial_schema.sql`
- Exécutez `supabase/migrations/002_rls_and_storage.sql`

5. **Lancer l'application**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm start            # Serveur de production
npm run lint         # Linter ESLint
```

---

## 📚 Documentation

- **[Guide de Contribution](./CONTRIBUTING.md)** : Standards de code, PR process
- **[Architecture](./ARCHITECTURE.md)** : Diagrammes, patterns, best practices

---

## 🏗️ Structure du Projet

```
├── app/              # Pages & Routes (Next.js App Router)
├── components/       # Composants réutilisables
├── lib/              # Logique métier (3D, Supabase, utils)
├── supabase/         # Migrations SQL
└── public/           # Assets statiques
```

---

## 🚢 Déploiement

### Sur Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel Dashboard
3. Déployez automatiquement à chaque push sur `main`

**Production** : [https://cnc-connect-algerie-1.vercel.app](https://cnc-connect-algerie-1.vercel.app)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour  commencer.

---

## 📞 Support

- **Email** : support@cncconnect.dz
- **Téléphone** : 0555 55 55 55

---

**Développé avec ❤️ en Algérie**

