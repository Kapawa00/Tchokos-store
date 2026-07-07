// Panier : lecture et mutations. Toujours appelé avec `withSession` (en-tête
// X-Session-Token pour les invités) et `auth` (Bearer si connecté) — le backend
// privilégie l'utilisateur connecté, sinon le jeton de session. Le jeton de
// session renvoyé pour un invité est persisté côté navigateur pour les appels
// suivants.

import { apiFetch } from "@/lib/http";
import { setSessionToken } from "@/lib/auth/cookies";

/**
 * Déballe la réponse panier et mémorise le jeton de session invité (client).
 * @param {any} json
 * @returns {import("@/lib/types").Cart}
 */
function unwrapCart(json) {
  const cart = json?.data ?? null;
  if (cart?.session_token && typeof window !== "undefined") {
    setSessionToken(cart.session_token);
  }
  return cart;
}

/** @returns {Promise<import("@/lib/types").Cart>} */
export async function getCart() {
  const json = await apiFetch("/cart", {
    auth: true,
    withSession: true,
    cache: "no-store",
  });
  return unwrapCart(json);
}

/**
 * Ajoute une variante au panier.
 * @param {number} variantId
 * @param {number} [quantity]
 * @returns {Promise<import("@/lib/types").Cart>}
 */
export async function addToCart(variantId, quantity = 1) {
  const json = await apiFetch("/cart/items", {
    method: "POST",
    body: { variant_id: variantId, quantity },
    auth: true,
    withSession: true,
  });
  return unwrapCart(json);
}

/**
 * Modifie la quantité d'une ligne du panier.
 * @param {number} itemId
 * @param {number} quantity
 * @returns {Promise<import("@/lib/types").Cart>}
 */
export async function updateCartItem(itemId, quantity) {
  const json = await apiFetch(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: { quantity },
    auth: true,
    withSession: true,
  });
  return unwrapCart(json);
}

/**
 * Retire une ligne du panier.
 * @param {number} itemId
 * @returns {Promise<import("@/lib/types").Cart>}
 */
export async function removeCartItem(itemId) {
  const json = await apiFetch(`/cart/items/${itemId}`, {
    method: "DELETE",
    auth: true,
    withSession: true,
  });
  return unwrapCart(json);
}

/**
 * Vide entièrement le panier.
 * @returns {Promise<import("@/lib/types").Cart>}
 */
export async function clearCart() {
  const json = await apiFetch("/cart", {
    method: "DELETE",
    auth: true,
    withSession: true,
  });
  return unwrapCart(json);
}
