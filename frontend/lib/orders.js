// Commandes : création depuis le panier courant, consultation par référence,
// et historique de l'utilisateur connecté.

import { apiFetch } from "@/lib/http";

/**
 * @typedef {Object} CreateOrderInput
 * @property {import("@/lib/types").OrderChannel} channel - « whatsapp » | « email » | « site ».
 * @property {string} [customer_name] - Requis pour un invité.
 * @property {string} [customer_phone] - Requis pour un invité.
 * @property {string} [customer_email]
 * @property {string} [notes]
 */

/**
 * Crée une commande à partir du panier courant (connecté ou invité).
 * @param {CreateOrderInput} input
 * @returns {Promise<import("@/lib/types").Order>}
 */
export async function createOrder(input) {
  const json = await apiFetch("/orders", {
    method: "POST",
    body: input,
    auth: true,
    withSession: true,
  });
  return json?.data ?? null;
}

/**
 * Détail d'une commande par référence. Un invité doit prouver son identité via
 * le téléphone ou l'e-mail utilisés lors de la commande.
 * @param {string} reference
 * @param {{ phone?: string, email?: string, token?: string }} [options]
 * @returns {Promise<import("@/lib/types").Order>}
 */
export async function getOrder(reference, options = {}) {
  const { phone, email, token } = options;
  const json = await apiFetch(`/orders/${encodeURIComponent(reference)}`, {
    query: { phone, email },
    auth: true,
    token,
    cache: "no-store",
  });
  return json?.data ?? null;
}

/**
 * Historique paginé des commandes de l'utilisateur connecté.
 * @param {{ page?: number, token?: string }} [options]
 * @returns {Promise<import("@/lib/types").Paginated<import("@/lib/types").Order>>}
 */
export async function getMyOrders(options = {}) {
  const { page, token } = options;
  const json = await apiFetch("/orders", {
    query: { page },
    auth: true,
    token,
    cache: "no-store",
  });
  return {
    items: json?.data ?? [],
    pagination: json?.meta ?? null,
    links: json?.links ?? null,
  };
}
