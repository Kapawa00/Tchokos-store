"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import WhatsAppFloat from "./WhatsAppFloat";

// Pages d'authentification (accès public) qui gardent le header/footer.
// Tout le reste de /compte/* est considéré comme tableau de bord.
const AUTH_PAGES = [
  "/compte/connexion",
  "/compte/inscription",
  "/compte/mot-de-passe-oublie",
  "/compte/reinitialiser-mot-de-passe",
];

/**
 * Enveloppe qui affiche (ou masque) le header/footer/flottant WhatsApp selon le
 * contexte de navigation :
 *   - Pages publiques et pages d'auth → header + footer normaux.
 *   - Tableau de bord (/compte/*) → aucune chrome globale (AccountNav prend le relais).
 *
 * Doit être enfant de CartProvider (SiteHeader utilise useCart).
 *
 * @param {{ categories: import("@/lib/api").NavCategory[], children: React.ReactNode }} props
 */
export default function SiteChrome({ categories, children }) {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/compte" ||
    (pathname.startsWith("/compte/") &&
      !AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "?")));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader categories={categories} />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
