import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/api.server";
import { getOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { CheckCircleIcon, ClockIcon, PackageIcon, TruckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

/** @type {Record<string, { label: string, color: string, bg: string, Icon: any }>} */
const STATUS_MAP = {
  pending_payment: { label: "En attente de paiement", color: "text-camel", bg: "bg-camel/10 border-camel/30", Icon: ClockIcon },
  paid:            { label: "Payée",                  color: "text-sage",  bg: "bg-sage/10 border-sage/30",   Icon: CheckCircleIcon },
  preparing:       { label: "En préparation",         color: "text-cognac",bg: "bg-cognac/10 border-cognac/30", Icon: PackageIcon },
  shipped:         { label: "Expédiée",               color: "text-cognac",bg: "bg-cognac/10 border-cognac/30", Icon: TruckIcon },
  delivered:       { label: "Livrée",                 color: "text-sage",  bg: "bg-sage/10 border-sage/30",   Icon: CheckCircleIcon },
  cancelled:       { label: "Annulée",                color: "text-bordeaux", bg: "bg-bordeaux/10 border-bordeaux/30", Icon: ClockIcon },
};

/**
 * @param {Object} props
 * @param {Promise<{ reference: string }>} props.params
 */
export default async function OrderDetailPage({ params }) {
  const { reference } = await params;
  const user = await getServerUser();

  let order = null;
  try {
    order = await getOrder(reference, { token: undefined });
  } catch {
    notFound();
  }

  if (!order) notFound();

  const { label, color, bg, Icon } = STATUS_MAP[order.status] ?? STATUS_MAP.pending_payment;

  const date = order.created_at
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.created_at))
    : null;

  return (
    <div className="space-y-6">
      {/* Navigation retour */}
      <Link href="/compte/commandes" className="inline-flex items-center gap-1.5 font-body text-sm text-taupe hover:text-espresso">
        ← Retour à mes commandes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-espresso">{reference}</h1>
          {date && <p className="mt-0.5 font-body text-xs text-taupe">Passée le {date}</p>}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-semibold ${color} ${bg}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
      </div>

      {/* ── Articles ── */}
      <section className="rounded-card border border-sand bg-offwhite">
        <div className="border-b border-sand px-5 py-3">
          <h2 className="font-body text-sm font-semibold text-espresso">Articles commandés</h2>
        </div>
        <div className="divide-y divide-sand">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-espresso truncate">{item.product_name}</p>
                {item.variant_label && (
                  <p className="font-body text-xs text-taupe">{item.variant_label}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-body text-xs text-taupe">×{item.quantity}</p>
                <p className="font-body text-sm font-semibold text-espresso">{formatPrice(item.line_total)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="border-t border-sand px-5 py-4 space-y-1">
          <div className="flex justify-between font-body text-sm text-taupe">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-body text-sm text-taupe">
            <span>Livraison</span>
            <span>{order.shipping_fee === "0.00" ? "À calculer" : formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-sand pt-2 font-body text-base font-bold text-espresso">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* ── Informations de livraison ── */}
      <section className="rounded-card border border-sand bg-offwhite p-5">
        <h2 className="mb-3 font-body text-sm font-semibold text-espresso">Informations de livraison</h2>
        <dl className="space-y-1.5 font-body text-sm">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-taupe">Destinataire</dt>
            <dd className="text-espresso">{order.customer_name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-taupe">Téléphone</dt>
            <dd className="text-espresso">{order.customer_phone}</dd>
          </div>
          {order.customer_email && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-taupe">E-mail</dt>
              <dd className="text-espresso">{order.customer_email}</dd>
            </div>
          )}
          {order.notes && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-taupe">Notes</dt>
              <dd className="text-espresso whitespace-pre-wrap">{order.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Action paiement si non payé ── */}
      {order.status === "pending_payment" && (
        <div className="rounded-card border border-camel/30 bg-camel/5 p-5 text-center">
          <p className="mb-3 font-body text-sm text-espresso">
            Votre commande est en attente de paiement.
          </p>
          <Link
            href={`/commande/confirmation/${reference}`}
            className="inline-block rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac"
          >
            Finaliser le paiement
          </Link>
        </div>
      )}
    </div>
  );
}
