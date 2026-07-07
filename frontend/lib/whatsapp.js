// Helpers de génération de liens WhatsApp (wa.me) avec messages pré-remplis.
// Le numéro est lu depuis la variable d'environnement NEXT_PUBLIC_WHATSAPP_NUMBER
// (définie dans .env.local). Ne jamais mettre le numéro en dur ici.

import { WHATSAPP_NUMBER } from "./config";
import { formatPrice } from "./format";

/**
 * Construit l'URL wa.me avec le message pré-rempli.
 * Compatible navigateur et serveur (NEXT_PUBLIC_WHATSAPP_NUMBER).
 *
 * @param {string} message
 * @returns {string}
 */
export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ─── Constructeurs de messages ────────────────────────────────────────────────

/**
 * Message depuis la fiche produit (avant ajout au panier).
 *
 * @param {Object} params
 * @param {string} params.name - Nom du produit.
 * @param {string|null} [params.size] - Pointure sélectionnée.
 * @param {string|null} [params.color] - Couleur sélectionnée.
 * @param {number} [params.qty]
 * @param {string|null} [params.price] - Prix unitaire formaté.
 * @returns {string}
 */
export function buildProductMessage({ name, size = null, color = null, qty = 1, price = null }) {
  return [
    "Bonjour Tchokos SARL 👋",
    "",
    "Je souhaite commander :",
    "",
    `🛍️ *${name}*`,
    size  ? `📏 Pointure : ${size}`   : null,
    color ? `🎨 Couleur : ${color}`   : null,
    `📦 Quantité : ${qty}`,
    price ? `💰 Prix unitaire : ${price}` : null,
    "",
    "Est-il disponible ? Merci de confirmer les modalités de paiement (Orange Money / MTN MoMo).",
    "📸 Je joins une capture si nécessaire.",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/**
 * Message depuis les lignes du panier (commande avant validation).
 *
 * @param {import("./types").CartItem[]} items
 * @param {string|number} subtotal - Montant brut (sera formaté).
 * @returns {string}
 */
export function buildCartMessage(items, subtotal) {
  const itemLines = items.flatMap((item) => {
    const variant = [
      item.variant.size  ? `Pointure ${item.variant.size}` : null,
      item.variant.color ?? null,
    ]
      .filter(Boolean)
      .join(" · ");

    return [
      `🛍️ *${item.product.name}*`,
      variant ? `   ${variant}` : null,
      `   ${item.quantity} × ${formatPrice(item.unit_price)} = *${formatPrice(item.line_total)}*`,
      "",
    ].filter((l) => l !== null);
  });

  return [
    "Bonjour Tchokos SARL 👋",
    "",
    "Je souhaite commander les articles suivants :",
    "",
    ...itemLines,
    "─────────────────",
    `💰 Sous-total : *${formatPrice(subtotal)}*`,
    "🚚 + frais de livraison à confirmer",
    "",
    "Merci de confirmer les disponibilités et les modalités de paiement (Orange Money / MTN MoMo).",
    "📸 Je joins une capture si besoin.",
  ].join("\n");
}

/**
 * Message depuis une commande confirmée (pour finaliser le paiement).
 *
 * @param {import("./types").Order} order
 * @returns {string}
 */
export function buildOrderMessage(order) {
  const itemLines = (order.items ?? []).map((item) => {
    const label = item.variant_label ? ` (${item.variant_label})` : "";
    return `🛍️ *${item.product_name}*${label} × ${item.quantity} — ${formatPrice(item.line_total)}`;
  });

  // Si les lignes ne sont pas disponibles (order sans `items`), on reste générique.
  const body = itemLines.length
    ? ["", ...itemLines, ""]
    : [""];

  return [
    "Bonjour Tchokos SARL 👋",
    "",
    "Je souhaite finaliser le paiement de ma commande :",
    `🔖 Référence : *${order.reference}*`,
    ...body,
    "─────────────────",
    `💰 Total : *${formatPrice(order.total)}* + livraison`,
    "",
    "Paiement : Orange Money / MTN MoMo",
    "📸 J'enverrai la preuve de paiement après votre confirmation.",
    "",
    "Merci !",
  ].join("\n");
}

/**
 * Message depuis un reel du mur vidéo (« Je veux ce modèle »).
 *
 * @param {import("./types").Reel} reel
 * @returns {string}
 */
export function buildReelMessage(reel) {
  const productName = reel.product?.name ?? null;

  return [
    "Bonjour Tchokos SARL 👋",
    "",
    productName
      ? `J'ai vu le modèle *"${productName}"* dans votre reel sur le site.`
      : "J'ai vu un modèle dans votre reel sur le site.",
    "",
    "Est-il disponible ? Pouvez-vous me donner les informations (pointures, couleurs, prix) ?",
    "",
    "📸 Je joins une capture du reel si besoin.",
    "",
    "Merci !",
  ].join("\n");
}
