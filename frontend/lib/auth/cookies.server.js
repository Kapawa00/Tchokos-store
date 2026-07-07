import "server-only";
import { cookies } from "next/headers";
import { TOKEN_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies";

// Accès au jeton côté SERVEUR via next/headers. La LECTURE fonctionne dans les
// Server Components (RSC) ; l'ÉCRITURE (set/clear) n'est possible que dans une
// Server Action ou un Route Handler (limite HTTP : Set-Cookie après le début du
// streaming est interdit). Module `server-only` : jamais inclus côté client.

const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/** @returns {Promise<string|undefined>} Jeton Sanctum lu dans la requête. */
export async function getServerToken() {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

/** @returns {Promise<string|undefined>} Jeton de session invité (panier). */
export async function getServerSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/**
 * Écrit le jeton (Server Action / Route Handler uniquement).
 * @param {string} token
 */
export async function setServerToken(token) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Non httpOnly : le client doit pouvoir lire le jeton pour l'en-tête Bearer
    // (cf. justification dans auth/cookies.js).
    httpOnly: false,
  });
}

export async function clearServerToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
