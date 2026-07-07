"use client";

import { useEffect } from "react";

/**
 * Enregistre le Service Worker (/sw.js) globalement, une fois la page chargée.
 * Découplé de l'abonnement push : le cache léger profite à tous les visiteurs,
 * l'abonnement aux notifications reste une action volontaire (voir PushToggle).
 * Ne rend aucun élément visible.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // En développement, on n'enregistre pas le SW pour éviter que le cache
    // ne serve d'anciens assets pendant le rechargement à chaud (HMR).
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("[PWA] Échec d'enregistrement du Service Worker :", err);
      });
    };

    // Après « load » pour ne pas concurrencer le rendu initial.
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
