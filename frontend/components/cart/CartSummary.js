import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink, buildCartMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Panneau récapitulatif à droite du panier.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Cart} props.cart
 * @param {() => void} props.onCheckout
 */
export default function CartSummary({ cart, onCheckout }) {
  const waHref = buildWhatsAppLink(buildCartMessage(cart.items, cart.subtotal));
  return (
    <div className="rounded-card border border-sand bg-offwhite p-6">
      <h2 className="font-display text-lg font-semibold text-espresso">
        Récapitulatif
      </h2>

      <dl className="mt-4 space-y-3 font-body text-sm">
        <div className="flex justify-between">
          <dt className="text-taupe">
            Sous-total ({cart.items_count} article{cart.items_count > 1 ? "s" : ""})
          </dt>
          <dd className="font-semibold text-espresso">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between border-t border-sand pt-3 text-xs">
          <dt className="text-taupe">Livraison</dt>
          <dd className="italic text-taupe">Calculée à la confirmation</dd>
        </div>
        <div className="flex justify-between border-t border-sand pt-3">
          <dt className="font-semibold text-espresso">Total estimé</dt>
          <dd className="font-bold text-espresso">{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-6 w-full rounded-button bg-espresso px-7 py-4 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Passer la commande
      </button>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-button border border-cognac px-7 py-3 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Commander sur WhatsApp
      </a>

      <p className="mt-3 text-center font-body text-xs text-taupe">
        Paiement Orange Money, MTN MoMo ou WhatsApp
      </p>

      <Link
        href="/boutique"
        className="mt-4 block text-center font-body text-xs text-taupe underline-offset-2 hover:text-cognac hover:underline"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}
