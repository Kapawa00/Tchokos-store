"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/lib/cart";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";

/**
 * Partie cliente de la page panier : gère les mises à jour de quantité et
 * les suppressions sans rechargement de page. Le compteur du header est
 * rafraîchi après chaque mutation via CartContext.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Cart} props.initialCart
 */
export default function CartClient({ initialCart }) {
  const [cart, setCart] = useState(initialCart);
  // Set des IDs de lignes en cours de modification (pour le feedback visuel).
  const [busyIds, setBusyIds] = useState(/** @type {Set<number>} */ (new Set()));
  const { refresh } = useCart();
  const router = useRouter();

  const setBusy = (id, busy) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      busy ? next.add(id) : next.delete(id);
      return next;
    });

  const handleUpdate = async (itemId, newQty) => {
    if (newQty < 1) return handleRemove(itemId);
    setBusy(itemId, true);
    try {
      const updatedCart = await updateCartItem(itemId, newQty);
      setCart(updatedCart);
      await refresh();
    } catch {
      // Erreur silencieuse : l'état local reste inchangé.
    } finally {
      setBusy(itemId, false);
    }
  };

  const handleRemove = async (itemId) => {
    setBusy(itemId, true);
    try {
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
      await refresh();
    } catch {
      // Erreur silencieuse.
    } finally {
      setBusy(itemId, false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      {/* Liste des articles */}
      <section aria-label="Articles dans le panier">
        <div className="divide-y divide-sand">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              busy={busyIds.has(item.id)}
            />
          ))}
        </div>
      </section>

      {/* Récapitulatif + CTA */}
      <CartSummary
        cart={cart}
        onCheckout={() => router.push("/commande")}
      />
    </div>
  );
}
