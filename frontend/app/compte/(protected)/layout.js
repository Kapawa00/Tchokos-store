import { redirect } from "next/navigation";
import { getServerUser, getAdminSsoUrl } from "@/lib/api.server";
import { Container } from "@/components/ui";
import { AccountNav } from "@/components/account";

export const dynamic = "force-dynamic";

// Repli si le lien SSO ne peut pas être émis (cf. getAdminSsoUrl) : au moins
// pas de boucle, l'admin retombe sur /admin/login... qui n'existe plus — mais
// le middleware `RedirectUnauthenticatedAdminToStorefront` du panneau prendra
// le relais proprement.
const ADMIN_URL = "/admin";

/**
 * Layout protégé de l'espace client.
 * Ce route group (protected) s'applique à toutes les pages authentifiées
 * sauf connexion/ et inscription/ qui restent en dehors du groupe.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default async function ProtectedAccountLayout({ children }) {
  const user = await getServerUser();
  console.log("[DEBUG /compte layout] user =", user ? { id: user.id, role: user.role } : null);

  if (!user) {
    // Passe par /api/session/clear (Route Handler) plutôt qu'un redirect()
    // direct : un Server Component ne peut pas supprimer de cookie, et un
    // jeton invalide/révoqué laissé dans tchokos_token ferait boucler
    // /compte ↔ /compte/connexion (cf. proxy.js, qui ne vérifie que la
    // présence du cookie, jamais sa validité).
    console.log("[DEBUG /compte layout] pas d'utilisateur (ou jeton invalide) → purge cookie + redirect connexion");
    redirect("/api/session/clear");
  }

  // L'espace client est réservé aux clients et grossistes.
  // Admin et manager → panneau d'administration Filament, via un lien SSO
  // signé réémis à la demande : un jeton Sanctum valide ici n'implique pas
  // une session Filament ("web") déjà ouverte (guards indépendants). Sans ce
  // pont, une redirection directe vers /admin peut boucler avec
  // /compte/connexion (cf. proxy.js, qui renvoie vers /compte dès qu'un
  // jeton est présent).
  if (user.role === "admin" || user.role === "manager") {
    const ssoUrl = await getAdminSsoUrl();
    console.log("[DEBUG /compte layout] rôle staff → ssoUrl =", ssoUrl, "→ redirect vers", ssoUrl ?? ADMIN_URL);
    redirect(ssoUrl ?? ADMIN_URL);
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <AccountNav user={user} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
