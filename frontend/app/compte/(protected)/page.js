import Link from "next/link";
import { getServerUser, getServerOrders } from "@/lib/api.server";
import { getWholesaleStatus } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { PackageIcon, HeartIcon, BuildingStorefrontIcon, BellIcon, ClockIcon, CheckCircleIcon, TruckIcon } from "@/components/icons";

export const metadata = { title: "Mon compte — Tchokos SARL" };
export const dynamic = "force-dynamic";

/** @type {Record<string, { label: string, color: string, Icon: any }>} */
const STATUS_MAP = {
  pending_payment: { label: "En attente de paiement", color: "text-camel", Icon: ClockIcon },
  paid: { label: "Payée", color: "text-sage", Icon: CheckCircleIcon },
  preparing: { label: "En préparation", color: "text-cognac", Icon: PackageIcon },
  shipped: { label: "Expédiée", color: "text-cognac", Icon: TruckIcon },
  delivered: { label: "Livrée", color: "text-sage", Icon: CheckCircleIcon },
  cancelled: { label: "Annulée", color: "text-bordeaux", Icon: ClockIcon },
};

export default async function DashboardPage() {
  const [user, ordersResult, wholesale] = await Promise.allSettled([
    getServerUser(),
    getServerOrders({ page: 1 }),
    getWholesaleStatus(),
  ]);

  const orders = ordersResult.status === "fulfilled" ? (ordersResult.value?.items ?? []) : [];
  const recentOrders = orders.slice(0, 3);
  const totalOrders = ordersResult.status === "fulfilled" ? (ordersResult.value?.pagination?.total ?? orders.length) : 0;
  const wholesaleData = wholesale.status === "fulfilled" ? wholesale.value : null;

  const SHORTCUTS = [
    { href: "/compte/commandes", label: "Mes commandes", icon: PackageIcon, count: totalOrders || null },
    { href: "/compte/favoris", label: "Mes favoris", icon: HeartIcon },
    { href: "/compte/grossiste", label: "Espace grossiste", icon: BuildingStorefrontIcon },
    { href: "/compte/notifications", label: "Notifications push", icon: BellIcon },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-espresso">
        Bonjour{user.status === "fulfilled" && user.value ? `, ${user.value.name.split(" ")[0]}` : ""} 👋
      </h1>

      {/* ── Raccourcis ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SHORTCUTS.map(({ href, label, icon: Icon, count }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-3 rounded-card border border-sand bg-offwhite p-5 text-center transition-all hover:border-espresso hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand/60 transition-colors group-hover:bg-espresso/10">
              <Icon className="h-5 w-5 text-taupe group-hover:text-espresso" />
            </div>
            <div>
              <p className="font-body text-xs font-semibold text-espresso">{label}</p>
              {count != null && (
                <p className="font-body text-xs text-taupe">{count} commande{count > 1 ? "s" : ""}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Commandes récentes ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-espresso">
            Commandes récentes
          </h2>
          {totalOrders > 3 && (
            <Link href="/compte/commandes" className="font-body text-xs text-cognac hover:underline">
              Voir tout ({totalOrders})
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-card border border-dashed border-sand py-10 text-center">
            <PackageIcon className="mx-auto mb-3 h-8 w-8 text-taupe/50" />
            <p className="font-body text-sm text-taupe">Aucune commande pour l&apos;instant.</p>
            <Link
              href="/boutique"
              className="mt-3 inline-block font-body text-sm font-medium text-cognac hover:underline"
            >
              Explorer la boutique →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const { label, color, Icon } = STATUS_MAP[order.status] ?? STATUS_MAP.pending_payment;
              return (
                <Link
                  key={order.reference}
                  href={`/compte/commandes/${order.reference}`}
                  className="flex items-center justify-between gap-4 rounded-card border border-sand bg-offwhite px-5 py-4 transition-all hover:border-espresso hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-espresso truncate">
                      {order.reference}
                    </p>
                    <div className={`mt-0.5 flex items-center gap-1.5 font-body text-xs ${color}`}>
                      <Icon className="h-3 w-3" /> {label}
                    </div>
                  </div>
                  <p className="shrink-0 font-body text-sm font-bold text-espresso">
                    {formatPrice(order.total)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Statut grossiste (si demande en cours) ── */}
      {wholesaleData && wholesaleData.status !== "none" && wholesaleData.status !== "approved" && (
        <section className="rounded-card border border-camel/30 bg-camel/5 p-5">
          <div className="flex items-center gap-3">
            <BuildingStorefrontIcon className="h-5 w-5 shrink-0 text-camel" />
            <div>
              <p className="font-body text-sm font-semibold text-espresso">
                {wholesaleData.status === "pending" ? "Demande grossiste en cours d'examen" : "Demande grossiste non retenue"}
              </p>
              <Link href="/compte/grossiste" className="font-body text-xs text-cognac hover:underline">
                Voir les détails →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
