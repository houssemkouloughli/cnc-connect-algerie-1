# Structure du Projet - CNC Connect Algérie

## Vue d'ensemble

Ce projet suit les meilleures pratiques **Next.js App Router** avec une organisation par **fonctionnalités** (feature-based) pour une meilleure maintenabilité et scalabilité.

## Architecture

```
cnc-connect-algerie/
├── app/                          # Next.js App Router
│   ├── devis/                    # Page de devis
│   ├── globals.css               # Styles globaux
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Page d'accueil
│
├── components/                   # Composants réutilisables
│   ├── layout/                   # Composants de mise en page
│   │   ├── Header.tsx           # En-tête avec navigation
│   │   └── BottomNav.tsx        # Navigation mobile
│   └── shared/                   # Composants partagés
│       └── FeatureCard.tsx      # Carte de fonctionnalité
│
├── features/                     # Fonctionnalités par domaine
│   ├── analysis/                 # Analyse 3D et DFM
│   │   ├── components/
│   │   │   └── DFMAnalysis.tsx  # Affichage analyse DFM
│   │   ├── services/
│   │   │   └── analysis-3d.service.ts  # Logique d'analyse
│   │   └── types/
│   │       └── analysis.types.ts       # Types TypeScript
│   │
│   └── devis/                    # Système de devis
│       └── components/
│           └── Viewer3D.tsx     # Visualiseur 3D Three.js
│
├── lib/                          # Utilitaires et configuration
│   └── config/
│       └── supabase.ts          # Configuration Supabase
│
├── types/                        # Types TypeScript globaux
│
└── public/                       # Assets statiques
```

## Principes d'Organisation

### 1. **Features** (Fonctionnalités)
Chaque fonctionnalité métier a son propre dossier dans `features/` :
- **Components** : Composants spécifiques à la feature
- **Services** : Logique métier et appels API
- **Types** : Types TypeScript pour la feature
- **Hooks** : Hooks React personnalisés (si nécessaire)

**Exemple** : `features/analysis/` contient tout ce qui concerne l'analyse 3D et DFM.

### 2. **Components** (Composants génériques)
Composants réutilisables dans tout le projet :
- `layout/` : En-tête, navigation, footer
- `shared/` : Composants partagés (cards, buttons, etc.)
- `ui/` : Composants UI atomiques (futurs)

### 3. **App Router** (Next.js)
- Routes et pages de l'application
- Layouts spécifiques par route
- Styles globaux

### 4. **Lib** (Bibliothèque)
- `config/` : Fichiers de configuration (Supabase, etc.)
- `utils/` : Fonctions utilitaires (formatage, validation)
- `hooks/` : Hooks globaux réutilisables

## Imports avec Alias TypeScript

Le projet utilise des alias configurés dans `tsconfig.json` :

```typescript
// ✅ Bon
import Header from '@/components/layout/Header';
import { parseSTLFile } from '@/features/analysis/services/analysis-3d.service';
import type { GeometryData } from '@/features/analysis/types/analysis.types';

// ❌ À éviter
import Header from '../../../components/layout/Header';
```

## Conventions de Nommage

### Fichiers
- **Composants React** : PascalCase (`Header.tsx`, `FeatureCard.tsx`)
- **Services** : kebab-case avec `.service.ts` (`analysis-3d.service.ts`)
- **Types** : kebab-case avec `.types.ts` (`analysis.types.ts`)
- **Utilitaires** : kebab-case (`format-date.ts`)

### Dossiers
- kebab-case pour tout (`components`, `features`, `analysis`)

## Ajout de Nouvelles Fonctionnalités

Pour ajouter une nouvelle feature (exemple : `workshops`) :

1. **Créer la structure** :
```bash
mkdir -p features/workshops/{components,services,types,hooks}
```

2. **Créer les types** :
```typescript
// features/workshops/types/workshop.types.ts
export type Workshop = {
  id: string;
  name: string;
  location: string;
  // ...
};
```

3. **Créer le service** :
```typescript
// features/workshops/services/workshop.service.ts
import type { Workshop } from '../types/workshop.types';

export async function fetchWorkshops(): Promise<Workshop[]> {
  // Logique métier
}
```

4. **Créer les composants** :
```typescript
// features/workshops/components/WorkshopCard.tsx
import type { Workshop } from '../types/workshop.types';

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  // ...
}
```

5. **Utiliser dans une page** :
```typescript
// app/reseau/page.tsx
import WorkshopCard from '@/features/workshops/components/WorkshopCard';
```

## Avantages de cette Structure

✅ **Scalabilité** : Facile d'ajouter de nouvelles features sans toucher aux autres  
✅ **Maintenabilité** : Code organisé et facile à trouver  
✅ **Réutilisabilité** : Composants et services bien séparés  
✅ **Collaboration** : Plusieurs développeurs peuvent travailler sur des features différentes  
✅ **Tests** : Structure claire facilite les tests unitaires  

## Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Feature-Based Architecture](https://feature-sliced.design/)
