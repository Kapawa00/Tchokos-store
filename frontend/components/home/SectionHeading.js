import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

/**
 * En-tête de section d'accueil : titre serif à gauche, lien « Tout voir »
 * optionnel à droite.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.linkHref]
 * @param {string} [props.linkLabel]
 */
export default function SectionHeading({ title, subtitle, linkHref, linkLabel = "Tout voir" }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-espresso sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-taupe">{subtitle}</p>}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="inline-flex shrink-0 items-center gap-1 font-body text-sm font-medium text-cognac transition-colors hover:text-camel focus-visible:outline-none focus-visible:underline"
        >
          {linkLabel}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
