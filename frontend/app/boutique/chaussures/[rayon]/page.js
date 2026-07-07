import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/catalog";
import { Container, Breadcrumb } from "@/components/ui";
import CategoryBanner from "@/components/catalog/CategoryBanner";
import FiltersClient from "@/components/catalog/FiltersClient";
import ProductsSection from "@/components/catalog/ProductsSection";

// ISR 5 min.
export const revalidate = 300;
export const dynamicParams = false; // Uniquement les 3 rayons ci-dessous.

// ─── Données statiques des rayons ────────────────────────────────────────────
// Ces données servent de repli si l'API ne renvoie pas encore les catégories
// (base de données vide en développement, ou backend indisponible lors du build).

const RAYONS = {
  hommes: {
    name: "Chaussures Hommes",
    slug: "hommes",
    type: "section",
    position: 1,
    description:
      "Mocassins, richelieus, derbies, boots et sneakers — le style masculin selon Tchokos.",
    banner_image_url: null,
    banner_video_url: null,
  },
  femmes: {
    name: "Chaussures Femmes",
    slug: "femmes",
    type: "section",
    position: 2,
    description:
      "Escarpins, sandales, boots, ballerines et mules — l'élégance féminine à chaque pas.",
    banner_image_url: null,
    banner_video_url: null,
  },
  enfants: {
    name: "Chaussures Enfants",
    slug: "enfants",
    type: "section",
    position: 3,
    description:
      "Chaussures confortables, solides et stylées pour les petits et les grands enfants.",
    banner_image_url: null,
    banner_video_url: null,
  },
};

const PARENT_FALLBACK = {
  id: null,
  name: "Chaussures",
  slug: "chaussures",
  type: "family",
  position: 1,
  description: null,
  banner_image_url: null,
  banner_video_url: null,
};

// ─── Pré-génération des routes statiques ─────────────────────────────────────

export async function generateStaticParams() {
  return Object.keys(RAYONS).map((rayon) => ({ rayon }));
}

// ─── Métadonnées ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { rayon } = await params;
  const section = RAYONS[rayon];
  if (!section) return {};
  return {
    title: `${section.name} — Tchokos SARL`,
    description: `${section.description} Paiement Orange Money & MTN MoMo à Douala.`,
  };
}

// ─── Helper filtres ───────────────────────────────────────────────────────────

/**
 * Traduit les paramètres URL français en filtres API anglais.
 * @param {Record<string,string>} sp
 * @param {string} categorySlug
 * @returns {import("@/lib/types").ProductFilters}
 */
function buildApiFilters(sp, categorySlug) {
  /** @type {import("@/lib/types").ProductFilters} */
  const f = { per_page: 12, sort: "newest", category: categorySlug };
  if (sp.tri === "prix_asc") f.sort = "price_asc";
  else if (sp.tri === "prix_desc") f.sort = "price_desc";
  if (sp.pointure) f.size = sp.pointure;
  if (sp.couleur) f.color = sp.couleur;
  if (sp.min_prix) f.price_min = parseInt(sp.min_prix, 10);
  if (sp.max_prix) f.price_max = parseInt(sp.max_prix, 10);
  if (sp.dispo === "1") f.in_stock = true;
  return f;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChaussuresRayonPage({ params, searchParams }) {
  const { rayon } = await params;
  const sp = await searchParams;

  // 404 si le segment ne correspond à aucun rayon connu.
  const fallback = RAYONS[rayon];
  if (!fallback) notFound();

  // Résolution depuis l'API (avec repli sur les données statiques ci-dessus).
  const categories = await getCategories();
  const chaussuresFamille = categories.find((c) => c.slug === "chaussures");
  const sectionApi = chaussuresFamille?.children?.find((c) => c.slug === rayon);

  const section = sectionApi ?? { id: null, ...fallback };
  const parent = chaussuresFamille ?? PARENT_FALLBACK;

  const apiFilters = buildApiFilters(sp, rayon);
  const { items: initialProducts, pagination } = await getProducts(apiFilters);
  const filterKey = JSON.stringify(apiFilters);

  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/boutique" },
    { label: parent.name, href: `/boutique/${parent.slug}` },
    { label: section.name },
  ];

  return (
    <>
      <CategoryBanner category={section} parent={parent} />

      <Container>
        <div className="py-3">
          <Breadcrumb items={breadcrumb} />
        </div>

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
