"use client";

import { useEffect, useState } from "react";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import { HeartIcon } from "@/components/icons";

/**
 * Bouton cœur pour ajouter / retirer un produit des favoris (localStorage).
 * @param {{ product: { id: number, name: string, slug: string, price: string, image?: string|null } }} props
 */
export default function FavoriteButton({ product }) {
  const [active, setActive] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Initialiser depuis localStorage côté client uniquement.
  useEffect(() => {
    setActive(isFavorite(product.id));
  }, [product.id]);

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
  };

  return (
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
  );
}
