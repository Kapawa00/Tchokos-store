import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/catalog";
import { Container, Breadcrumb } from "@/components/ui";
import CategoryBanner from "@/components/catalog/CategoryBanner";
import FiltersClient from "@/components/catalog/FiltersClient";
import ProductsSection from "@/components/catalog/ProductsSection";

// Page rendue à la demande (searchParams pour les filtres = rendu dynamique
// obligatoire côté Next.js). Le cache 5 min reste assuré au niveau des appels
// API (cf. REVALIDATE.categories / REVALIDATE.products dans lib/catalog.js),
// donc la fraîcheur des données ne dépend pas d'un cache de route ici.
// ⚠️ Ne pas réintroduire generateStaticParams() sur cette route : combiné à la
// lecture de searchParams, cela déclenche une erreur DYNAMIC_SERVER_USAGE au
// moment du build/reval (searchParams force le rendu dynamique par requête).

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Traduit les paramètres d'URL français en filtres API anglais.
 * Séparation nette entre le nom des params URL (pour le SEO/UX) et les
 * noms des champs API (convention backend Laravel).
 *
 * @param {Record<string,string>} sp - searchParams attendus (objet plat).
 * @param {string|null} categorySlug
 * @returns {import("@/lib/types").ProductFilters}
 */
function buildApiFilters(sp, categorySlug) {
  /** @type {import("@/lib/types").ProductFilters} */
  const f = { per_page: 12, sort: "newest" };
  if (categorySlug) f.category = categorySlug;
  if (sp.tri === "prix_asc") f.sort = "price_asc";
  else if (sp.tri === "prix_desc") f.sort = "price_desc";
  if (sp.pointure) f.size = sp.pointure;
  if (sp.couleur) f.color = sp.couleur;
  if (sp.min_prix) f.price_min = parseInt(sp.min_prix, 10);
  if (sp.max_prix) f.price_max = parseInt(sp.max_prix, 10);
  if (sp.dispo === "1") f.in_stock = true;
  return f;
}

/**
 * @param {import("@/lib/types").Category|null} family
 * @param {import("@/lib/types").Category|null} section
 * @returns {{ label: string, href?: string }[]}
 */
function buildBreadcrumb(family, section) {
  const items = [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/boutique" },
  ];
  if (family && section) {
    items.push({ label: family.name, href: `/boutique/${family.slug}` });
    items.push({ label: section.name });
  } else if (family) {
    items.push({ label: family.name });
  }
  return items;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const parts = slug ?? [];

  if (parts.length === 0) {
    return {
      title: "Boutique — Tchokos SARL",
      description:
        "Toute notre collection de chaussures, sacs, ceintures et montres à Akwa, Douala.",
    };
  }

  const categories = await getCategories();
  const family = categories.find((c) => c.slug === parts[0]);
  const section = parts[1]
    ? family?.children?.find((c) => c.slug === parts[1])
    : null;
  const active = section ?? family;

  return {
    title: active ? `${active.name} — Tchokos SARL` : "Boutique — Tchokos SARL",
    description:
      active?.description ??
      `Découvrez notre sélection ${active?.name ?? ""} à Douala. Paiement Orange Money & MTN MoMo.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BoutiquePage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const parts = slug ?? [];

  // Résolution de la catégorie active depuis le slug URL
  const categories = await getCategories();
  const family = parts[0] ? categories.find((c) => c.slug === parts[0]) : null;
  const section = parts[1]
    ? family?.children?.find((c) => c.slug === parts[1])
    : null;

  // 404 si le slug est renseigné mais inconnu
  if (parts.length > 0 && !family) notFound();
  if (parts.length > 1 && !section) notFound();

  const activeCategory = section ?? family;
  const apiFilters = buildApiFilters(sp, activeCategory?.slug ?? null);

  const { items: initialProducts, pagination } = await getProducts(apiFilters);
  const breadcrumb = buildBreadcrumb(family, section);

  // Clé de remontage du ProductsSection au changement de filtre
  const filterKey = JSON.stringify(apiFilters);

  return (
    <>
      <CategoryBanner category={activeCategory} parent={section ? family : null} />

      <Container>
        <div className="py-3">
          <Breadcrumb items={breadcrumb} />
        </div>

        {/*
          FiltersClient utilise useSearchParams() et doit être dans <Suspense>.
          Fallback invisible : la barre s'affiche après hydratation (instant sur SSR).
        */}
        <Suspense fallback={<FilterBarFallback />}>
          <FiltersClient totalCount={pagination?.total ?? null} />
        </Suspense>

        <ProductsSection
          key={filterKey}
          initialProducts={initialProducts}
          pagination={pagination}
          apiFilters={apiFilters}
        />
      </Container>
    </>
  );
}

/** Fallback statique pendant l'hydratation de la barre de filtres. */
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
