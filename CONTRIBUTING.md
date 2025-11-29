# Guide de Contribution - CNC Connect Algérie

Merci de votre intérêt pour contribuer à **CNC Connect Algérie** ! Ce document vous guidera à travers le processus de contribution.

---

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Structure des Commits](#structure-des-commits)

---

## 🤝 Code de Conduite

Nous attendons de tous les contributeurs qu'ils :
- Soient respectueux et professionnels
- Acceptent les critiques constructives
- Se concentrent sur ce qui est meilleur pour la communauté
- Fassent preuve d'empathie envers les autres membres

---

## 💡 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les Issues
2. Créez une nouvelle Issue avec le label `bug`
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version)

### Suggérer une Fonctionnalité

1. Créez une Issue avec le label `enhancement`
2. Décrivez clairement :
   - Le problème que cela résout
   - La solution proposée
   - Les alternatives considérées

### Soumettre du Code

1. **Fork** le repository
2. **Créez une branche** depuis `main` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. **Développez** votre fonctionnalité
4. **Committez** en suivant les [conventions](#structure-des-commits)
5. **Push** vers votre fork
6. **Ouvrez une Pull Request**

---

## 📝 Standards de Code

### TypeScript

- **Types explicites** : Évitez `any`, utilisez des types stricts
- **Naming** :
  - Components : `PascalCase` (ex: `QuoteForm.tsx`)
  - Fonctions/Variables : `camelCase` (ex: `getUserProfile`)
  - Constants : `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- **Commentaires** : Documentez la logique complexe

### React

- **Components fonctionnels** obligatoires
- **Hooks** : Préférez les hooks aux classes
- **Props** : Définissez toujours les types d'interface
- **State** : Utilisez `useState` et `useEffect` correctement

### CSS (Tailwind)

- **Classes utilitaires** en priorité
- **Responsive** : Mobile-first (`sm:`, `md:`, `lg:`)
- **Consistency** : Utilisez les tokens du design system

### Supabase

- **RLS** : Toutes les nouvelles tables doivent avoir des politiques RLS
- **Migrations** : Numérotez les migrations (`00X_description.sql`)
- **Requêtes** : Utilisez les fonctions dans `lib/queries/`

---

## 🔄 Processus de Pull Request

### Checklist Pre-PR

Avant de soumettre votre PR, vérifiez que :

- [ ] Le code build sans erreurs (`npm run build`)
- [ ] Les types TypeScript sont corrects (`npm run type-check`)
- [ ] Le linting passe (`npm run lint`)
- [ ] Vous avez testé manuellement les changements
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les commits suivent les conventions

### Template de PR

```markdown
## Description
Brève description des changements

## Type de Changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment Tester
1. Étape 1
2. Étape 2

## Screenshots (si UI)
[Ajouter des captures d'écran]

## Checklist
- [ ] Code testé localement
- [ ] Documentation mise à jour
- [ ] Pas de warnings
```

### Review Process

1. **Auto-checks** : Les GitHub Actions doivent passer (build, lint)
2. **Code Review** : Au moins 1 approbation requise
3. **Testing** : Vérification manuelle par un mainteneur
4. **Merge** : Squash and merge par défaut

---

## 📦 Structure des Commits

Nous utilisons **Conventional Commits** :

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation seulement
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring de code
- `perf`: Amélioration de performance
- `test`: Ajout ou correction de tests
- `chore`: Maintenance, dépendances, etc.

### Exemples

```bash
# Fonctionnalité
feat(devis): add STL file validation on upload

# Bug fix
fix(auth): resolve login redirect loop issue

# Documentation
docs(readme): update installation instructions

# Performance
perf(3d): implement lazy loading for Viewer3D component
```

---

## 🏗️ Architecture & Conventions

### Ajout d'une Nouvelle Page

1. Créez le fichier dans `app/ma-page/page.tsx`
2. Ajoutez la route dans le Header si nécessaire
3. Protégez la route avec middleware si besoin d'auth

### Ajout d'un Composant UI

1. Créez dans `components/ui/MonComposant.tsx`
2. Exportez comme composant réutilisable
3. Documentez les props avec JSDoc

### Ajout d'une Requête Supabase

1. Créez ou modifiez un fichier dans `lib/queries/`
2. Utilisez les types générés par Supabase
3. Gérez les erreurs avec `try/catch` et `getUserFriendlyError`

---

## 🧪 Tests

### Tests Manuels

Pour chaque PR, testez :
- Le flow complet de votre fonctionnalité
- Les cas limites (erreurs, valeurs vides, etc.)
- La responsiveness mobile

### Tests Automatisés (Future)

Nous prévoyons d'ajouter :
- Tests unitaires (Jest)
- Tests d'intégration (Playwright)
- Tests E2E (Cypress)

---

## 🚀 Déploiement

### Environnements

- **Development** : Local (`localhost:3000`)
- **Preview** : Vercel preview deployments (automatique sur chaque PR)
- **Production** : Vercel production (`main` branch)

### Variables d'Environnement

Ne committez **jamais** de secrets. Utilisez :
- `.env.local` pour le développement local
- Vercel Dashboard pour la production

---

## 📞 Questions ?

- **Issues GitHub** : Pour les bugs et fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : dev@cncconnect.dz (pour les questions privées)

---

**Merci de contribuer à CNC Connect Algérie ! 🚀**
