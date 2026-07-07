import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "./SectionHeading";
import { familyHref, sectionHref } from "@/lib/nav";

/**
 * Rayons chaussures (Hommes / Femmes / Enfants) mis en avant. Masqué si la
 * famille « Chaussures » n'a pas de rayons enfants.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Category|undefined} props.chaussures - Famille Chaussures (avec children).
 */
export default function ShoeSections({ chaussures }) {
  const sections = chaussures?.children ?? [];
  if (sections.length === 0) return null;

  return (
    <section className="bg-sand/40">
      <Container className="py-12 sm:py-16">
        <SectionHeading
          title="Chaussures"
          subtitle="Hommes, femmes et enfants"
          linkHref={familyHref(chaussures.slug)}
        />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                href={sectionHref(chaussures.slug, section.slug)}
                className="group flex items-center justify-between rounded-card bg-espresso p-6 text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <span className="font-display text-xl font-semibold">{section.name}</span>
                <span
                  aria-hidden="true"
                  className="text-camel transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
