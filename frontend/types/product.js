/**
 * @typedef {Object} ProductVariant
 * @property {number} id
 * @property {string} [pointure]
 * @property {string} [couleur]
 * @property {number} prixDetail
 * @property {number} prixGrossiste
 * @property {number} stock
 */

/**
 * @typedef {Object} ProductMedia
 * @property {number} id
 * @property {"image"|"video"} type
 * @property {string} url
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} nom
 * @property {string} categorie - "chaussures" | "sacs" | "ceintures" | "montres"
 * @property {ProductVariant[]} variantes
 * @property {ProductMedia[]} medias
 */

export {};
