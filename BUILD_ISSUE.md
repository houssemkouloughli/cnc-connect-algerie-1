# 🐛 Problème de Build - Next.js 16 + Turbopack

## Description du Problème

Le projet rencontre une erreur lors du build production avec Next.js 16.0.4. L'erreur provient d'un bug connu dans **Turbopack** (le nouveau bundler de Next.js) lorsqu'il est utilisé avec des middlewares Auth complexes comme ceux de Supabase.

```
Error: Call retries were exceeded
⚠ The "middleware" file convention is deprecated.
```

## Analyse

- **Version actuelle** : Next.js 16.0.4 avec Turbopack par défaut
- **Problème** : Turbopack ne compile pas correctement `middleware.ts` avec les appels async à Supabase
- **Fichiers concernés** : `middleware.ts` (ligne 36-50 - appels Supabase auth)

## Solutions Disponibles

### ✅ Solution 1 : Downgrade Next.js vers 15.x (RECOMMANDÉ)

Next.js 15.x est stable et ne force pas Turbopack.

**Étapes** :
```bash
# Modifier package.json
npm install next@15.0.3 --save

# Rebuild
npm run build
```

**Avantages** :
- ✅ Solution la plus rapide
- ✅ Stable et éprouvée
- ✅ Compatible avec middleware Supabase
- ✅ Pas de modifications de code nécessaires

**Inconvénients** :
- ⚠ Perd les nouvelles features de Next.js 16

---

### ✅ Solution 2 : Simplified Middleware (Compatible Next.js 16)

Simplifier le middleware pour éviter les appels database dans le middleware lui-même.

**Étapes** :

1. **Modifier `middleware.ts`** pour ne gérer que l'authentification de base :

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // Protection simple sans récupérer le role (le role sera vérifié dans les pages)
    const protectedRoutes = ['/admin', '/partner', '/dashboard', '/client'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));
    
    if (isProtected && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect des users connectés
    if ((path === '/login' || path === '/signup') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/partner/:path*',
        '/dashboard/:path*',
        '/client/:path*',
        '/login',
        '/signup',
    ],
};
```

2. **Déplacer la vérification du role dans les layouts** de chaque section (`app/admin/layout.tsx`, `app/partner/layout.tsx`, etc.)

**Avantages** :
- ✅ Compatible avec Turbopack/Next.js 16
- ✅ Middleware plus simple et rapide
- ✅ Meilleure séparation des préoccupations

**Inconvénients** :
- ⚠ Nécessite des modifications de code
- ⚠ Vérification du role déportée aux layouts

---

### ✅ Solution 3 : Deploy vers Vercel (Bypass le problème)

Vercel utilise sa propre infrastructure de build qui peut bypasser certains bugs de Turbopack.

**Étapes** :
```bash
# Deploy directement sur Vercel
vercel --prod

# OU via GitHub
git push origin main
# (avec auto-deploy activé)
```

**Avantages** :
- ✅ Peut fonctionner même si le build local échoue
- ✅ Vercel a des fixes spécifiques
- ✅ Aucune modification nécessaire

**Inconvénients** :
- ⚠ Dépendance à l'infrastructure Vercel
- ⚠ Peut échouer aussi

---

### ✅ Solution 4 : Attendre le Fix Next.js 16 

Attendre une mise à jour de Next.js qui corrige ce bug.

**Surveillance** :
- GitHub Issues: https://github.com/vercel/next.js/issues
- Releases: https://github.com/vercel/next.js/releases

## Recommandation Finale

**Pour un déploiement immédiat** : Utiliser **Solution 1** (Downgrade Next.js 15.x)

**Pour un déploiement à long terme** : **Solution 2** (Simplifier middleware) + upgrade vers Next.js 16+ lorsque stable

## Commandes de Déploiement (Solution 1)

```bash
# 1. Downgrade Next.js
npm install next@15.0.3 --save

# 2. Rebuild
npm run build

# 3. Test local
npm run start

# 4. Deploy sur Vercel
vercel --prod
```

## Ressources

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Turbopack Documentation](https://turbo.build/pack/docs)
- [Supabase Auth Middleware](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Dernière mise à jour** : 27/11/2025
**Statut** : Bug confirmé dans Next.js 16.0.4 avec Turbopack + async middleware
