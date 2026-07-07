// Point d'entrée public (client-safe) de la couche d'accès aux données.
// Regroupe le cœur HTTP, les helpers de jeton navigateur et toutes les
// fonctions d'entité, pour des imports simples : `import { getProducts } from "@/lib/api"`.
//
// ⚠️ Ne PAS ré-exporter ici les modules serveur (lib/api.server, auth/cookies.server) :
// ils sont `server-only` et casseraient le bundle client. Les utiliser via
// `import { ... } from "@/lib/api.server"` dans les Server Components/Actions.

// Cœur HTTP
export { apiFetch, ApiError, buildQuery, TOKEN_COOKIE, SESSION_COOKIE } from "@/lib/http";

// Jeton / session côté navigateur
export {
  getToken,
  setToken,
  clearToken,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
} from "@/lib/auth/cookies";

// Catalogue
export { getCategories, getProducts, getProduct, getReels, getBanners, search } from "@/lib/catalog";

// Formatage & médias (helpers d'affichage)
export { formatPrice } from "@/lib/format";
export { mediaUrl, IMAGE_FALLBACK } from "@/lib/media";

// Panier
export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/lib/cart";

// Commandes
export { createOrder, getOrder, getMyOrders } from "@/lib/orders";

// Authentification
export { login, register, logout, me } from "@/lib/auth";

// Compte : grossiste, push, paiement
export {
  applyWholesale,
  getWholesaleStatus,
  subscribePush,
  unsubscribePush,
  initiatePayment,
  submitWhatsappProof,
} from "@/lib/account";
