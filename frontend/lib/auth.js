// Authentification Sanctum : inscription, connexion, déconnexion, profil.
// Côté client, le jeton renvoyé est automatiquement persisté dans le cookie
// (cf. auth/cookies.js). Côté serveur (Server Action / Route Handler), utiliser
// le jeton renvoyé avec auth/cookies.server.js → setServerToken().

import { apiFetch } from "@/lib/http";
import { setToken, clearToken } from "@/lib/auth/cookies";

/** Persiste le jeton côté navigateur (sans effet côté serveur). */
function persist(token) {
  if (token && typeof window !== "undefined") setToken(token);
}

/**
 * @typedef {Object} AuthResult
 * @property {string} message
 * @property {import("@/lib/types").User} user
 * @property {string} token - Jeton Sanctum (à conserver pour les appels Bearer).
 * @property {string|null} [admin_redirect_url] - Admin/manager uniquement : lien
 *   signé à courte durée de vie ouvrant directement la session Filament (/admin).
 */

/**
 * Connexion par e-mail / mot de passe.
 * @param {{ email: string, password: string, device_name?: string }} credentials
 * @returns {Promise<AuthResult>}
 */
export async function login(credentials) {
  const json = await apiFetch("/login", {
    method: "POST",
    body: credentials,
  });
  persist(json?.token);
  return json;
}

/**
 * Inscription (client ou grossiste). Pour un grossiste : fournir `role:
 * "wholesaler"` et `company` (obligatoire).
 * @param {{
 *   name: string, email: string, password: string, password_confirmation: string,
 *   phone?: string, role?: ("customer"|"wholesaler"), company?: string, city?: string,
 *   device_name?: string
 * }} input
 * @returns {Promise<AuthResult>}
 */
export async function register(input) {
  const json = await apiFetch("/register", {
    method: "POST",
    body: input,
  });
  persist(json?.token);
  return json;
}

/**
 * Déconnexion : révoque le jeton courant côté serveur puis efface le cookie.
 * @param {{ token?: string }} [options]
 * @returns {Promise<{ message: string }>}
 */
export async function logout(options = {}) {
  try {
    return await apiFetch("/logout", {
      method: "POST",
      auth: true,
      token: options.token,
    });
  } finally {
    if (typeof window !== "undefined") clearToken();
  }
}

/**
 * Profil de l'utilisateur connecté + droit d'accès au prix grossiste.
 * @param {{ token?: string }} [options]
 * @returns {Promise<{ user: import("@/lib/types").User, can_view_wholesale_price: boolean }>}
 */
export async function me(options = {}) {
  return apiFetch("/me", {
    auth: true,
    token: options.token,
    cache: "no-store",
  });
}

/**
 * Met à jour le profil de l'utilisateur connecté (sauf e-mail).
 * @param {{
 *   name?: string,
 *   phone?: string,
 *   current_password?: string,
 *   password?: string,
 *   password_confirmation?: string
 * }} input
 * @returns {Promise<{ message: string, user: import("@/lib/types").User }>}
 */
export async function updateProfile(input) {
  return apiFetch("/profile", {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

/**
 * Renvoie l'e-mail de vérification à l'utilisateur connecté.
 * @returns {Promise<{ message: string }>}
 */
export async function resendVerificationEmail() {
  return apiFetch("/email/resend-verification", {
    method: "POST",
    auth: true,
  });
}

/**
 * Demande d'envoi d'un lien de réinitialisation de mot de passe par e-mail.
 * @param {{ email: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(payload) {
  return apiFetch("/forgot-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * Réinitialisation du mot de passe avec le token reçu par e-mail.
 * @param {{ token: string, email: string, password: string, password_confirmation: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(payload) {
  return apiFetch("/reset-password", {
    method: "POST",
    body: payload,
  });
}
