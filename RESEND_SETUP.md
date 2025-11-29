# Guide de Configuration - Resend & Migration Notifications

## 🔑 Étape 1 : Créer un compte Resend et obtenir l'API Key

### 1.1 Créer le compte
1. Aller sur **https://resend.com**
2. Cliquer sur "Sign Up" (ou "Get Started")
3. S'inscrire avec votre email
4. Vérifier votre email

### 1.2 Obtenir l'API Key
1. Une fois connecté, aller dans **API Keys** (menu de gauche)
2. Cliquer sur "Create API Key"
3. Donner un nom : `cnc-connect-algerie-dev`
4. Permissions : **Full Access** (ou au minimum "Sending access")
5. Cliquer sur "Create"
6. **IMPORTANT** : Copier immédiatement la clé qui commence par `re_...`
   (Elle ne sera plus visible après !)

### 1.3 Configuration de l'email d'envoi

**Option A - Pour le développement (IMMÉDIAT) :**
Utiliser l'email de test de Resend :
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```
✅ Fonctionne immédiatement sans configuration
⚠️ Limite : Les emails n'arrivent qu'à votre email personnel

**Option B - Pour la production (RECOMMANDÉ) :**
1. Dans Resend, aller dans **Domains**
2. Cliquer sur "Add Domain"
3. Entrer votre domaine (ex: `cnc-connect-algerie.com`)
4. Suivre les instructions pour ajouter les enregistrements DNS
5. Une fois vérifié, utiliser :
```
RESEND_FROM_EMAIL=noreply@cnc-connect-algerie.com
```

---

## 📝 Étape 2 : Configurer les variables d'environnement localement

### 2.1 Créer/Modifier `.env.local`

Créez le fichier `.env.local` à la racine du projet avec ce contenu :

```env
# Supabase (déjà existant normalement)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# Resend (NOUVEAU)
RESEND_API_KEY=re_votre_cle_api_ici
RESEND_FROM_EMAIL=onboarding@resend.dev

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 Vérifier que le fichier est bien ignoré
```bash
# Le fichier .env.local doit être dans .gitignore
cat .gitignore | grep .env.local
```

Si absent, ajoutez-le à `.gitignore` :
```
.env*.local
```

---

## 🗄️ Étape 3 : Appliquer la migration dans Supabase

### Option A - Via Supabase Dashboard (RECOMMANDÉ)

1. **Aller sur Supabase Dashboard**
   - https://app.supabase.com
   - Sélectionner votre projet

2. **Ouvrir SQL Editor**
   - Menu de gauche : **SQL Editor**
   - Cliquer sur "New query"

3. **Copier le contenu de la migration**
   - Ouvrir le fichier : `supabase/migrations/004_notifications.sql`
   - Copier TOUT le contenu

4. **Exécuter la migration**
   - Coller le SQL dans l'éditeur
   - Cliquer sur "Run" (ou F5)
   - ✅ Vérifier qu'il n'y a pas d'erreurs

5. **Vérifier que la table est créée**
   - Menu de gauche : **Table Editor**
   - Chercher la table `notifications`
   - Vérifier les colonnes : id, user_id, type, title, message, link, is_read, created_at, metadata

### Option B - Via CLI Supabase (si installé)

```bash
# Si vous avez Supabase CLI installé
supabase db push

# Ou appliquer manuellement
supabase db execute --file supabase/migrations/004_notifications.sql
```

---

## ✅ Étape 4 : Tester la configuration

### 4.1 Redémarrer Next.js
```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
npm run dev
```

### 4.2 Test simple
Créez un fichier de test `test-notification.ts` (temporaire) :

```typescript
import { notifyNewBid } from '@/lib/notifications/send';

// Test
await notifyNewBid({
  clientId: 'uuid-du-client',
  clientEmail: 'votre-email@example.com',
  clientName: 'Test User',
  partName: 'Pièce Test',
  partnerName: 'Atelier Test',
  bidAmount: 50000,
  quoteId: 'uuid-du-quote'
});
```

Ou testez directement en soumettant une offre dans l'application.

---

## 🚀 Étape 5 : Configurer pour la production (Vercel)

### 5.1 Ajouter les variables sur Vercel

1. Aller sur **https://vercel.com**
2. Sélectionner votre projet `cnc-connect-algerie`
3. Aller dans **Settings > Environment Variables**
4. Ajouter ces 2 variables :

| Name                  | Value                          | Environments          |
|-----------------------|--------------------------------|-----------------------|
| `RESEND_API_KEY`      | `re_votre_cle_api_ici`         | Production, Preview   |
| `RESEND_FROM_EMAIL`   | `onboarding@resend.dev`        | Production, Preview   |

5. Cliquer sur "Save"

### 5.2 Redéployer
```bash
git add .env.local.example  # Si vous créez un fichier exemple
git commit -m "docs: add resend configuration guide"
git push
```

Vercel redéploiera automatiquement avec les nouvelles variables.

---

## 🔍 Dépannage

### Problème : "RESEND_API_KEY not configured"
✅ Vérifier que `.env.local` existe et contient la clé
✅ Redémarrer le serveur Next.js
✅ Vérifier qu'il n'y a pas d'espace avant/après la clé

### Problème : Emails non reçus
✅ Vérifier les logs Resend : https://resend.com/emails
✅ Vérifier le dossier spam
✅ Si vous utilisez `onboarding@resend.dev`, les emails n'arrivent qu'à votre email de compte Resend

### Problème : Migration échoue
✅ Vérifier que vous êtes connecté au bon projet Supabase
✅ Vérifier qu'il n'y a pas d'erreur de syntaxe SQL
✅ Essayer d'exécuter les commandes une par une

---

## 📋 Checklist Finale

- [ ] Compte Resend créé
- [ ] API Key obtenue et copiée
- [ ] Fichier `.env.local` créé avec les 2 variables Resend
- [ ] Migration `004_notifications.sql` appliquée dans Supabase
- [ ] Table `notifications` visible dans Supabase Table Editor
- [ ] Serveur Next.js redémarré
- [ ] Variables ajoutées sur Vercel (pour production)
- [ ] Test d'une notification réussie

---

**Besoin d'aide ?** Faites-moi savoir où vous bloquez ! 🚀
