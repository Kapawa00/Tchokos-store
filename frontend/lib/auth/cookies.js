// Stockage du jeton côté NAVIGATEUR via cookies (lecture/écriture document.cookie).
// Isomorphe : sur le serveur (pas de `document`), les lecteurs renvoient
// `undefined` et les écritures sont sans effet — l'écriture côté serveur passe
// par auth/cookies.server.js (Server Actions / Route Handlers).
//
// Choix « stockage sûr » : cookie plutôt que localStorage (réduit l'exposition
// au vol de jeton par XSS), avec `SameSite=Lax` et `Secure` en production. Le
// cookie n'est pas httpOnly car, en architecture découplée à jeton Bearer
// cross-origin, le client doit pouvoir lire le jeton pour l'envoyer en en-tête.

/** Noms de cookies — source de vérité, réutilisée par http.js et le serveur. */
export const TOKEN_COOKIE = "tchokos_token";
export const SESSION_COOKIE = "tchokos_session";

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/**
 * @param {string} name
 * @returns {string|undefined}
 */
function readCookie(name) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * @param {string} name
 * @param {string} value
 * @param {number} [maxAge] - Durée de vie en secondes.
 */
function writeCookie(name, value, maxAge = DEFAULT_MAX_AGE) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * @param {string} name
 */
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** @returns {string|undefined} Jeton Sanctum courant (client). */
export function getToken() {
  return readCookie(TOKEN_COOKIE);
}

/** @param {string} token */
export function setToken(token) {
  writeCookie(TOKEN_COOKIE, token);
}

export function clearToken() {
  deleteCookie(TOKEN_COOKIE);
}

/** @returns {string|undefined} Jeton de session invité (panier). */
export function getSessionToken() {
  return readCookie(SESSION_COOKIE);
}

/** @param {string} token */
export function setSessionToken(token) {
  writeCookie(SESSION_COOKIE, token);
}

export function clearSessionToken() {
  deleteCookie(SESSION_COOKIE);
}
