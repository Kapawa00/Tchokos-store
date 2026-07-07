// Service Worker Tchokos SARL.
// Deux rôles :
//   1) Cache léger de la coquille (offline de courtoisie, chargements rapides).
//   2) Réception et affichage des notifications push, gestion du clic.
// Enregistré globalement par components/pwa/ServiceWorkerRegistrar.js.

// ⚠️ Incrémenter cette version à chaque changement de la stratégie de cache
// pour forcer le nettoyage des anciens caches à l'activation.
const CACHE_VERSION = "tchokos-v2";
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

// Ressources statiques de base précachées à l'installation.
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

/* ------------------------------- Installation ---------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      // `reload` pour ignorer le cache HTTP du navigateur lors du précache.
      .then((cache) => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: "reload" }))))
      // Active le nouveau SW sans attendre la fermeture des onglets.
      .then(() => self.skipWaiting())
      .catch(() => {}) // Un asset manquant ne doit pas bloquer l'installation.
  );
});

/* -------------------------------- Activation ----------------------------- */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k)) // Purge des anciennes versions.
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------------------------------- Fetch -------------------------------- */
// Stratégie volontairement légère :
//   - Navigations (pages HTML) : réseau d'abord, repli cache puis « / » hors ligne.
//   - Assets statiques Next (/_next/static, images, polices) : cache d'abord.
//   - Le reste (API, POST, cross-origin) : laissé au réseau sans interception.

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    console.log("[DEBUG sw.js] intercepte la navigation vers", request.url);
  }
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Pas de cache cross-origin.

  // Ne jamais mettre l'API en cache (données fraîches, auth).
  if (url.pathname.startsWith("/api/")) return;

  // Ne jamais intercepter /compte, /admin ou les routes Filament proxifiées :
  // le pont SSO admin et le proxy Filament redirigent volontairement vers une
  // autre origine (localhost:8000). Un `fetch()` de Service Worker suit ces
  // redirections en interne et renvoie la réponse finale sous l'URL de
  // départ — la barre d'adresse n'est jamais mise à jour, ce qui produit un
  // décalage d'origine invisible (page bloquée en chargement). On laisse
  // le navigateur gérer nativement ces navigations, sans passer par le SW.
  if (
    url.pathname.startsWith("/compte") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/livewire") ||
    url.pathname.startsWith("/filament") ||
    url.pathname.startsWith("/js/filament") ||
    url.pathname.startsWith("/css/filament")
  ) {
    console.log("[DEBUG sw.js] bypass volontaire (auth/admin) pour", url.pathname);
    return;
  }

  // Pages : réseau d'abord.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")))
    );
    return;
  }

  // Assets statiques : cache d'abord, complété au fil de l'eau.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|webp|svg|ico|gif)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
  }
});

/* --------------------------- Notifications push -------------------------- */

self.addEventListener("push", (event) => {
  // Charge utile attendue (JSON) : { title, body, url, tag }.
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Tchokos SARL";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || undefined, // Regroupe/actualise les notifs de même sujet.
    data: { url: data.url || "/" },
    requireInteraction: false,
    lang: "fr",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  const targetUrl = new URL(target, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Réutilise un onglet déjà ouvert sur l'URL cible, sinon en ouvre un.
      const existing = list.find((c) => c.url === targetUrl && "focus" in c);
      if (existing) return existing.focus();
      const anyClient = list.find((c) => "focus" in c);
      if (anyClient && "navigate" in anyClient) {
        return anyClient.focus().then(() => anyClient.navigate(targetUrl));
      }
      return clients.openWindow(targetUrl);
    })
  );
});
