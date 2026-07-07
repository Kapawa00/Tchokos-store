import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { Container, Breadcrumb } from "@/components/ui";
import FiltersClient from "@/components/catalog/FiltersClient";
import ProductsSection from "@/components/catalog/ProductsSection";

export const revalidate = 300;

export const metadata = {
  title: "Nouveautés — Tchokos SARL",
  description:
    "Découvrez nos dernières arrivées : chaussures, sacs, ceintures et montres. Collections fraîches, livraison à Douala. Paiement Orange Money & MTN MoMo.",
};

const BREADCRUMB = [
  { label: "Accueil", href: "/" },
  { label: "Nouveautés" },
];

/**
 * @param {Record<string,string>} sp
 * @returns {import("@/lib/types").ProductFilters}
 */
function buildApiFilters(sp) {
  /** @type {import("@/lib/types").ProductFilters} */
  const f = { per_page: 12, sort: "newest", is_new: true };
  if (sp.tri === "prix_asc") f.sort = "price_asc";
  else if (sp.tri === "prix_desc") f.sort = "price_desc";
  if (sp.pointure) f.size = sp.pointure;
  if (sp.couleur) f.color = sp.couleur;
  if (sp.min_prix) f.price_min = parseInt(sp.min_prix, 10);
  if (sp.max_prix) f.price_max = parseInt(sp.max_prix, 10);
  if (sp.dispo === "1") f.in_stock = true;
  return f;
}

export default async function NouveautesPage({ searchParams }) {
  const sp = await searchParams;
  const apiFilters = buildApiFilters(sp);
  const { items: initialProducts, pagination } = await getProducts(apiFilters);
  const filterKey = JSON.stringify(apiFilters);

  return (
    <>
      {/* ─── Bannière ─── */}
      <div className="relative flex h-48 flex-col items-center justify-end overflow-hidden bg-espresso sm:h-64">
        {/* Voile dégradé */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/20"
        />
        <div className="relative pb-10 text-center sm:pb-14">
          {/* Badge accent */}
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/15 px-3 py-1 font-body text-xs font-semibold uppercase tracking-widest text-brass">
            <span aria-hidden="true">✦</span>
            Dernières arrivées
          </p>
          <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
            Nouveautés
          </h1>
          <p className="mt-2 font-body text-sm text-cream/75">
            Les dernières collections fraîchement arrivées chez Tchokos SARL
          </p>
        </div>
      </div>

      <Container>
        <div className="py-3">
          <Breadcrumb items={BREADCRUMB} />
        </div>

        <Suspense fallback={<FilterBarFallback />}>
          <FiltersClient totalCount={pagination?.total ?? null} />
        </Suspense>

        {initialProducts.length === 0 && !hasActiveFilters(sp) ? (
          <EmptyNouveautes />
        ) : (
          <ProductsSection
            key={filterKey}
            initialProducts={initialProducts}
            pagination={pagination}
            apiFilters={apiFilters}
          />
        )}
      </Container>
    </>
  );
}

/** Vérifie si des filtres sont actifs dans les searchParams. */
function hasActiveFilters(sp) {
  return !!(sp.tri || sp.pointure || sp.couleur || sp.min_prix || sp.max_prix || sp.dispo);
}

function EmptyNouveautes() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <span className="font-display text-5xl text-brass" aria-hidden="true">✦</span>
      <div>
        <p className="font-display text-xl font-semibold text-espresso">
          De nouvelles pièces arrivent bientôt
        </p>
        <p className="mt-2 font-body text-sm text-taupe">
          Notre équipe sélectionne les meilleures nouveautés pour vous. Revenez bientôt !
        </p>
      </div>
      <Link
        href="/boutique"
        className="inline-flex items-center gap-2 rounded-button border border-cognac px-6 py-3 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Voir tout le catalogue
      </Link>
    </div>
  );
}

function FilterBarFallback() {
  return (
    <div className="border-b border-sand py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 animate-pulse rounded-button bg-sand" />
        <div className="h-9 w-20 animate-pulse rounded-button bg-sand" />
        <div className="h-9 w-32 animate-pulse rounded-button bg-sand" />
      </div>
    </div>
  );
}
