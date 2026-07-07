// Appels API liés au paiement (Orange Money, MTN MoMo, preuve WhatsApp).

import { apiFetch } from "./http";

/**
 * @typedef {Object} PaymentInitiateResult
 * @property {string} payment_ref - Référence unique côté opérateur/sandbox.
 * @property {string|null} redirect_url - URL de la page de paiement opérateur (nul en sandbox).
 * @property {string|null} instructions - Instructions textuelles à afficher au client.
 */

/**
 * Démarre un paiement Orange Money ou MoMo pour une commande.
 * Renvoie les instructions / l'URL de redirection à présenter au client.
 *
 * @param {string} reference - Référence de la commande (ex. « TCH-2024-001 »).
 * @param {"orange_money"|"momo"} method
 * @returns {Promise<PaymentInitiateResult>}
 */
export async function initiatePayment(reference, method) {
  return apiFetch(`/payments/${encodeURIComponent(reference)}/initiate`, {
    method: "POST",
    body: { method },
    auth: true,
    withSession: true,
    cache: "no-store",
  });
}

/**
 * Enregistre l'URL d'une preuve de paiement WhatsApp.
 * La transaction reste « pending » jusqu'à validation manuelle par un admin.
 *
 * @param {string} reference - Référence de la commande.
 * @param {string} proofUrl - URL publique de l'image/PDF de preuve.
 * @returns {Promise<import("./types").Transaction>}
 */
export async function submitWhatsappProof(reference, proofUrl) {
  const json = await apiFetch(
    `/payments/${encodeURIComponent(reference)}/whatsapp-proof`,
    {
      method: "POST",
      body: { proof_url: proofUrl },
      auth: true,
      withSession: true,
      cache: "no-store",
    }
  );
  return json?.data ?? json;
}

/**
 * Récupère le statut actuel d'une commande (utilisé pour le polling).
 *
 * @param {string} reference
 * @param {{ phone?: string }} [opts] - Téléphone pour vérification invité.
 * @returns {Promise<import("./types").Order|null>}
 */
export async function fetchOrderStatus(reference, opts = {}) {
  const json = await apiFetch(`/orders/${encodeURIComponent(reference)}`, {
    query: { phone: opts.phone },
    auth: true,
    withSession: true,
    cache: "no-store",
  });
  return json?.data ?? null;
}
