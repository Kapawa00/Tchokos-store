import Image from "next/image";
import { mediaUrl, IMAGE_FALLBACK } from "@/lib/media";
import { formatPrice } from "@/lib/format";

/**
 * Récapitulatif compact des articles sur la page commande.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Cart} props.cart
 */
export default function CheckoutSummary({ cart }) {
  return (
    <div className="rounded-card border border-sand bg-offwhite p-6">
      <h2 className="mb-4 font-display text-base font-semibold text-espresso">
        Votre commande
      </h2>

      {/* Liste compacte des articles */}
      <ul className="space-y-3">
        {cart.items.map((item) => {
          const imageUrl = mediaUrl(item.product.image, IMAGE_FALLBACK);
          const variantLabel = [
            item.variant.size ? `P.${item.variant.size}` : null,
            item.variant.color ?? null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.product.name}
                  width={48}
                  height={60}
                  className="rounded object-cover"
                  style={{ width: 48, height: 60 }}
                />
                {/* Badge quantité */}
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-1 font-body text-[10px] font-semibold text-cream">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-xs font-semibold text-espresso">
                  {item.product.name}
                </p>
                {variantLabel && (
                  <p className="font-body text-[10px] text-taupe">{variantLabel}</p>
                )}
              </div>
              <p className="shrink-0 font-body text-xs font-semibold text-espresso">
                {formatPrice(item.line_total)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Totaux */}
      <dl className="mt-5 space-y-2 border-t border-sand pt-4 font-body text-sm">
        <div className="flex justify-between text-xs">
          <dt className="text-taupe">Sous-total</dt>
          <dd className="font-semibold text-espresso">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt className="text-taupe">Livraison</dt>
          <dd className="italic text-taupe">À calculer</dd>
        </div>
        <div className="flex justify-between border-t border-sand pt-2">
          <dt className="font-semibold text-espresso">Total estimé</dt>
          <dd className="font-bold text-espresso">{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
