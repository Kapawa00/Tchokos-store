"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

/**
 * Barre de recherche de la page /recherche : soumet le terme saisi en
 * paramètre d'URL `?q=`, ce qui déclenche un nouveau rendu serveur de la page.
 *
 * @param {Object} props
 * @param {string} [props.initialQuery] - Terme déjà présent dans l'URL au chargement.
 */
export default function SearchBar({ initialQuery = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = value.trim();
    router.push(term ? `/recherche?q=${encodeURIComponent(term)}` : "/recherche");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Rechercher un article..."
          aria-label="Rechercher un article"
          className="w-full rounded-button border border-sand bg-offwhite py-3 pl-11 pr-4 font-body text-sm text-espresso placeholder:text-taupe/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Rechercher
      </button>
    </form>
  );
}
