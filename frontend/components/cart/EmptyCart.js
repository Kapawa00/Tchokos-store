import Link from "next/link";
import { CartIcon } from "@/components/icons";

/** Affichage panier vide (invité sans session ou panier vidé). */
export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand">
        <CartIcon className="h-8 w-8 text-taupe" />
      </div>
      <div>
        <p className="font-display text-xl font-semibold text-espresso">
          Votre panier est vide
        </p>
        <p className="mt-1 font-body text-sm text-taupe">
          Ajoutez des articles pour continuer vos achats.
        </p>
      </div>
      <Link
        href="/boutique"
        className="rounded-button bg-espresso px-7 py-3 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Découvrir la boutique
      </Link>
    </div>
  );
}
