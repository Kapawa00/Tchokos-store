// Helpers de formatage d'affichage (prix en francs CFA).

/**
 * Formate un montant en FCFA avec séparateur de milliers (espace insécable).
 * Les montants de l'API sont des chaînes décimales (ex. « 12000.00 »).
 *
 * @param {string|number|null|undefined} amount
 * @returns {string} Ex. « 12 000 FCFA » (chaîne vide si montant absent).
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || amount === "") return "";
  const value = typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} FCFA`;
}
