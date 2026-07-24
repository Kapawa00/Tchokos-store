"use client";

import { useEffect, useRef, useState } from "react";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import { HeartIcon } from "@/components/icons";

/**
 * Bouton cœur pour ajouter / retirer un produit des favoris (localStorage).
 * @param {{ product: { id: number, name: string, slug: string, price: string, image?: string|null } }} props
 */
export default function FavoriteButton({ product }) {
  const [active, setActive] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState(null);
  const messageTimeout = useRef(null);

  // Initialiser depuis localStorage côté client uniquement.
  useEffect(() => {
    setActive(isFavorite(product.id));
  }, [product.id]);

  // Nettoyer le timeout en attente si le composant est démonté.
  useEffect(() => () => clearTimeout(messageTimeout.current), []);

  const handleToggle = () => {
    const nowActive = toggleFavorite({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image ?? null,
    });
    setActive(nowActive);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    setMessage(nowActive ? "Ajouté aux favoris" : "Retiré des favoris");
    clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={active ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
          active
            ? "border-bordeaux/40 bg-bordeaux/10 text-bordeaux"
            : "border-sand bg-offwhite text-taupe hover:border-bordeaux/40 hover:text-bordeaux"
        } ${animating ? "scale-110" : "scale-100"}`}
      >
        <HeartIcon
          className={`h-5 w-5 transition-all ${active ? "fill-bordeaux stroke-bordeaux" : ""}`}
        />
      </button>

      {/* Confirmation visuelle + annonce pour lecteurs d'écran. */}
      {message && (
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 whitespace-nowrap rounded-button bg-espresso px-3 py-1.5 font-body text-xs text-cream shadow-md">
          {message}
        </span>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
