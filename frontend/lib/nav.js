// Helpers de construction des URLs de navigation et liens centraux de l'en-tête.

/** @param {string} slug */
export function familyHref(slug) {
  return `/boutique/${slug}`;
}

/**
 * @param {string} familySlug
 * @param {string} sectionSlug
 */
export function sectionHref(familySlug, sectionSlug) {
  return `/boutique/${familySlug}/${sectionSlug}`;
}

/** Liens de la navigation centrale (hors méga-menu « Boutique »). */
export const PRIMARY_LINKS = [
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

/** Liens du pied de page, colonne « Boutique ». */
export const FOOTER_SHOP_LINKS = [
  { label: "Tout le catalogue", href: "/boutique" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
  { label: "Vente en gros", href: "/vente-en-gros" },
];

/** Liens du pied de page, colonne « Aide ». */
export const FOOTER_HELP_LINKS = [
  { label: "À propos de Tchokos", href: "/a-propos" },
  { label: "Livraison & retours", href: "/retours" },
  { label: "Contact & WhatsApp", href: "/contact" },
  { label: "Mon compte", href: "/compte" },
];
