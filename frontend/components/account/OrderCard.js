import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ClockIcon, CheckCircleIcon, PackageIcon, TruckIcon } from "@/components/icons";

/** @type {Record<import("@/lib/types").OrderStatus, { label: string, color: string, Icon: (p:any)=>any }>} */
const STATUS_MAP = {
  pending_payment: { label: "En attente de paiement", color: "text-camel bg-camel/10 border-camel/30", Icon: ClockIcon },
  paid: { label: "Payée", color: "text-sage bg-sage/10 border-sage/30", Icon: CheckCircleIcon },
  preparing: { label: "En préparation", color: "text-cognac bg-cognac/10 border-cognac/30", Icon: PackageIcon },
  shipped: { label: "Expédiée", color: "text-cognac bg-cognac/10 border-cognac/30", Icon: TruckIcon },
  delivered: { label: "Livrée", color: "text-sage bg-sage/10 border-sage/30", Icon: CheckCircleIcon },
  cancelled: { label: "Annulée", color: "text-bordeaux bg-bordeaux/10 border-bordeaux/30", Icon: ClockIcon },
};

/**
 * Carte récapitulative d'une commande dans la liste.
 * @param {{ order: import("@/lib/types").Order }} props
 */
export default function OrderCard({ order }) {
  const { label, color, Icon } = STATUS_MAP[order.status] ?? STATUS_MAP.pending_payment;

  const date = order.created_at
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(order.created_at)
      )
    : null;

  const itemCount = order.items?.length ?? 0;

  return (
    <article className="rounded-card border border-sand bg-offwhite transition-shadow hover:shadow-md">
      <div className="p-5">
        {/* En-tête */}
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-sm font-bold text-espresso">{order.reference}</p>
            {date && <p className="font-body text-xs text-taupe">{date}</p>}
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-semibold ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
        </div>

        {/* Articles (résumé) */}
        {order.items && order.items.length > 0 && (
          <p className="mb-3 font-body text-xs text-taupe line-clamp-1">
            {order.items.map((it) => `${it.product_name}${it.variant_label ? ` — ${it.variant_label}` : ""} ×${it.quantity}`).join(", ")}
          </p>
        )}

        {/* Pied */}
        <div className="flex items-center justify-between">
          <span className="font-body text-sm font-semibold text-espresso">
            {formatPrice(order.total)}
          </span>
          <Link
            href={`/compte/commandes/${order.reference}`}
            className="rounded-button border border-cognac px-4 py-1.5 font-body text-xs font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream"
          >
            Voir le détail
          </Link>
        </div>
      </div>
    </article>
  );
}
