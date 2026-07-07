import Link from "next/link";
import { FOOTER_SHOP_LINKS, FOOTER_HELP_LINKS } from "@/lib/nav";
import { SOCIAL, whatsappUrl } from "@/lib/config";
import { WhatsAppIcon, FacebookIcon, MapPinIcon } from "@/components/icons";

/**
 * Pied de page du site : fond espresso, texte crème, 4 colonnes (marque,
 * Boutique, Aide, Contact & réseaux) puis une barre de mentions légales.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-espresso text-cream">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {/* Marque + slogan */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-xl font-semibold">
            Tchokos <span className="text-camel">SARL</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-cream/75">
            Grossiste-détaillant de chaussures et accessoires à Akwa, Douala.
          </p>
          <p className="mt-4 font-display text-sm italic text-camel">
            {"« C'est difficile, mais possible »"}
          </p>
        </div>

        {/* Boutique */}
        <nav aria-label="Liens boutique">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-camel">
            Boutique
          </h2>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/80 transition-colors hover:text-cream focus-visible:outline-none focus-visible:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Aide */}
        <nav aria-label="Aide">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-camel">
            Aide
          </h2>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/80 transition-colors hover:text-cream focus-visible:outline-none focus-visible:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact & réseaux */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-camel">
            Contact &amp; réseaux
          </h2>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-cream focus-visible:outline-none focus-visible:underline"
              >
                <WhatsAppIcon className="h-5 w-5 text-camel" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={SOCIAL.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-cream focus-visible:outline-none focus-visible:underline"
              >
                <FacebookIcon className="h-5 w-5 text-camel" />{" "}
                {SOCIAL.facebookHandle}
              </a>
            </li>
            <li>
              <p className="inline-flex items-center gap-2 text-sm text-cream/80">
                <MapPinIcon className="h-5 w-5 text-camel" /> {SOCIAL.address}
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Mentions légales */}
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} Tchokos SARL. Tous droits réservés.</p>
          <nav aria-label="Mentions légales">
            <ul className="flex flex-wrap items-center gap-4">
              <li>
                <Link href="/mentions-legales" className="transition-colors hover:text-cream">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="transition-colors hover:text-cream">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/retours" className="transition-colors hover:text-cream">
                  Retours
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="transition-colors hover:text-cream">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
