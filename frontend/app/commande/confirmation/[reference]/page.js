import Link from "next/link";
import { getServerUser } from "@/lib/api.server";
import { getOrder } from "@/lib/orders";
import { Container } from "@/components/ui";
import { CheckCircleIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { PaymentSection } from "@/components/payment";

// Page dynamique : données de commande propres à chaque utilisateur.
export const dynamic = "force-dynamic";

/** @type {Record<string, string>} */
const STATUS_LABELS = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

/** @type {Record<string, string>} */
const STATUS_COLORS = {
  pending_payment: "bg-camel/15 text-espresso",
  paid: "bg-sage/15 text-sage",
  preparing: "bg-cognac/10 text-cognac",
  shipped: "bg-cognac/10 text-cognac",
  delivered: "bg-sage/15 text-sage",
  cancelled: "bg-bordeaux/10 text-bordeaux",
};

/**
 * @param {Object} props
 * @param {Promise<{ reference: string }>} props.params
 * @param {Promise<{ phone?: string }>} props.searchParams
 */
export default async function ConfirmationPage({ params, searchParams }) {
  const { reference } = await params;
  const { phone } = await searchParams;

  const user = await getServerUser();

  let order = null;
  try {
    order = await getOrder(reference, { phone });
  } catch {
    // API indisponible — on affiche quand même la page avec la référence.
  }

  const statusLabel = order ? STATUS_LABELS[order.status] ?? order.status : null;
  const statusColor = order ? STATUS_COLORS[order.status] ?? STATUS_COLORS.pending_payment : null;
  const total = order ? formatPrice(order.total) : null;

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-xl space-y-6">

        {/* ── Icône + titre ── */}
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage/10">
              <CheckCircleIcon className="h-10 w-10 text-sage" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            Commande confirmée !
          </h1>
          <p className="mt-2 font-body text-sm text-taupe">
            Merci pour votre confiance. Finalisez votre paiement ci-dessous.
          </p>
        </div>

        {/* ── Référence + statut + total ── */}
        <div className="rounded-card border border-sand bg-offwhite p-6 text-center">
          <p className="font-body text-[11px] uppercase tracking-widest text-taupe">
            Numéro de commande
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-espresso">
            {reference}
          </p>
          {statusLabel && (
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 font-body text-xs font-semibold ${statusColor}`}
            >
              {statusLabel}
            </span>
          )}
          {total && (
            <p className="mt-3 font-body text-sm text-taupe">
              Montant total :{" "}
              <strong className="text-espresso">{total}</strong>
            </p>
          )}
        </div>

        {/* ── Bloc de paiement (client) ── */}
        <PaymentSection
          order={order}
          reference={reference}
          phone={phone ?? null}
        />

        {/* ── Prochaines étapes (affichées tant que non payé) ── */}
        {order?.status !== "paid" && (
          <div className="rounded-card border border-sand bg-offwhite p-6">
            <h2 className="mb-4 font-body text-sm font-semibold text-espresso">
              Que se passe-t-il ensuite ?
            </h2>
            <ol className="space-y-3">
              {[
                "Choisissez votre moyen de paiement et suivez les instructions.",
                "Notre équipe valide votre paiement (sous 24 h ouvrées).",
                "Votre commande est préparée et expédiée sous 1–3 jours ouvrés.",
                "Vous recevez une notification dès l'expédition.",
              ].map((etape, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-body text-sm text-taupe"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-espresso font-body text-xs font-bold text-cream">
                    {i + 1}
                  </span>
                  {etape}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Actions secondaires ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/boutique"
            className="rounded-button border border-cognac px-6 py-3 text-center font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            Continuer mes achats
          </Link>
          {user && (
            <Link
              href="/compte/commandes"
              className="rounded-button bg-espresso px-6 py-3 text-center font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            >
              Voir mes commandes
            </Link>
          )}
        </div>
      </div>
    </Container>
  );
}
