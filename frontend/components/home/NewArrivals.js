import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "./SectionHeading";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

/**
 * Convertit un produit de l'API en props pour ProductCard (prix formaté,
 * gestion promo et badge).
 * @param {import("@/lib/types").Product} product
 */
function toCardProps(product) {
  const hasPromo = Boolean(product.promo_price);
  return {
    name: product.name,
    href: `/produit/${product.slug}`,
    imageSrc: mediaUrl(product.primary_image),
    imageAlt: product.name,
    price: formatPrice(hasPromo ? product.promo_price : product.price),
    oldPrice: hasPromo ? formatPrice(product.price) : undefined,
    badge: product.badge
      ? { label: product.badge.label, variant: product.badge.type }
      : undefined,
  };
}

/**
 * Nouveautés : grille de 4 cartes produit (carrousel à défilement horizontal
 * sur mobile, grille 4 colonnes sur ordinateur) + lien « Tout voir ».
 *
 * @param {Object} props
 * @param {import("@/lib/types").Product[]} props.products
 */
export default function NewArrivals({ products }) {
  if (!products?.length) return null;

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading title="Nouveautés" linkHref="/nouveautes" />

      {/* Mobile : défilement horizontal avec accroche (snap). md+ : grille. */}
      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[60%] shrink-0 snap-start sm:w-[42%] md:w-auto"
          >
            <ProductCard {...toCardProps(product)} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
