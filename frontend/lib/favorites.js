// Gestion des favoris en localStorage (pas de route backend dédiée).
// Les favoris sont stockés sous la clé STORAGE_KEY, tableau de FavoriteItem.

const STORAGE_KEY = "tchokos_favorites";

/**
 * @typedef {Object} FavoriteItem
 * @property {number} id - ID produit.
 * @property {string} name
 * @property {string} slug
 * @property {string} price
 * @property {string|null} image
 */

/** @returns {FavoriteItem[]} */
export function getFavorites() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** @param {FavoriteItem[]} items */
function saveFavorites(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Ajoute un produit aux favoris (si absent).
 * @param {FavoriteItem} item
 */
export function addFavorite(item) {
  const current = getFavorites();
  if (current.some((f) => f.id === item.id)) return;
  saveFavorites([...current, item]);
}

/** @param {number} productId */
export function removeFavorite(productId) {
  saveFavorites(getFavorites().filter((f) => f.id !== productId));
}

/** @param {number} productId */
export function isFavorite(productId) {
  return getFavorites().some((f) => f.id === productId);
}

/**
 * Bascule l'état favori d'un produit.
 * @param {FavoriteItem} item
 * @returns {boolean} `true` si maintenant en favori.
 */
export function toggleFavorite(item) {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  }
  addFavorite(item);
  return true;
}
