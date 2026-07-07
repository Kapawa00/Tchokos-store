// Cœur de la couche d'accès aux données : wrapper `fetch` isomorphe (RSC + client)
// pour l'API Laravel. Gère l'URL de base (NEXT_PUBLIC_API_URL), le jeton Sanctum
// (en-tête Bearer), le jeton de session invité (X-Session-Token), la
// sérialisation JSON, les options de cache Next (revalidation/tags) et la
// remontée structurée des erreurs (notamment la validation 422 de Laravel).
//
// Côté CLIENT, le jeton/la session sont lus automatiquement depuis les cookies
// (voir auth/cookies.js). Côté SERVEUR, `apiFetch` n'accède pas à next/headers
// (pour ne pas polluer le bundle client) : les appels authentifiés en RSC
// passent par lib/api.server.js, qui injecte le jeton lu via next/headers.

import {
  getToken,
  getSessionToken,
  TOKEN_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth/cookies";

// Ré-export des noms de cookies (source de vérité : auth/cookies.js).
export { TOKEN_COOKIE, SESSION_COOKIE };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Erreur d'API structurée. `errors` reprend le format de validation Laravel
 * (`{ champ: [messages] }`) quand le statut est 422.
 */
export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {Record<string, string[]>|null} [errors]
   * @param {any} [payload] - Corps brut de la réponse, pour le débogage.
   */
  constructor(status, message, errors = null, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.payload = payload;
  }

  /** @returns {boolean} Vrai s'il s'agit d'une erreur de validation (422). */
  get isValidation() {
    return this.status === 422;
  }

  /** @returns {boolean} Vrai si l'utilisateur n'est pas authentifié (401). */
  get isUnauthenticated() {
    return this.status === 401;
  }

  /**
   * Premier message d'erreur de validation, pratique pour un toast.
   * @returns {string|null}
   */
  firstError() {
    if (!this.errors) return null;
    const first = Object.values(this.errors)[0];
    return Array.isArray(first) ? first[0] : null;
  }
}

/**
 * Construit une chaîne de requête en ignorant les valeurs vides/nulles.
 * Les booléens sont émis en « 1 »/« 0 » (compatibles `Request::boolean()`).
 * @param {Record<string, any>} [params]
 * @returns {string}
 */
export function buildQuery(params) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * @typedef {Object} ApiFetchOptions
 * @property {string} [method] - Verbe HTTP (défaut « GET »).
 * @property {any} [body] - Corps (objet → JSON, ou FormData).
 * @property {Record<string, any>} [query] - Paramètres d'URL.
 * @property {Record<string, string>} [headers] - En-têtes additionnels.
 * @property {boolean} [auth] - Attache le jeton Bearer si disponible.
 * @property {string} [token] - Jeton explicite (prioritaire sur le cookie).
 * @property {boolean} [withSession] - Attache le X-Session-Token (panier invité).
 * @property {string} [sessionToken] - Jeton de session explicite.
 * @property {RequestCache} [cache] - Option de cache fetch (ex. « no-store »).
 * @property {number} [revalidate] - Revalidation ISR en secondes (RSC).
 * @property {string[]} [tags] - Tags de cache Next pour invalidation ciblée.
 * @property {AbortSignal} [signal] - Signal d'annulation.
 */

/**
 * Appel générique à l'API. Renvoie le corps JSON analysé (enveloppe complète,
 * ex. `{ data, meta }`) ; les fonctions d'entité se chargent de « déballer ».
 *
 * @param {string} path - Chemin relatif (ex. « /products »).
 * @param {ApiFetchOptions} [options]
 * @returns {Promise<any>}
 * @throws {ApiError}
 */
export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL n'est pas défini.");
  }

  const {
    method = "GET",
    body,
    query,
    headers,
    auth = false,
    token,
    withSession = false,
    sessionToken,
    cache,
    revalidate,
    tags,
    signal,
  } = options;

  const url = `${API_URL}${path}${buildQuery(query)}`;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");

  // Jeton Sanctum (Bearer). Sur le client, lecture auto depuis le cookie.
  let bearer = token;
  if (auth && !bearer && typeof window !== "undefined") {
    bearer = getToken();
  }
  if (bearer) finalHeaders.set("Authorization", `Bearer ${bearer}`);

  // Jeton de session invité (panier/commande).
  let session = sessionToken;
  if (withSession && !session && typeof window !== "undefined") {
    session = getSessionToken();
  }
  if (session) finalHeaders.set("X-Session-Token", session);

  // Corps : FormData tel quel, sinon JSON.
  let payload;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      finalHeaders.set("Content-Type", "application/json");
      payload = JSON.stringify(body);
    }
  }

  const init = { method, headers: finalHeaders, body: payload, signal };

  // Cache : « cache » et « next.revalidate » sont mutuellement exclusifs.
  if (cache) {
    init.cache = cache;
  } else if (revalidate !== undefined || tags) {
    init.next = {};
    if (revalidate !== undefined) init.next.revalidate = revalidate;
    if (tags) init.next.tags = tags;
  } else if (method !== "GET") {
    // Les mutations ne doivent jamais être mises en cache.
    init.cache = "no-store";
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (cause) {
    throw new ApiError(0, `Impossible de joindre l'API (${path}).`, null, cause);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message || `Erreur API ${res.status} sur ${path}`,
      data?.errors ?? null,
      data,
    );
  }

  return data;
}
