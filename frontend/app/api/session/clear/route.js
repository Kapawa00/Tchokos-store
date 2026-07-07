import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth/cookies";

/**
 * Purge le jeton Sanctum invalide/périmé puis renvoie vers la connexion.
 * Un Server Component (ex. le layout protégé de /compte) ne peut pas
 * lui-même supprimer un cookie — seul un Route Handler ou un middleware le
 * peut. Sans ce nettoyage, un jeton révoqué côté serveur (ex. déconnexion de
 * /admin, qui purge tous les jetons Sanctum de l'utilisateur — cf.
 * RevokeTokensOnAdminLogout) reste présent dans le cookie du navigateur :
 * /compte échoue sur /me (401) → redirige vers /compte/connexion → qui, ne
 * voyant qu'un cookie présent (sans le valider), renvoie aussitôt vers
 * /compte → boucle infinie.
 */
export async function GET(request) {
  const response = NextResponse.redirect(new URL("/compte/connexion", request.url));
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}
