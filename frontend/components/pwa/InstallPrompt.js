"use client";

import { useEffect, useState } from "react";
import { CloseIcon, DevicePhoneIcon } from "@/components/icons";

const DISMISS_KEY = "tchokos-a2hs-dismissed";

/**
 * Bannière discrète « Ajouter à l'écran d'accueil ».
 * Écoute l'événement `beforeinstallprompt` (Chrome/Edge/Android), présente un
 * bouton d'installation à la charte, et respecte un refus (mémorisé localement).
 * Ne s'affiche jamais si l'app est déjà installée (mode standalone).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Déjà installée (lancée depuis l'écran d'accueil) → ne rien proposer.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    // Refus mémorisé → on respecte le choix de l'utilisateur.
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (dismissed) return;

    const onBeforeInstall = (e) => {
      // Empêche la mini-infobar native pour proposer notre propre UI.
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice; // { outcome: "accepted" | "dismissed" }
    } catch {}
    // Le prompt natif n'est utilisable qu'une fois.
    setDeferred(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer l'application Tchokos"
      className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-card border border-sand bg-offwhite p-4 shadow-lg sm:left-5 sm:right-auto sm:mx-0"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-espresso text-cream">
          <DevicePhoneIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-semibold text-espresso">
            Installer Tchokos
          </p>
          <p className="mt-0.5 font-body text-xs text-taupe">
            Ajoutez la boutique à votre écran d&apos;accueil pour un accès rapide,
            même hors ligne.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-button bg-espresso px-5 py-2 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            >
              Installer
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-button px-3 py-2 font-body text-sm text-taupe transition-colors hover:text-espresso"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-taupe transition-colors hover:text-espresso"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
