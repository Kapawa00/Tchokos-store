import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { getServerUser } from "@/lib/api.server";
import { Container, Breadcrumb, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { mediaUrl, IMAGE_FALLBACK } from "@/lib/media";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartSection from "@/components/product/AddToCartSection";
import WholesaleCallout from "@/components/product/WholesaleCallout";
import ProductAccordion from "@/components/product/ProductAccordion";
import SimilarProducts from "@/components/product/SimilarProducts";
import MobileActionBar from "@/components/product/MobileActionBar";

// Page rendue à la demande : getServerUser() lit les cookies (next/headers),
// une Request-time API, ce qui force le rendu dynamique par requête — comme
// searchParams sur /boutique. Combiner ça avec generateStaticParams (SSG)
// déclenche une erreur DYNAMIC_SERVER_USAGE, d'où sa suppression ici. Le
// cache 10 min reste assuré au niveau de l'appel API (REVALIDATE.product
// dans lib/catalog.js), donc la fraîcheur des données ne dépend pas d'un
// cache de route.

// ─── Métadonnées SEO ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Produit introuvable — Tchokos SARL" };
  }

  const rawDesc = product.description
    ? product.description.replace(/<[^>]+>/g, "").slice(0, 160)
    : `${product.name} disponible chez Tchokos SARL, Akwa Douala. Paiement Orange Money & MTN MoMo.`;

  const imageUrl = mediaUrl(
    product.media?.find((m) => m.type === "image")?.url ?? null,
    IMAGE_FALLBACK
  );

  return {
    title: `${product.name} — Tchokos SARL`,
    description: rawDesc,
    openGraph: {
      title: product.name,
      description: rawDesc,
      images: [{ url: imageUrl, width: 640, height: 800, alt: product.name }],
      type: "website",
    },
  };
}

// ─── Données structurées JSON-LD ──────────────────────────────────────────────

/**
 * Construit le schema.org Product pour le référencement enrichi (rich snippets).
 * @param {import("@/lib/types").ProductDetail} product
 * @param {string} canonicalUrl
 */
function buildJsonLd(product, canonicalUrl) {
  const images = (product.media ?? [])
    .filter((m) => m.type === "image")
    .map((m) => mediaUrl(m.url));

  if (images.length === 0) images.push(IMAGE_FALLBACK);

  const price = product.promo_price ?? product.price;
  const hasStock = (product.variants ?? []).some((v) => v.in_stock) ?? true;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description:
      product.description?.replace(/<[^>]+>/g, "") ?? product.name,
    brand: { "@type": "Brand", name: "Tchokos SARL" },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "XAF",
      price: parseFloat(String(price)).toFixed(0),
      availability: hasStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Tchokos SARL",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Akwa",
          addressLocality: "Douala",
          addressCountry: "CM",
        },
      },
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Appels parallèles : produit + utilisateur courant (pour le rôle grossiste).
  const [product, user] = await Promise.all([
    getProduct(slug),
    getServerUser(),
  ]);

  if (!product) notFound();

  // Résolution du rôle grossiste
  const role = user?.role ?? null;
  const wholesaleStatus = user?.wholesale_account?.status ?? "none";
  const isApprovedWholesale = role === "wholesaler" && wholesaleStatus === "approved";
  const isPendingWholesale = role === "wholesaler" && wholesaleStatus === "pending";
  const isStaff = role === "admin" || role === "manager";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tchokos.cm";
  const canonicalUrl = `${siteUrl}/produit/${slug}`;

  const hasPromo = Boolean(product.promo_price);
  const displayPrice = formatPrice(hasPromo ? product.promo_price : product.price);

  // Fil d'Ariane
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/boutique" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/boutique/${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <>
      {/* Données structurées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(product, canonicalUrl)),
        }}
      />

      <Container className="py-6 sm:py-10">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumb} />
        </div>

        {/* ── Grille 2 colonnes (lg+) ── */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 xl:grid-cols-[55%_1fr]">

          {/* Colonne gauche : galerie */}
          <ProductGallery media={product.media ?? []} productName={product.name} />

          {/* Colonne droite : nom, prix, variantes, actions */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">

            {/* En-tête produit */}
            <div>
              {product.badge && (
                <Badge
                  variant={product.badge.type === "new" ? "new" : "discount"}
                  className="mb-3"
                >
                  {product.badge.label}
                </Badge>
              )}

              <h1 className="font-display text-2xl font-bold leading-snug text-espresso sm:text-3xl">
                {product.name}
              </h1>

              {/* Prix */}
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="font-body text-2xl font-bold text-espresso">
                  {displayPrice}
                </span>
                {hasPromo && (
                  <span className="font-body text-base font-normal text-bordeaux line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Sélecteurs variantes + panier (client) */}
            <AddToCartSection product={product} />

            {/* Encadré grossiste (masqué pour le staff admin/manager) */}
            {!isStaff && (
              <WholesaleCallout
                isApproved={isApprovedWholesale}
                isPending={isPendingWholesale}
              />
            )}
          </div>
        </div>

        {/* ── Accordéon (description, matière, livraison) ── */}
        <div className="mt-12 border-t border-sand pt-8">
          <ProductAccordion description={product.description ?? null} />
        </div>

        {/* ── Produits similaires ── */}
        <SimilarProducts products={product.similar_products ?? []} />
      </Container>

      {/* Barre d'action collée en bas sur mobile */}
      <MobileActionBar price={displayPrice} />
    </>
  );
}
