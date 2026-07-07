// Construction des URLs absolues des médias (images/vidéos) renvoyés par l'API.
// Les uploads back-office sont des chemins relatifs sur le disque public
// (ex. « produits/images/x.jpg ») → préfixés par l'origine + « /storage/ ».
// Les données de démo sont déjà des URLs absolues → renvoyées telles quelles,
// sauf les domaines de placeholder dépréciés qui sont remplacés par le fallback.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Fichier local dans public/ — aucune dépendance à un service externe.
export const IMAGE_FALLBACK = "/placeholder.svg";

// Domaines de placeholder hors ligne ou non configurés dans next/image.
const DEPRECATED_HOSTS = ["via.placeholder.com", "placehold.it", "placekitten.com"];

/**
 * @param {string|null|undefined} path
 * @param {string} [fallback]
 * @returns {string}
 */
export function mediaUrl(path, fallback = IMAGE_FALLBACK) {
  if (!path) return fallback;
  if (/^https?:\/\//.test(path)) {
    // Remplacer les placeholders dépréciés par l'image locale.
    const isDeprecated = DEPRECATED_HOSTS.some((h) => path.includes(h));
    return isDeprecated ? fallback : path;
  }
  return `${ORIGIN}/storage/${path.replace(/^\/+/, "")}`;
}
