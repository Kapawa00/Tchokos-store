import Link from "next/link";
import { getServerOrders } from "@/lib/api.server";
import { OrderCard } from "@/components/account";
import { PackageIcon } from "@/components/icons";

export const metadata = { title: "Mes commandes — Tchokos SARL" };
export const dynamic = "force-dynamic";

/**
 * @param {Object} props
 * @param {Promise<{ page?: string }>} props.searchParams
 */
export default async function CommandesPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let orders = [];
  let pagination = null;
  try {
    const result = await getServerOrders({ page });
    orders = result.items;
    pagination = result.pagination;
  } catch {
    // API indisponible — affiche un état vide.
  }

  const totalPages = pagination?.last_page ?? 1;
  const currentPage = pagination?.current_page ?? page;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-espresso">Mes commandes</h1>
        {pagination?.total != null && (
          <span className="font-body text-sm text-taupe">{pagination.total} commande{pagination.total > 1 ? "s" : ""}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-sand py-16 text-center">
          <PackageIcon className="h-10 w-10 text-taupe/50" />
          <div>
            <p className="font-display text-base font-semibold text-espresso">Aucune commande</p>
            <p className="mt-1 font-body text-sm text-taupe">Vos commandes passées apparaîtront ici.</p>
          </div>
          <Link
            href="/boutique"
            className="rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac"
          >
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.reference} order={order} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {currentPage > 1 && (
            <Link
              href={`/compte/commandes?page=${currentPage - 1}`}
              className="rounded-button border border-sand px-4 py-2 font-body text-sm text-taupe transition-colors hover:border-espresso hover:text-espresso"
            >
              ← Précédent
            </Link>
          )}
          <span className="font-body text-sm text-taupe">
            Page {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/compte/commandes?page=${currentPage + 1}`}
              className="rounded-button border border-sand px-4 py-2 font-body text-sm text-taupe transition-colors hover:border-espresso hover:text-espresso"
            >
              Suivant →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
