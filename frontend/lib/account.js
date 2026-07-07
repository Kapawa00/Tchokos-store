// Espace compte : demande grossiste, abonnement aux notifications push, et
// initiation de paiement (Orange Money / MoMo, ou preuve WhatsApp).

import { apiFetch } from "@/lib/http";

/* ------------------------------- Grossiste ------------------------------- */

/**
 * Dépose (ou redépose après refus) une demande de compte grossiste.
 * @param {{ company: string, item_type: string, volume: string, city?: string }} input
 * @returns {Promise<import("@/lib/types").WholesaleAccount>}
 */
export async function applyWholesale(input) {
  const json = await apiFetch("/wholesale/apply", {
    method: "POST",
    body: input,
    auth: true,
  });
  return json?.data ?? null;
}

/**
 * État de la demande grossiste de l'utilisateur connecté
 * (`status: "none"` si aucune demande n'existe).
 * @param {{ token?: string }} [options]
 * @returns {Promise<import("@/lib/types").WholesaleAccount>}
 */
export async function getWholesaleStatus(options = {}) {
  const json = await apiFetch("/wholesale/status", {
    auth: true,
    token: options.token,
    cache: "no-store",
  });
  return json?.data ?? null;
}

/* ---------------------------- Notifications push -------------------------- */

/**
 * Enregistre un abonnement Web Push. Accepte un objet `PushSubscription` du
 * navigateur (sérialisé via toJSON) ou un objet déjà au bon format.
 * @param {PushSubscription|{ endpoint: string, keys: { p256dh: string, auth: string } }} subscription
 * @returns {Promise<{ message: string }>}
 */
export async function subscribePush(subscription) {
  const body =
    typeof subscription?.toJSON === "function" ? subscription.toJSON() : subscription;

  return apiFetch("/push/subscribe", {
    method: "POST",
    body: { endpoint: body.endpoint, keys: body.keys },
    auth: true,
  });
}

/**
 * Supprime un abonnement push par son endpoint.
 * @param {string} endpoint
 * @returns {Promise<{ message: string }>}
 */
export async function unsubscribePush(endpoint) {
  return apiFetch("/push/unsubscribe", {
    method: "POST",
    body: { endpoint },
    auth: true,
  });
}

/* -------------------------------- Paiement -------------------------------- */

/**
 * Initie un paiement mobile money (Orange Money ou MTN MoMo) pour une commande.
 * Le canal WhatsApp passe par submitWhatsappProof(), pas par cette fonction.
 * @param {string} reference - Référence de commande (ex. « TCK-2026-000123 »).
 * @param {"orange_money"|"momo"} method
 * @returns {Promise<any>}
 */
export async function initiatePayment(reference, method) {
  return apiFetch(`/payments/${encodeURIComponent(reference)}/initiate`, {
    method: "POST",
    body: { method },
    auth: true,
    withSession: true,
  });
}

/**
 * Envoie l'URL de la preuve de paiement WhatsApp (capture du transfert), que
 * l'administrateur validera ensuite côté serveur.
 * @param {string} reference
 * @param {string} proofUrl - URL publique de la preuve.
 * @returns {Promise<any>}
 */
export async function submitWhatsappProof(reference, proofUrl) {
  return apiFetch(`/payments/${encodeURIComponent(reference)}/whatsapp-proof`, {
    method: "POST",
    body: { proof_url: proofUrl },
    auth: true,
    withSession: true,
  });
}
