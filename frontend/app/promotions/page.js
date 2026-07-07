import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { Container, Breadcrumb } from "@/components/ui";
import FiltersClient from "@/components/catalog/FiltersClient";
import ProductsSection from "@/components/catalog/ProductsSection";

export const revalidate = 300;

export const metadata = {
  title: "Promotions — Tchokos SARL",
  description:
    "Profitez de nos offres et promotions sur les chaussures, sacs, ceintures et montres. Prix réduits disponibles à Douala. Paiement Orange Money & MTN MoMo.",
};

const BREADCRUMB = [
  { label: "Accueil", href: "/" },
  { label: "Promotions" },
];

/**
 * @param {Record<string,string>} sp
 * @returns {import("@/lib/types").ProductFilters}
 */
function buildApiFilters(sp) {
  /** @type {import("@/lib/types").ProductFilters} */
  // has_promo=1 filtre côté API les produits ayant un promo_price actif.
  const f = { per_page: 12, sort: "newest", has_promo: true };
  if (sp.tri === "prix_asc") f.sort = "price_asc";
  else if (sp.tri === "prix_desc") f.sort = "price_desc";
  if (sp.pointure) f.size = sp.pointure;
  if (sp.couleur) f.color = sp.couleur;
  if (sp.min_prix) f.price_min = parseInt(sp.min_prix, 10);
  if (sp.max_prix) f.price_max = parseInt(sp.max_prix, 10);
  if (sp.dispo === "1") f.in_stock = true;
  return f;
}

export default async function PromotionsPage({ searchParams }) {
  const sp = await searchParams;
  const apiFilters = buildApiFilters(sp);
  const { items: initialProducts, pagination } = await getProducts(apiFilters);
  const filterKey = JSON.stringify(apiFilters);

  return (
    <>
      {/* ─── Bannière ─── */}
      <div className="relative flex h-48 flex-col items-center justify-end overflow-hidden sm:h-64"
        style={{ backgroundColor: "#5c1f1f" }}>
        {/* Voile dégradé */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, #2A211B 0%, rgba(90,31,31,0.7) 50%, rgba(90,31,31,0.2) 100%)",
          }}
        />
        <div className="relative pb-10 text-center sm:pb-14">
          {/* Badge accent */}
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-bordeaux/60 bg-bordeaux/30 px-3 py-1 font-body text-xs font-semibold uppercase tracking-widest text-cream">
            <span aria-hidden="true">%</span>
            Prix réduits
          </p>
          <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
            Promotions
          </h1>
          <p className="mt-2 font-body text-sm text-cream/75">
            Nos meilleures offres du moment — stocks limités
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
          <EmptyPromotions />
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

function hasActiveFilters(sp) {
  return !!(sp.tri || sp.pointure || sp.couleur || sp.min_prix || sp.max_prix || sp.dispo);
}

function EmptyPromotions() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-bordeaux/10 font-display text-3xl text-bordeaux"
        aria-hidden="true"
      >
        %
      </span>
      <div>
        <p className="font-display text-xl font-semibold text-espresso">
          Aucune promotion en cours
        </p>
        <p className="mt-2 font-body text-sm text-taupe">
          Nos prochaines offres arrivent bientôt. Activez les notifications push pour être prévenu en premier !
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/boutique"
          className="inline-flex items-center justify-center gap-2 rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        >
          Voir tout le catalogue
        </Link>
        <Link
          href="/nouveautes"
          className="inline-flex items-center justify-center gap-2 rounded-button border border-cognac px-6 py-3 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        >
          Voir les nouveautés
        </Link>
      </div>
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
