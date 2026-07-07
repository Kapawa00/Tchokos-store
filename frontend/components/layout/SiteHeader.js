"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import { PRIMARY_LINKS } from "@/lib/nav";
import { ANNOUNCEMENT, whatsappUrl } from "@/lib/config";
import {
  SearchIcon,
  CartIcon,
  WhatsAppIcon,
  ChevronDownIcon,
  MenuIcon,
} from "@/components/icons";
import { useCart } from "@/components/cart/CartProvider";

/**
 * En-tête collant du site : bandeau d'annonce optionnel, logo, navigation
 * centrale avec méga-menu « Boutique », outils (recherche, compte, panier) et
 * bouton WhatsApp. Sur mobile : bouton hamburger ouvrant le menu plein écran.
 *
 * @param {Object} props
 * @param {import("@/lib/api").NavCategory[]} props.categories - Familles + rayons (API /categories).
 */
export default function SiteHeader({ categories = [] }) {
  const { count: cartCount } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const boutiqueRef = useRef(null);

  // Ferme le méga-menu lors d'un changement de page.
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Échap ferme le méga-menu et redonne le focus au déclencheur.
  function onHeaderKeyDown(event) {
    if (event.key === "Escape" && megaOpen) {
      setMegaOpen(false);
      boutiqueRef.current?.focus();
    }
  }

  const hasCategories = categories.length > 0;

  return (
    <header
      className="sticky top-0 z-50 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80"
      onMouseLeave={() => setMegaOpen(false)}
      onKeyDown={onHeaderKeyDown}
    >
      {/* Bandeau d'annonce (espresso / crème) */}
      {ANNOUNCEMENT && (
        <div className="bg-espresso text-cream">
          <p className="mx-auto max-w-[1280px] px-4 py-2 text-center text-xs tracking-wide sm:text-sm">
            {ANNOUNCEMENT}
          </p>
        </div>
      )}

      {/* Barre principale (relative : ancre le panneau du méga-menu) */}
      <div className="relative border-b border-sand">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          {/* Logo (gauche) */}
          <Link
            href="/"
            className="flex flex-col leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            aria-label="Tchokos SARL — accueil"
          >
            <span className="font-display text-xl font-semibold text-espresso lg:text-2xl">
              Tchokos <span className="text-cognac">SARL</span>
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-taupe sm:block">
              {"C'est difficile, mais possible"}
            </span>
          </Link>

          {/* Navigation centrale (desktop) */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:block"
          >
            <ul className="flex items-center gap-1">
              {/* Méga-menu Boutique */}
              <li>
                <button
                  ref={boutiqueRef}
                  type="button"
                  aria-expanded={megaOpen}
                  aria-controls="mega-boutique"
                  onClick={() => setMegaOpen((v) => !v)}
                  onMouseEnter={() => setMegaOpen(true)}
                  className="inline-flex items-center gap-1 rounded-button px-3 py-2 font-body text-sm font-medium text-espresso transition-colors hover:text-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
                >
                  Boutique
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {megaOpen && hasCategories && (
                  <div
                    id="mega-boutique"
                    className="absolute inset-x-0 top-full border-b border-sand bg-offwhite shadow-lg"
                  >
                    <MegaMenu
                      categories={categories}
                      onNavigate={() => setMegaOpen(false)}
                    />
                  </div>
                )}
              </li>

              {PRIMARY_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-button px-3 py-2 font-body text-sm font-medium transition-colors hover:text-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
                        active ? "text-cognac" : "text-espresso"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Outils (droite) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/recherche"
              aria-label="Rechercher"
              className="inline-flex h-10 w-10 items-center justify-center rounded-button text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            >
              <SearchIcon className="h-5 w-5" />
            </Link>

            <UserMenu />

            <Link
              href="/panier"
              aria-label={`Panier${cartCount > 0 ? ` (${cartCount} article${cartCount > 1 ? "s" : ""})` : " (vide)"}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-button text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            >
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cognac px-1 text-[11px] font-semibold text-cream"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Bouton WhatsApp « Commander » (desktop) */}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 hidden items-center gap-2 rounded-button bg-sage px-5 py-2.5 font-body text-sm font-medium text-cream transition-colors hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 focus-visible:ring-offset-cream lg:inline-flex"
            >
              <WhatsAppIcon className="h-5 w-5" /> Commander
            </a>

            {/* Hamburger (mobile / tablette) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-button text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile plein écran */}
      <MobileMenu
        categories={categories}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
