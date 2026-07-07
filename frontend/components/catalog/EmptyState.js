import Link from "next/link";

/**
 * État « aucun résultat » pour la grille produits.
 *
 * @param {Object} props
 * @param {boolean} [props.hasFilters] - Vrai si des filtres actifs peuvent expliquer le résultat vide.
 * @param {string} [props.resetHref] - URL permettant d'effacer tous les filtres.
 */
export default function EmptyState({ hasFilters = false, resetHref }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div
        aria-hidden="true"
        className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sand text-taupe"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
          <path d="M8 11h6M11 8v6" strokeOpacity={0} />
          <path d="M9 9l4 4M13 9l-4 4" />
        </svg>
      </div>
      <p className="font-display text-2xl text-espresso">Aucun article trouvé</p>
      <p className="mt-2 max-w-xs font-body text-sm text-taupe">
        {hasFilters
          ? "Aucun article ne correspond à vos critères. Essayez de modifier ou de supprimer certains filtres."
          : "Cette catégorie ne contient pas encore d'articles."}
      </p>
      {hasFilters && resetHref && (
        <Link
          href={resetHref}
          className="mt-5 inline-flex items-center rounded-button border border-cognac px-5 py-2.5 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        >
          Effacer les filtres
        </Link>
      )}
    </div>
  );
}
