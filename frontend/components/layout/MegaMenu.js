import Link from "next/link";
import { familyHref, sectionHref } from "@/lib/nav";

/**
 * Contenu du méga-menu « Boutique » (desktop) : une colonne par famille
 * (Chaussures avec ses rayons Hommes/Femmes/Enfants, puis Sacs, Ceintures,
 * Montres) + une colonne d'ambiance. Purement présentational ; l'état
 * ouvert/fermé est géré par l'en-tête parent.
 *
 * @param {Object} props
 * @param {import("@/lib/api").NavCategory[]} props.categories
 * @param {() => void} [props.onNavigate] - Appelé au clic sur un lien (ferme le menu).
 */
export default function MegaMenu({ categories, onNavigate }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((family) => (
          <div key={family.id}>
            <Link
              href={familyHref(family.slug)}
              onClick={onNavigate}
              className="font-display text-base font-semibold text-espresso transition-colors hover:text-cognac"
            >
              {family.name}
            </Link>

            {family.children?.length > 0 && (
              <ul className="mt-3 space-y-2">
                {family.children.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={sectionHref(family.slug, section.slug)}
                      onClick={onNavigate}
                      className="text-sm text-taupe transition-colors hover:text-cognac"
                    >
                      {section.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={familyHref(family.slug)}
              onClick={onNavigate}
              className="mt-3 inline-block text-xs font-medium uppercase tracking-wide text-cognac transition-colors hover:text-camel"
            >
              Tout voir
            </Link>
          </div>
        ))}

        {/* Colonne d'ambiance (visuel + accroche). Fond dégradé « cuir & crème »
            pour rester sobre sans dépendre d'un fichier image distant. */}
        <Link
          href="/boutique"
          onClick={onNavigate}
          className="group relative hidden overflow-hidden rounded-card bg-gradient-to-br from-camel via-cognac to-espresso p-5 lg:flex lg:flex-col lg:justify-end"
        >
          <span className="font-display text-lg font-semibold text-cream">
            La sélection Tchokos
          </span>
          <span className="mt-1 text-sm text-cream/85">
            Chaussures & accessoires en cuir
          </span>
          <span className="mt-3 text-xs font-medium uppercase tracking-wide text-cream underline-offset-4 group-hover:underline">
            Découvrir la boutique
          </span>
        </Link>
      </div>
    </div>
  );
}
