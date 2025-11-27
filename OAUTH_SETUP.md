# Configuration OAuth pour CNC Connect

## 📋 Vue d'ensemble
Cette guide explique comment configurer l'authentification OAuth avec Google et GitHub via Supabase.

## 🔧 Configuration Supabase OAuth

### 1️⃣ Accès aux paramètres OAuth
1. Allez dans le [Dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez à: **Authentication** → **Providers**

### 2️⃣ Configuration Google OAuth

#### A. Créer un projet Google Cloud
1. Accédez à [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Allez à **APIs & Services** → **Credentials**
4. Cliquez sur **Create Credentials** → **OAuth 2.0 Client ID**
5. Sélectionnez **Web application**
6. Ajoutez les URIs autorisés:
   - **Authorized redirect URIs:**
     ```
     https://YOUR_SUPABASE_URL.supabase.co/auth/v1/callback?provider=google
     ```

#### B. Récupérer les credentials
- Copier **Client ID** et **Client Secret**

#### C. Configurer dans Supabase
1. Allez à **Authentication** → **Providers** → **Google**
2. Activez le provider
3. Entrez:
   - **Client ID**: Collez le Client ID Google
   - **Client Secret**: Collez le Client Secret Google
4. Cliquez **Save**

### 3️⃣ Configuration GitHub OAuth

#### A. Créer une OAuth App GitHub
1. Allez à [GitHub Settings → Developer settings](https://github.com/settings/developers)
2. Cliquez **New OAuth App**
3. Remplissez les champs:
   - **Application name**: CNC Connect
   - **Homepage URL**: 
     ```
     https://YOUR_DOMAIN.com
     ```
   - **Authorization callback URL**:
     ```
     https://YOUR_SUPABASE_URL.supabase.co/auth/v1/callback?provider=github
     ```

#### B. Récupérer les credentials
- Copier **Client ID** et générer **Client Secret**

#### C. Configurer dans Supabase
1. Allez à **Authentication** → **Providers** → **GitHub**
2. Activez le provider
3. Entrez:
   - **Client ID**: Collez le Client ID GitHub
   - **Client Secret**: Collez le Client Secret GitHub
4. Cliquez **Save**

## 📍 Trouver votre URL Supabase

1. Allez dans **Settings** → **API**
2. Cherchez **Project URL**
3. Utilisez ce format:
   ```
   https://YOUR_PROJECT_REF.supabase.co
   ```

## ✅ Configuration Locale (Développement)

Pour le développement local, utilisez:
```
http://localhost:3000/auth/callback
```

Ajoutez cette URI dans:
- Google Cloud Console
- GitHub OAuth App

## 🚀 Test de la fonctionnalité

1. Démarrez l'application:
   ```bash
   npm run dev
   ```

2. Allez à `/login` ou `/signup`
3. Cliquez sur **Connexion Google** ou **Connexion GitHub**
4. Autorisez l'accès
5. Vous devriez être redirigé vers le dashboard

## 🔐 Flux d'authentification

```
Utilisateur clique "Google Login"
         ↓
Redirigé vers Google OAuth
         ↓
L'utilisateur se connecte/autorise
         ↓
Google redirige vers /auth/callback avec le code
         ↓
Supabase échange le code pour un token
         ↓
Utilisateur créé dans Supabase
         ↓
Profil créé automatiquement
         ↓
Redirigé vers le dashboard
```

## 🐛 Troubleshooting

### "Invalid redirect URI"
- Vérifiez que l'URI est exactement comme configuré chez le provider
- Assurez-vous d'inclure `?provider=google` ou `?provider=github`

### "OAuth app not found"
- Vérifiez le Client ID dans Supabase
- Assurez-vous que le provider est activé

### Profil non créé après OAuth
- Vérifiez les RLS policies sur la table `profiles`
- La politique INSERT doit permettre aux utilisateurs de créer leur profil

## 📝 Variables d'environnement requises

Dans `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 🎯 Prochaines étapes

1. ✅ Configurer Google OAuth
2. ✅ Configurer GitHub OAuth
3. ✅ Tester la connexion
4. 📱 (Optionnel) Ajouter d'autres providers (Discord, Microsoft, etc.)

## 📚 Ressources

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/oauth2)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/oauth2#google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/oauth2#github)
