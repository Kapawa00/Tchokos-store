"use client";

import { useState, useCallback } from "react";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "./EmptyState";
import { apiFetch } from "@/lib/http";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

/**
 * Convertit un produit de l'API en props pour ProductCard.
 * @param {import("@/lib/types").Product} p
 */
function toCardProps(p) {
  const hasPromo = Boolean(p.promo_price);
  return {
    name: p.name,
    href: `/produit/${p.slug}`,
    imageSrc: mediaUrl(p.primary_image),
    imageAlt: p.name,
    price: formatPrice(hasPromo ? p.promo_price : p.price),
    oldPrice: hasPromo ? formatPrice(p.price) : undefined,
    badge: p.badge ? { label: p.badge.label, variant: p.badge.type } : undefined,
  };
}

/**
 * Grille de produits avec bouton « Voir plus » (load-more côté client).
 * Réinitialisée via la prop `key` dans la page parente lors d'un changement de filtre.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Product[]} props.initialProducts
 * @param {import("@/lib/types").PaginationMeta|null} props.pagination
 * @param {import("@/lib/types").ProductFilters} props.apiFilters
 */
export default function ProductsSection({ initialProducts, pagination, apiFilters }) {
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(pagination?.current_page ?? 1);
  const [lastPage] = useState(pagination?.last_page ?? 1);
  const [loading, setLoading] = useState(false);

  const hasMore = currentPage < lastPage;

  const hasActiveFilters = Boolean(
    apiFilters.size || apiFilters.color || apiFilters.price_min ||
    apiFilters.price_max || apiFilters.in_stock
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const json = await apiFetch("/products", {
        query: { ...apiFilters, page: currentPage + 1 },
        cache: "no-store",
      });
      setProducts((prev) => [...prev, ...(json?.data ?? [])]);
      setCurrentPage((p) => p + 1);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, apiFilters]);

  if (products.length === 0) {
    return (
      <EmptyState
        hasFilters={hasActiveFilters}
        resetHref={hasActiveFilters ? pathname : undefined}
      />
    );
  }

  return (
    <div className="py-8">
      {/* Grille : 2 colonnes mobile / 3 tablette / 4 ordinateur, gouttière 24px */}
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard {...toCardProps(product)} />
          </li>
        ))}
      </ul>

      {/* Bouton « Voir plus » */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex min-w-[160px] items-center justify-center rounded-button border border-cognac px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Chargement…
              </>
            ) : (
              "Voir plus"
            )}
          </button>
        </div>
      )}

      {/* Compteur final quand tout est chargé */}
      {!hasMore && products.length > 0 && (
        <p className="mt-10 text-center font-body text-sm text-taupe">
          {products.length} article{products.length > 1 ? "s" : ""} au total
        </p>
      )}
    </div>
  );
}
