import Image from "next/image";
import Link from "next/link";
import Card from "./Card";
import Badge from "./Badge";

const BADGE_VARIANTS = {
  new: "new",
  discount: "discount",
};

/**
 * Carte produit : image portrait 4:5, nom sur 2 lignes max, prix en bas.
 * Toutes les cartes d'une grille ont la même hauteur (flex + justify-between).
 *
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.imageSrc
 * @param {string} props.imageAlt
 * @param {string} props.href
 * @param {string} props.price - prix formaté à afficher (ex. "12 500 FCFA")
 * @param {string} [props.oldPrice] - prix barré, affiché si une promo s'applique
 * @param {{ label: string, variant: "new"|"discount" }} [props.badge]
 */
export default function ProductCard({
  name,
  imageSrc,
  imageAlt,
  href,
  price,
  oldPrice,
  badge,
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_4px_16px_rgba(42,33,27,0.14)]">
        <div className="relative aspect-[4/5] w-full bg-cream">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          {badge && (
            <Badge
              variant={BADGE_VARIANTS[badge.variant]}
              className="absolute left-2 top-2"
            >
              {badge.label}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <p className="line-clamp-2 font-body text-sm text-espresso">{name}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-body text-base font-bold text-espresso">{price}</span>
            {oldPrice && (
              <span className="font-body text-sm text-bordeaux line-through">
                {oldPrice}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
