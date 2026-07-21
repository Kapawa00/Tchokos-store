import { getProducts } from "@/lib/catalog";
import { Container, Breadcrumb } from "@/components/ui";
import SearchBar from "@/components/catalog/SearchBar";
import ProductsSection from "@/components/catalog/ProductsSection";

// Page rendue à la demande : dépend de searchParams (terme saisi), donc pas de
// generateStaticParams/revalidate ici (cf. app/boutique/[[...slug]]/page.js,
// où mélanger les deux déclenche une erreur DYNAMIC_SERVER_USAGE).

export const metadata = {
  title: "Recherche — Tchokos SARL",
  description: "Recherchez un article parmi les chaussures, sacs, ceintures et montres Tchokos SARL.",
};

const breadcrumb = [
  { label: "Accueil", href: "/" },
  { label: "Recherche" },
];

export default async function RecherchePage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const apiFilters = { q, per_page: 12, sort: "newest" };
  const { items, pagination } = q
    ? await getProducts(apiFilters)
    : { items: [], pagination: null };

  return (
    <Container>
      <div className="py-3">
        <Breadcrumb items={breadcrumb} />
      </div>

      <div className="py-6">
        <h1 className="mb-5 font-display text-2xl font-bold text-espresso sm:text-3xl">
          {q ? `Résultats pour « ${q} »` : "Rechercher"}
        </h1>
        <SearchBar initialQuery={q} />
      </div>

      {q ? (
        <div className="pb-4">
          <ProductsSection
            key={q}
            initialProducts={items}
            pagination={pagination}
            apiFilters={apiFilters}
            emptyMessage={`Aucun article ne correspond à « ${q} ». Essayez un autre terme.`}
          />
        </div>
      ) : (
        <p className="pb-16 pt-2 font-body text-sm text-taupe">
          Saisissez un nom d'article (ex. « mocassin », « sac », « ceinture »).
        </p>
      )}
    </Container>
  );
}
