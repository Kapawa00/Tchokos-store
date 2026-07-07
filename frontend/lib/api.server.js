import "server-only";

// Variante SERVEUR de la couche d'accès : injecte le jeton Sanctum et le jeton
// de session lus depuis les cookies de la requête (next/headers) dans les
// appels API. À utiliser dans les Server Components (RSC), Server Actions et
// Route Handlers pour les ressources authentifiées (profil, commandes, panier).
// Les ressources PUBLIQUES du catalogue (catégories, produits, recherche)
// n'ont pas besoin de ce module : elles s'appellent directement via lib/catalog
// et restent ainsi cacheables (SSG/ISR) pour le SEO.

import { apiFetch } from "@/lib/http";
import {
  getServerToken,
  getServerSessionToken,
} from "@/lib/auth/cookies.server";

export {
  setServerToken,
  clearServerToken,
  getServerToken,
} from "@/lib/auth/cookies.server";

/**
 * Appel API authentifié côté serveur : jeton + session injectés depuis les
 * cookies de la requête courante.
 * @param {string} path
 * @param {import("@/lib/http").ApiFetchOptions} [options]
 * @returns {Promise<any>}
 */
export async function serverFetch(path, options = {}) {
  const [token, sessionToken] = await Promise.all([
    getServerToken(),
    getServerSessionToken(),
  ]);
  return apiFetch(path, { token, sessionToken, ...options });
}

/**
 * Profil complet de l'utilisateur connecté (RSC) — inclut le droit grossiste.
 * @returns {Promise<{ user: import("@/lib/types").User, can_view_wholesale_price: boolean }|null>}
 */
export async function getServerMe() {
  const token = await getServerToken();
  console.log("[DEBUG getServerMe] token présent ?", Boolean(token));
  if (!token) return null;
  try {
    const data = await serverFetch("/me", { cache: "no-store" });
    console.log("[DEBUG getServerMe] OK, rôle =", data?.user?.role);
    return data;
  } catch (error) {
    console.log("[DEBUG getServerMe] ÉCHEC :", error?.status, error?.message, error);
    return null;
  }
}

/**
 * Objet User de l'utilisateur connecté (RSC). Renvoie `null` si non authentifié.
 * @returns {Promise<import("@/lib/types").User|null>}
 */
export async function getServerUser() {
  const data = await getServerMe();
  return data?.user ?? null;
}

/**
 * Panier courant côté serveur (utile pour le compteur en SSR).
 * @returns {Promise<import("@/lib/types").Cart|null>}
 */
export async function getServerCart() {
  const json = await serverFetch("/cart", { cache: "no-store" });
  return json?.data ?? null;
}

/**
 * Lien signé (60s) vers la session Filament pour l'admin/manager connecté
 * (RSC). Réémis à la demande — cf. AuthController::adminSsoLink() : les
 * guards Sanctum (storefront) et session Filament ("web") sont indépendants,
 * un jeton Sanctum valide n'implique pas une session /admin déjà ouverte.
 * @returns {Promise<string|null>}
 */
export async function getAdminSsoUrl() {
  try {
    const json = await serverFetch("/admin/sso-link", { cache: "no-store" });
    console.log("[DEBUG getAdminSsoUrl] OK, url =", json?.url);
    return json?.url ?? null;
  } catch (error) {
    console.log("[DEBUG getAdminSsoUrl] ÉCHEC :", error?.status, error?.message, error);
    return null;
  }
}

/**
 * Historique paginé des commandes de l'utilisateur connecté (RSC).
 * @param {{ page?: number }} [options]
 * @returns {Promise<import("@/lib/types").Paginated<import("@/lib/types").Order>>}
 */
export async function getServerOrders(options = {}) {
  const json = await serverFetch("/orders", {
    query: { page: options.page },
    cache: "no-store",
  });
  return {
    items: json?.data ?? [],
    pagination: json?.meta ?? null,
    links: json?.links ?? null,
  };
}
