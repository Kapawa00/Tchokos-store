// Configuration publique du site (valeurs non sensibles, exposées au client).
// Les vraies valeurs proviennent des variables d'environnement NEXT_PUBLIC_*.
// ⚠️ Le numéro WhatsApp ci-dessous est un PLACEHOLDER à remplacer dans .env.local
//    (clé NEXT_PUBLIC_WHATSAPP_NUMBER) par le numéro réel du service client.

/** Numéro WhatsApp du service client, format international sans « + » (ex. 2376XXXXXXXX). */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "237600000000";

/** Bandeau d'annonce de l'en-tête (laisser vide pour le masquer). */
export const ANNOUNCEMENT =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT ??
  "Livraison à Douala · Paiement Orange Money & MTN MoMo · Commande sur WhatsApp";

/** Liens & coordonnées de la marque, réutilisés dans l'en-tête et le pied de page. */
export const SOCIAL = {
  facebookUrl: "https://www.facebook.com/Tchokos.sarl",
  facebookHandle: "@Tchokos.sarl",
  address: "Akwa, Douala — Cameroun",
};

/**
 * Construit un lien wa.me pré-rempli vers le service client.
 * @param {string} [message] - Message pré-rempli côté WhatsApp.
 * @returns {string}
 */
export function whatsappUrl(
  message = "Bonjour Tchokos SARL, je souhaite passer une commande.",
) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
