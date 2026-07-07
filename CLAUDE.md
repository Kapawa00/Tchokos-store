# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tchokos SARL — Contexte projet

Contexte permanent pour Claude Code. Boutique e-commerce de **Tchokos SARL**, grossiste-détaillant
de chaussures et accessoires à Akwa, Douala (Cameroun). Slogan : « C'est difficile, mais possible ».

## Produits
- **Chaussures** (rayons Hommes / Femmes / Enfants), **Sacs**, **Ceintures**, **Montres**.
- Chaque produit a des **variantes** (pointure, couleur), un **prix détail ET un prix grossiste**,
  un **stock par variante**, et des **médias** (vidéos + images).
- Particularité : le client a surtout des **vidéos (reels)** et peu de photos isolées. Les vidéos
  doivent être mises en avant. Les images produit suivent un **format portrait 4:5 uniforme** sur
  fond clair.

## Canaux de commande
Trois canaux complémentaires. Le panier crée une « commande » finalisée par l'un d'eux :
- **WhatsApp** (principal) : via `wa.me` vers le numéro du service client.
- **E-mail**.
- **Notifications push**.

## Paiement
Pas de carte bancaire internationale. Trois moyens :
- **Orange Money**, **Mobile Money (MTN MoMo)** : via API opérateur / agrégateur.
- **WhatsApp** (paiement assisté) : le client paie le numéro marchand puis envoie la preuve,
  l'admin valide. Toute confirmation se fait **côté serveur** (webhook signé), jamais côté client.

## Stack technique
- **Backend** : Laravel 11, PHP 8.2+, MySQL, Laravel Sanctum (auth par jeton Bearer), Filament 3
  (back-office sur `/admin`), files d'attente (queues) pour e-mails et push.
- **Frontend** : Next.js 16 (App Router) + **JavaScript** (pas de TypeScript) + Tailwind CSS 4.
  Mobile-first, PWA (installable + Service Worker pour le push). Rendu SSR/SSG/ISR pour le SEO.
- **Dépôt** : deux dossiers à la racine, `backend/` et `frontend/`.

## Charte graphique « Cuir & Crème »
Luxe sobre, couleurs désaturées (douces à l'œil).

| Token     | Hex       | Usage |
|-----------|-----------|-------|
| cream     | `#F6F1E9` | fond principal |
| offwhite  | `#FCFAF6` | cartes |
| espresso  | `#2A211B` | titres, texte, bouton principal |
| taupe     | `#6E6258` | texte secondaire, légendes |
| cognac    | `#9C6B3F` | marque : liens, accents, survol des boutons |
| camel     | `#C89B6A` | survols, bordures actives |
| brass     | `#B89A5E` | filets fins, icônes, badge premium |
| bordeaux  | `#7A3B3B` | promos, prix barrés |
| sage      | `#5B6B57` | succès, « en stock » |
| sand      | `#E5DCCD` | séparateurs, bordures |

- **Polices** : titres = Playfair Display (serif) ; texte = Jost (sans-serif).
- **Boutons** : coins 4px, padding 14px/28px. Principal = fond espresso / texte crème, survol cognac.
  Secondaire = bordure cognac / texte espresso.
- **Mise en page** : espacement par pas de 8px. Grille produit : 2 colonnes mobile / 3 tablette /
  4 ordinateur, gouttière 24px. Cartes de hauteurs égales, prix alignés en bas.

## Conventions de travail
- Code propre, clair, commenté en français quand utile. **JavaScript** côté frontend (pas de
  TypeScript) ; documenter les structures de données avec des **typedefs JSDoc** si utile.
- Respecter l'**architecture découplée** (frontend ↔ API REST). Ne pas casser ce qui marche déjà.
- À chaque étape : expliquer brièvement, créer/éditer les fichiers, donner la commande de
  vérification.
- **Secrets** (numéro WhatsApp, clés de paiement, VAPID, SMTP) : jamais en dur dans le code,
  toujours dans `.env`. Me les demander au lieu de les inventer.

## À confirmer / valeurs à fournir
- Numéro WhatsApp du service client (format international, ex. `2376XXXXXXXX`).
- Prestataire de paiement (agrégateur Orange Money + MoMo, ou API opérateur direct).
- Libellé exact de la catégorie « Ceintures » (interprétée à partir de « coêtes »).

## Commandes

### Backend (`backend/`, Laravel)
```bash
composer install
php artisan migrate            # applique les migrations (DB configurée dans .env)
php artisan serve               # démarre l'API sur http://localhost:8000
php artisan webpush:vapid-keys  # génère VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
php artisan test                                     # toute la suite (PHPUnit)
php artisan test --filter=CartTest                   # un fichier de test
php artisan test tests/Feature/Shop/OrderTest.php    # par chemin
vendor/bin/pint                 # formatage du code (Laravel Pint)
```
Les tests tournent en SQLite mémoire (`phpunit.xml`) : pas besoin de MySQL pour `php artisan test`.
`FrontendRevalidator` (webhooks/notifs) est court-circuité en environnement `testing`.

### Frontend (`frontend/`, Next.js)
```bash
npm install
npm run dev      # http://localhost:3000 — proxy vers /admin, /livewire, /filament (backend:8000)
npm run build
npm run lint
```
Aucun script de test n'est configuré côté frontend.

### Lancer les deux ensemble
Démarrer `php artisan serve` (backend, port 8000) et `npm run dev` (frontend, port 3000) dans deux
terminaux séparés. Le frontend proxifie `/admin`, `/livewire` et les assets Filament vers le
backend (voir `frontend/next.config.mjs`), donc le back-office est accessible via
`http://localhost:3000/admin` en plus de `http://localhost:8000/admin`.

## Architecture backend (Laravel)

- **Rôles utilisateur** (`app/Enums/UserRole.php`) : distinguent client / grossiste / admin /
  manager. Le middleware `role:admin,manager` (alias → `EnsureUserHasRole`) protège les routes
  `/api/admin/*`.
- **Auth optionnelle** : la plupart des routes catalogue/panier/commande passent par le middleware
  `auth.optional` (alias → `AuthenticateOptionally`) : un jeton Sanctum est accepté s'il est
  présent, mais n'est jamais requis. Un invité est identifié par un `session_token` (en-tête
  `X-Session-Token` ou champ `session_token`), résolu côté serveur par `App\Services\CartResolver`
  (`firstOrCreate` sur `user_id` ou `session_token`).
- **Paiement** (`app/Payments/`) : interface `PaymentProvider` (méthodes `initiate`,
  `verifySignature`, `handleCallback`) implémentée par `OrangeMoneyProvider`, `MtnMomoProvider` et
  `SandboxPaymentProvider` (mode simulé actif tant qu'aucune clé opérateur n'est renseignée dans
  `.env`). `PaymentProviderManager::resolve()`/`resolveBySlug()` sélectionne le provider ; le canal
  **WhatsApp** n'a pas de provider, il passe par `PaymentController::whatsappProof` (preuve
  envoyée par le client, validation manuelle admin). **Toute confirmation de paiement passe par le
  webhook signé** (`POST /payments/webhook/{provider}`), jamais par une donnée envoyée par le
  client.
- **Commandes** : `Order::generateReference()` génère une référence `TCK-{année}-{séquence}`
  remise à zéro chaque année. `Order::status` (enum `OrderStatus`) pilote le cycle de vie
  (`pending_payment` → `paid` → `preparing` → `shipped` → `delivered`, ou `cancelled`).
- **Synchronisation avec le frontend** : `App\Services\FrontendRevalidator` notifie
  `frontend/app/api/revalidate` (secret partagé `REVALIDATE_SECRET`) pour invalider immédiatement
  le cache ISR Next.js (tags `categories`, `products`, `product:{slug}`, `reels`, `banners`) quand
  l'admin Filament modifie un produit/catégorie/média/promo/bannière. Sans ça, le changement peut
  mettre jusqu'à 1h à apparaître (durées de revalidation dans `frontend/lib/catalog.js`). Ce
  service est désactivé en environnement `testing`.
- **Notifications** : événements (`OrderCreated`, `OrderStatusUpdated`, `ProductBackInStock`) →
  listeners (`app/Listeners/`) → e-mail (`app/Notifications/`) et/ou push web (`PushNotifier`,
  VAPID). Les deux passent par les queues (`QUEUE_CONNECTION=database`).
- **Back-office Filament** (`/admin`) : ressources dans `app/Filament/Resources/` (Produits,
  Catégories, Commandes, Promotions, Bannières, Médias, Reels, Comptes grossiste, Utilisateurs) et
  widgets de dashboard dans `app/Filament/Widgets/`.

## Architecture frontend (Next.js)

- **Couche d'accès aux données** (`lib/`) : `lib/http.js` contient `apiFetch`, le wrapper `fetch`
  isomorphe central (URL de base `NEXT_PUBLIC_API_URL`, jeton Bearer, `X-Session-Token` invité,
  cache/revalidation Next, erreurs structurées `ApiError` avec support de la validation 422
  Laravel). `lib/api.js` est le point d'entrée **client-safe** qui ré-exporte les fonctions par
  domaine (`lib/catalog.js`, `lib/cart.js`, `lib/orders.js`, `lib/auth.js`, `lib/account.js`...).
  `lib/api.server.js` (marqué `server-only`) est la variante pour Server Components/Actions : elle
  injecte le jeton lu depuis `next/headers` — **ne jamais l'importer depuis un composant client**.
- **Catalogue en SSR/ISR** : les fonctions de `lib/catalog.js` utilisent `revalidate` + `tags`
  (ex. `products` → 300s, `categories` → 3600s) pour rester cacheables côté SEO, avec repli sur une
  liste vide si l'API est indisponible. L'invalidation immédiate passe par
  `app/api/revalidate/route.js`, appelé par le backend (`FrontendRevalidator`).
- **Auth des routes `/compte`** : gérée par `proxy.js` (Edge Middleware Next.js 16, renommé depuis
  `middleware.js`) sur la présence du cookie `tchokos_token` — redirige vers
  `/compte/connexion?redirect=...` si absent, ou loin des pages de connexion/inscription si déjà
  connecté.
- **Proxy vers le back-office** : `next.config.mjs` réécrit `/admin`, `/livewire`, `/filament`,
  `/js/filament`, `/css/filament` vers le backend Laravel (port 8000 en dev), pour que Filament
  reste accessible sur le même port que le site public.
- **Découpage par domaine** : `app/` (routes App Router en français : `boutique`, `produit`,
  `panier`, `commande`, `compte`, `vente-en-gros`...) consomme des composants organisés par domaine
  dans `components/` (`account/`, `cart/`, `catalog/`, `checkout/`, `home/`, `payment/`, `product/`,
  `layout/`, `pwa/`, `ui/`). `components/ui/` contient les primitives génériques (Button, Card,
  Modal, Select...) réutilisées par les composants de domaine.
- **PWA** : `app/manifest.js` + service worker (`components/pwa/ServiceWorkerRegistrar.js`) pour
  l'installation et le push web.
