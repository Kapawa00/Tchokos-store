// Protection des routes /compte — exécuté sur l'Edge Runtime.
// Renommé de middleware.js → proxy.js (convention Next.js 16).

import { NextResponse } from "next/server";

const TOKEN_COOKIE = "tchokos_token";

/**
 * Protège toutes les routes sous /compte :
 * - Non connecté → redirige vers /compte/connexion?redirect=<chemin>
 * - Connecté sur connexion/inscription → redirige vers /compte (ou ?redirect)
 *
 * @param {import("next/server").NextRequest} request
 */
export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const isAuthPage =
    pathname === "/compte/connexion" ||
    pathname === "/compte/inscription" ||
    pathname === "/compte/mot-de-passe-oublie" ||
    pathname === "/compte/reinitialiser-mot-de-passe";

  console.log("[DEBUG proxy]", pathname, "token présent ?", Boolean(token), "isAuthPage ?", isAuthPage);

  // Déjà connecté : inutile de rester sur la page de connexion/inscription.
  if (isAuthPage && token) {
    const redirect = searchParams.get("redirect") ?? "/compte";
    const target = redirect.startsWith("/") ? redirect : "/compte";
    console.log("[DEBUG proxy] déjà un token sur une page d'auth → redirect vers", target);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Non connecté sur une page protégée → login.
  if (!isAuthPage && !token) {
    const loginUrl = new URL("/compte/connexion", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    console.log("[DEBUG proxy] pas de token sur une page protégée → redirect vers", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  console.log("[DEBUG proxy] laisse passer");
  return NextResponse.next();
}

export const config = {
  matcher: ["/compte", "/compte/:path*"],
};
