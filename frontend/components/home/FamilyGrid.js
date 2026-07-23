import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "./SectionHeading";
import { familyHref } from "@/lib/nav";
import { mediaUrl } from "@/lib/media";

/**
 * Accès rapides aux familles (Chaussures, Sacs, Ceintures, Montres) : cartes
 * 2×2 sur mobile, 4 colonnes sur ordinateur.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Category[]} props.families
 */
export default function FamilyGrid({ families }) {
  if (!families?.length) return null;

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading title="Nos rayons" linkHref="/boutique" />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {families.map((family) => (
          <li key={family.id}>
            <Link
              href={familyHref(family.slug)}
              className="group relative flex h-32 flex-col justify-between overflow-hidden rounded-card border border-sand bg-offwhite p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(42,33,27,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac sm:h-40"
            >
              {family.image_url && (
                <>
                  <Image
                    src={mediaUrl(family.image_url)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Voile espresso pour garantir la lisibilité du texte */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/35 to-espresso/10"
                  />
                </>
              )}

              {/* Filet d'accent « brass » en haut de carte */}
              <span aria-hidden="true" className="relative h-1 w-10 rounded-full bg-brass" />
              <span className="relative">
                <span
                  className={`block font-display text-lg font-semibold sm:text-xl ${
                    family.image_url ? "text-cream" : "text-espresso"
                  }`}
                >
                  {family.name}
                </span>
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${
                    family.image_url
                      ? "text-camel group-hover:text-brass"
                      : "text-cognac group-hover:text-camel"
                  }`}
                >
                  Découvrir
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
