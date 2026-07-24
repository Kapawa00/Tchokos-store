// Accès au catalogue : catégories, liste de produits (filtres), détail produit,
// recherche. Pensé pour le rendu serveur (SSG/ISR) afin de favoriser le SEO :
// les listes et fiches sont mises en cache avec revalidation, et taguées pour
// une invalidation ciblée (revalidateTag) lors d'une mise à jour back-office.

import { apiFetch, ApiError } from "@/lib/http";

/** Durées de revalidation (secondes). */
const REVALIDATE = {
  categories: 3600, // 1 h
  products: 300, // 5 min
  product: 600, // 10 min
  reels: 600, // 10 min
  banners: 600, // 10 min
};

/**
 * Arborescence des catégories (familles + rayons). Repli sur `[]` si l'API est
 * indisponible (ex. build hors-ligne) pour ne pas casser le rendu de l'en-tête.
 *
 * @returns {Promise<import("@/lib/types").Category[]>}
 */
export async function getCategories() {
  try {
    const json = await apiFetch("/categories", {
      revalidate: REVALIDATE.categories,
      tags: ["categories"],
    });
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Liste paginée du catalogue, avec filtres/tri (cf. ProductFilters).
 *
 * @param {import("@/lib/types").ProductFilters} [filters]
 * @returns {Promise<import("@/lib/types").Paginated<import("@/lib/types").Product>>}
 */
export async function getProducts(filters = {}) {
  try {
    const json = await apiFetch("/products", {
      query: filters,
      revalidate: REVALIDATE.products,
      tags: ["products"],
    });
    return {
      items: json?.data ?? [],
      pagination: json?.meta ?? null,
      links: json?.links ?? null,
    };
  } catch {
    // Repli sur liste vide si le backend est indisponible (ex. dev sans serveur).
    return { items: [], pagination: null, links: null };
  }
}

/**
 * Détail d'un produit par slug (variantes, médias, produits similaires).
 *
 * @param {string} slug
 * @returns {Promise<import("@/lib/types").ProductDetail>}
 */
export async function getProduct(slug) {
  try {
    const json = await apiFetch(`/products/${encodeURIComponent(slug)}`, {
      revalidate: REVALIDATE.product,
      tags: ["products", `product:${slug}`],
    });
    return json?.data ?? null;
  } catch (error) {
    // 404 : produit inexistant, inactif ou sans image principale — géré par
    // `notFound()` dans la page. Toute autre erreur (réseau, 500...) remonte.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Mur de reels de l'accueil : vidéos mises en avant (ou récentes), avec le
 * produit associé. Repli sur `[]` si l'API est indisponible.
 *
 * @returns {Promise<import("@/lib/types").Reel[]>}
 */
export async function getReels() {
  try {
    const json = await apiFetch("/reels", {
      revalidate: REVALIDATE.reels,
      tags: ["reels"],
    });
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Vidéo de fond du hero de l'accueil : sélection explicite (is_hero) côté
 * admin, indépendante du mur de reels — activer/désactiver un reel n'y
 * touche pas. `null` tant qu'aucune vidéo n'a été désignée héro.
 *
 * @returns {Promise<import("@/lib/types").Reel|null>}
 */
export async function getHeroReel() {
  try {
    const json = await apiFetch("/reels/hero", {
      revalidate: REVALIDATE.reels,
      tags: ["reels"],
    });
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Bannières actives de la page d'accueil, ordonnées par position. Repli sur
 * `[]` si l'API est indisponible.
 *
 * @returns {Promise<import("@/lib/types").Banner[]>}
 */
export async function getBanners() {
  try {
    const json = await apiFetch("/banners", {
      revalidate: REVALIDATE.banners,
      tags: ["banners"],
    });
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * Suggestions de recherche rapide (autocomplete). Non mis en cache : la requête
 * dépend de la saisie de l'utilisateur, en temps réel.
 *
 * @param {string} q
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import("@/lib/types").SearchSuggestion[]>}
 */
export async function search(q, options = {}) {
  const term = (q ?? "").trim();
  if (term === "") return [];

  const json = await apiFetch("/search", {
    query: { q: term },
    cache: "no-store",
    signal: options.signal,
  });
  return json?.data ?? [];
}
