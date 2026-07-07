import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "./SectionHeading";
import { familyHref } from "@/lib/nav";

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
              className="group flex h-32 flex-col justify-between overflow-hidden rounded-card border border-sand bg-offwhite p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(42,33,27,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac sm:h-40"
            >
              {/* Filet d'accent « brass » en haut de carte */}
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-brass" />
              <span>
                <span className="block font-display text-lg font-semibold text-espresso sm:text-xl">
                  {family.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-cognac transition-colors group-hover:text-camel">
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
