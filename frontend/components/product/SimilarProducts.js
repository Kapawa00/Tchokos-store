import ProductCard from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

/**
 * Rangée de 4 produits similaires sous la fiche produit.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Product[]} props.products
 */
export default function SimilarProducts({ products }) {
  if (!products?.length) return null;

  return (
    <section className="mt-16 border-t border-sand pt-10">
      <h2 className="mb-6 font-display text-xl font-semibold text-espresso sm:text-2xl">
        Articles similaires
      </h2>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {products.slice(0, 4).map((product) => {
          const hasPromo = Boolean(product.promo_price);
          return (
            <li key={product.id}>
              <ProductCard
                name={product.name}
                href={`/produit/${product.slug}`}
                imageSrc={mediaUrl(product.primary_image)}
                imageAlt={product.name}
                price={formatPrice(hasPromo ? product.promo_price : product.price)}
                oldPrice={hasPromo ? formatPrice(product.price) : undefined}
                badge={
                  product.badge
                    ? { label: product.badge.label, variant: product.badge.type }
                    : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
