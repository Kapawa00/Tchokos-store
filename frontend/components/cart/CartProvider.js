"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCart } from "@/lib/cart";

/**
 * @typedef {Object} CartContextValue
 * @property {number} count - Nombre total d'articles dans le panier.
 * @property {() => Promise<void>} refresh - Recharge le compteur depuis l'API.
 */

const CartContext = createContext(
  /** @type {CartContextValue} */ ({ count: 0, refresh: async () => {} })
);

/**
 * Fournit le compteur du panier à toute l'arborescence cliente.
 * Doit envelopper SiteHeader et le contenu principal (app/layout.js).
 *
 * @param {{ children: React.ReactNode }} props
 */
export function CartProvider({ children }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const cart = await getCart();
      setCount(cart?.items_count ?? 0);
    } catch {
      // Panier inaccessible (invité sans session ou API hors ligne) — on conserve 0.
    }
  }, []);

  // Charge le compteur à l'hydratation côté client.
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CartContext.Provider value={{ count, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

/** Hook pour lire le compteur du panier et rafraîchir après mutation. */
export function useCart() {
  return useContext(CartContext);
}
