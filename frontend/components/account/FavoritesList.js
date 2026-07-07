"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { formatPrice } from "@/lib/format";
import { HeartIcon, TrashIcon } from "@/components/icons";

/**
 * Liste des produits favoris stockés en localStorage.
 * L'ajout en favori se fait depuis la fiche produit (FavoriteButton).
 */
export default function FavoritesList() {
  const [favorites, setFavorites] = useState(/** @type {import("@/lib/favorites").FavoriteItem[]} */ ([]));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setMounted(true);
  }, []);

  const handleRemove = (id) => {
    removeFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  // Squelette pendant l'hydratation.
  if (!mounted) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-card bg-sand/40" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand/50">
          <HeartIcon className="h-8 w-8 text-taupe" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-espresso">Aucun favori</p>
          <p className="mt-1 font-body text-sm text-taupe">
            Ajoutez des produits à vos favoris depuis la fiche produit.
          </p>
        </div>
        <Link
          href="/boutique"
          className="mt-2 rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac"
        >
          Explorer la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((item) => (
        <article
          key={item.id}
          className="group relative flex gap-3 rounded-card border border-sand bg-offwhite p-4 transition-shadow hover:shadow-md"
        >
          {/* Image */}
          <Link href={`/produits/${item.slug}`} className="shrink-0">
            <div className="relative h-20 w-16 overflow-hidden rounded-button bg-sand/40">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="h-full w-full bg-sand/60" />
              )}
            </div>
          </Link>

          {/* Infos */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <Link href={`/produits/${item.slug}`}>
              <p className="line-clamp-2 font-body text-sm font-semibold text-espresso hover:text-cognac">
                {item.name}
              </p>
            </Link>
            <p className="font-body text-sm font-bold text-cognac">{formatPrice(item.price)}</p>
          </div>

          {/* Bouton supprimer */}
          <button
            type="button"
            onClick={() => handleRemove(item.id)}
            aria-label={`Retirer ${item.name} des favoris`}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-taupe opacity-0 transition-opacity hover:bg-bordeaux/10 hover:text-bordeaux group-hover:opacity-100 focus:opacity-100"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </article>
      ))}
    </div>
  );
}
