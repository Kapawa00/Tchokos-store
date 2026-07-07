"use client";

import { useState, useEffect } from "react";

/**
 * Barre d'action collée en bas du viewport sur mobile.
 * Apparaît dès que le bouton principal « Ajouter au panier » quitte le viewport,
 * grâce à un IntersectionObserver sur l'ancre #add-to-cart-anchor.
 *
 * Le bouton défile jusqu'à la zone de sélection des variantes plutôt que
 * de dupliquer la logique panier — l'utilisateur doit d'abord choisir ses options.
 *
 * @param {Object} props
 * @param {string} props.price  - Prix formaté (ex. "12 000 FCFA").
 */
export default function MobileActionBar({ price }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("add-to-cart-anchor");
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  const scrollToCart = () => {
    const el = document.getElementById("add-to-cart-anchor");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Actions produit"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-cream/95 px-4 py-3 backdrop-blur-sm sm:hidden"
    >
      <div className="flex items-center gap-3">
        <span className="flex-1 font-body text-lg font-bold text-espresso">
          {price}
        </span>
        <button
          type="button"
          onClick={scrollToCart}
          className="flex-1 rounded-button bg-espresso py-3 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
