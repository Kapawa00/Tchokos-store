import { FavoritesList } from "@/components/account";

export const metadata = { title: "Mes favoris — Tchokos SARL" };

/**
 * Page des favoris.
 * FavoritesList est un composant client (localStorage) — rendu côté navigateur.
 */
export default function FavorisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-espresso">Mes favoris</h1>
        <p className="mt-1 font-body text-sm text-taupe">
          Retrouvez ici les produits que vous avez mis de côté depuis les fiches produit.
        </p>
      </div>
      <FavoritesList />
    </div>
  );
}
