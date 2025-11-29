# Architecture - CNC Connect Algérie

Ce document décrit l'architecture technique de la plateforme CNC Connect Algérie.

---

## 📐 Vue d'Ensemble

CNC Connect Algérie est une application **Next.js 14** (App Router) avec **Supabase** comme Backend-as-a-Service. L'architecture suit un modèle **client-server** avec rendu côté serveur (SSR) et composants clients interactifs.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │  Components │  │  3D Engine  │         │
│  │  (Routes)   │  │    (UI)     │  │  (Three.js) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└───────────────────────────┬─────────────────────────────────┘
                            │ API Calls (Supabase Client)
┌───────────────────────────▼─────────────────────────────────┐
│                     Backend (Supabase)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  PostgreSQL │  │     Auth    │  │   Storage   │         │
│  │   Database  │  │   (JWT)     │  │   (S3-like) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                                                    │
│         └─ Row Level Security (RLS)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure des Dossiers

### `/app` - Routes & Pages (App Router)

```
app/
├── (auth)/              # Groupe de routes d'authentification
│   ├── login/
│   └── signup/
├── client/              # Dashboard client
│   └── dashboard/
├── partner/             # Dashboard partenaire
│   └── dashboard/
├── admin/               # Dashboard admin
│   └── dashboard/
├── devis/               # Workflow de création de devis
│   ├── page.tsx         # Page principale (3 étapes)
│   └── components/
│       ├── CADUploader.tsx
│       ├── Viewer3D.tsx
│       └── QuoteForm.tsx
├── layout.tsx           # Layout racine (global)
├── page.tsx             # Page d'accueil
└── middleware.ts        # Protection des routes
```

**Conventions** :
- Les dossiers avec `()` sont des groupes de routes (n'affectent pas l'URL)
- `page.tsx` = route accessible publiquement
- `layout.tsx` = wrapper partagé entre routes enfants

---

### `/components` - Composants Réutilisables

```
components/
├── ui/                  # Composants UI de base
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Toast.tsx
│   ├── EmptyState.tsx
│   └── ...
├── layout/              # Composants de mise en page
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── BottomNav.tsx
├── dashboard/           # Composants spécifiques dashboards
│   ├── QuoteList.tsx
│   ├── KPICard.tsx
│   └── ...
└── ErrorBoundary.tsx    # Error handling global
```

**Principes** :
- **Composants clients** : Marqués avec `'use client'`
- **Props typées** : Toujours définir une interface
- **Réutilisabilité** : Composants génériques dans `/ui`

---

### `/lib` - Logique Métier & Utilitaires

```
lib/
├── 3d/                  # Moteur 3D
│   ├── core/
│   │   ├── GeometryAnalyzer.ts    # Calculs volume, surface
│   │   ├── DFMAnalyzer.ts         # Analyse de fabricabilité
│   │   └── types.ts
│   ├── workers/
│   │   ├── WorkerManager.ts       # Singleton Web Worker
│   │   └── stl-parser.worker.ts  # Parser STL en worker
│   └── cache/
│       └── GeometryCache.ts       # IndexedDB cache
├── supabase/
│   ├── client.ts        # Client Supabase (browser)
│   └── server.ts        # Client Supabase (server)
├── queries/             # Requêtes DB
│   ├── quotes.ts
│   ├── partners.ts
│   └── ...
├── utils/
│   ├── auth.ts          # Helpers auth (signOut, etc.)
│   └── ...
└── errors/
    └── handleError.ts   # Traduction erreurs techniques
```

---

## 🔐 Authentification & Autorisation

### Flow d'Authentification

```
1. User → /login
2. Supabase Auth (Email/Password)
3. JWT Token stocké (httpOnly cookie)
4. Middleware vérifie token sur routes protégées
5. Redirect vers dashboard selon rôle
```

### Middleware (`app/middleware.ts`)

```typescript
// Routes protégées
const protectedRoutes = ['/client', '/partner', '/admin', '/devis'];

// Vérification du token
const { data: { user } } = await supabase.auth.getUser();

if (!user && isProtectedRoute) {
  return NextResponse.redirect('/login?redirect=' + pathname);
}
```

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS :

```sql
-- Exemple : Les clients ne voient que leurs devis
CREATE POLICY "Users can view own quotes"
ON quotes FOR SELECT
USING (auth.uid() = client_id);
```

---

## 🎨 Gestion de l'État

### État Local (React)
- `useState` : État du composant
- `useEffect` : Side effects (fetch data, subscriptions)

### État Global
- **Toast Notifications** : Context API (`ToastProvider`)
- **Auth State** : Supabase client (`onAuthStateChange`)

### Cache
- **IndexedDB** : Cache des fichiers STL déjà uploadés
- **React Query** (future) : Cache des requêtes Supabase

---

## 🚀 Performance

### Code Splitting

```typescript
// Lazy loading du Viewer3D (lourd : Three.js)
const Viewer3D = dynamic(() => import('./components/Viewer3D'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

### Web Workers

Le parsing STL se fait dans un Web Worker pour ne pas bloquer le thread principal :

```
Main Thread          │  Web Worker
─────────────────────┼──────────────────
1. Upload fichier    │
2. Envoyer au worker ├──> 3. Lire fichier
                     │    4. Parser STL
                     │    5. Analyser géométrie
6. Recevoir résultat <──┘
7. Render 3D
```

### Cache IndexedDB

```typescript
// 1ère visite : Parse + Cache
const hash = await hashFile(file);
const geometry = await parseSTL(file);
await cache.set(hash, geometry);

// 2ème visite : Chargement instantané
const cached = await cache.get(hash);
if (cached) return cached; // ⚡ Instant !
```

---

## 🗄️ Base de Données (Supabase)

### Schéma Principal

```sql
profiles
├── id (uuid, PK)
├── email (text)
├── full_name (text)
├── role (enum: client | partner | admin)
└── created_at (timestamp)

quotes
├── id (uuid, PK)
├── client_id (uuid, FK → profiles)
├── part_name (text)
├── material (text)
├── quantity (int)
├── status (enum: open | awarded | closed)
└── ...

bids
├── id (uuid, PK)
├── quote_id (uuid, FK → quotes)
├── partner_id (uuid, FK → profiles)
├── price (decimal)
├── delivery_days (int)
└── ...
```

### Migrations

Les migrations sont versionnées et ordonnées :
- `001_initial_schema.sql` : Création des tables
- `002_rls_and_storage.sql` : Politiques RLS et buckets Storage

**Exécution** : Manuelle via Supabase Dashboard → SQL Editor

---

## 🎬 Flux de Données Principaux

### 1. Création de Devis

```
User Upload STL
    ↓
Web Worker Parse (non-bloquant)
    ↓
Geometry Analysis (volume, surface, DFM)
    ↓
Cache IndexedDB (pour réutilisation)
    ↓
3D Viewer (Three.js)
    ↓
User remplit formulaire
    ↓
Insert dans Supabase (quotes table)
    ↓
Toast Success + Redirect Dashboard
```

### 2. Affichage Dashboard Client

```
Page Load (/client)
    ↓
Middleware vérifie Auth
    ↓
Supabase Query (avec RLS)
    ↓
SELECT * FROM quotes WHERE client_id = auth.uid()
    ↓
Render QuoteList component
```

---

## 🔄 CI/CD

### GitHub → Vercel

```
1. git push origin main
2. GitHub webhook → Vercel
3. Vercel build (npm run build)
4. Deploy to production
5. URL: cnc-connect-algerie-1.vercel.app
```

### Environnements
- **Development** : Local (`localhost:3000`)
- **Preview** : Auto-deploy sur chaque PR
- **Production** : Branch `main`

---

## 🧩 Patterns & Best Practices

### Composants

```typescript
// ✅ BON : Props typées, composant client
'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Requêtes Supabase

```typescript
// ✅ BON : Gestion d'erreurs + types
export async function getClientQuotes(): Promise<Quote[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('client_id', (await supabase.auth.getUser()).data.user?.id);
  
  if (error) throw error;
  return data as Quote[];
}
```

### Error Handling

```typescript
// ✅ BON : Catch + Toast user-friendly
try {
  await createQuote(data);
  showToast('Devis créé avec succès !', 'success');
} catch (err) {
  const message = getUserFriendlyError(err);
  showToast(message, 'error');
}
```

---

## 📊 Diagrammes

### Diagramme de Séquence : Login

```
User       Next.js      Supabase
 │            │            │
 ├──Submit────>│            │
 │            ├──signIn────>│
 │            │<───JWT──────┤
 │            │            │
 │<─Redirect──┤            │
 │  /client   │            │
```

### Diagramme de Composants : Page Devis

```
/devis (page.tsx)
  ├─ CADUploader
  │   └─ Web Worker (STL Parser)
  ├─ Viewer3D (lazy loaded)
  │   ├─ Three.js Scene
  │   ├─ OrbitControls
  │   └─ DFM Analyzer
  └─ QuoteForm
      └─ Supabase Insert
```

---

## 🔮 Évolutions Futures

### Court Terme
- [ ] Tests automatisés (Jest + Playwright)
- [ ] Sentry pour error tracking
- [ ] Vercel Analytics

### Moyen Terme
- [ ] Support STEP/IGES (au-delà de STL)
- [ ] Chat temps réel (Supabase Realtime)
- [ ] Réseau d'ateliers avec carte

### Long Terme
- [ ] Mobile app (React Native)
- [ ] API publique pour partenaires
- [ ] Marketplace de services

---

**Document maintenu à jour par l'équipe Dev CNC Connect**
