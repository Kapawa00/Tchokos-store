"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { familyHref, sectionHref, PRIMARY_LINKS } from "@/lib/nav";
import { whatsappUrl } from "@/lib/config";
import {
  CloseIcon,
  PlusIcon,
  MinusIcon,
  WhatsAppIcon,
  UserIcon,
  SearchIcon,
} from "@/components/icons";

/**
 * Menu mobile plein écran (hamburger). Les familles ayant des rayons sont des
 * accordéons dépliables ; les autres sont des liens directs. Gère le
 * verrouillage du défilement, la touche Échap et le focus initial.
 *
 * @param {Object} props
 * @param {import("@/lib/api").NavCategory[]} props.categories
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 */
export default function MobileMenu({ categories, open, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const closeRef = useRef(null);

  // Verrouille le défilement de l'arrière-plan, ferme sur Échap, et place le
  // focus sur le bouton de fermeture à l'ouverture.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      className="fixed inset-0 z-[70] flex flex-col bg-cream lg:hidden"
    >
      {/* Barre supérieure du panneau */}
      <div className="flex items-center justify-between border-b border-sand px-4 py-4">
        <span className="font-display text-lg font-semibold text-espresso">
          Tchokos <span className="text-cognac">SARL</span>
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-button text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Corps défilant */}
      <nav
        aria-label="Navigation principale (mobile)"
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-taupe">
          Boutique
        </p>
        <ul className="space-y-1">
          {categories.map((family) => {
            const hasChildren = family.children?.length > 0;
            const isOpen = expanded === family.id;

            if (!hasChildren) {
              return (
                <li key={family.id}>
                  <Link
                    href={familyHref(family.slug)}
                    onClick={onClose}
                    className="block rounded-button px-3 py-3 font-body text-base text-espresso transition-colors hover:bg-sand"
                  >
                    {family.name}
                  </Link>
                </li>
              );
            }

            return (
              <li key={family.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : family.id)}
                  aria-expanded={isOpen}
                  aria-controls={`famille-${family.id}`}
                  className="flex w-full items-center justify-between rounded-button px-3 py-3 text-left font-body text-base text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
                >
                  {family.name}
                  {isOpen ? (
                    <MinusIcon className="h-5 w-5 text-cognac" />
                  ) : (
                    <PlusIcon className="h-5 w-5 text-cognac" />
                  )}
                </button>

                {isOpen && (
                  <ul id={`famille-${family.id}`} className="mb-2 ml-3 space-y-1 border-l border-sand pl-3">
                    <li>
                      <Link
                        href={familyHref(family.slug)}
                        onClick={onClose}
                        className="block rounded-button px-3 py-2 text-sm font-medium text-cognac transition-colors hover:bg-sand"
                      >
                        Tout voir
                      </Link>
                    </li>
                    {family.children.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={sectionHref(family.slug, section.slug)}
                          onClick={onClose}
                          className="block rounded-button px-3 py-2 text-sm text-taupe transition-colors hover:bg-sand"
                        >
                          {section.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <hr className="my-4 border-sand" />

        <ul className="space-y-1">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block rounded-button px-3 py-3 font-body text-base text-espresso transition-colors hover:bg-sand"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-sand" />

        <ul className="space-y-1">
          <li>
            <Link
              href="/compte"
              onClick={onClose}
              className="flex items-center gap-3 rounded-button px-3 py-3 text-base text-espresso transition-colors hover:bg-sand"
            >
              <UserIcon className="h-5 w-5 text-taupe" /> Mon compte
            </Link>
          </li>
          <li>
            <Link
              href="/recherche"
              onClick={onClose}
              className="flex items-center gap-3 rounded-button px-3 py-3 text-base text-espresso transition-colors hover:bg-sand"
            >
              <SearchIcon className="h-5 w-5 text-taupe" /> Rechercher
            </Link>
          </li>
        </ul>
      </nav>

      {/* Pied du panneau : commande WhatsApp */}
      <div className="border-t border-sand p-4">
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-sage px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <WhatsAppIcon className="h-5 w-5" /> Commander sur WhatsApp
        </a>
      </div>
    </div>
  );
}
