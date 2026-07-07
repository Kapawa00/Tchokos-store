"use client";

import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush } from "@/lib/account";
import { BellIcon, CheckCircleIcon } from "@/components/icons";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** Convertit une clé VAPID base64url en Uint8Array. */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * Composant de gestion des notifications push Web.
 * Enregistre le Service Worker, demande la permission, s'abonne / se désabonne.
 */
export default function PushToggle() {
  const [support, setSupport] = useState(/** @type {"loading"|"supported"|"unsupported"} */ ("loading"));
  const [permission, setPermission] = useState(/** @type {NotificationPermission|"loading"} */ ("loading"));
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Vérification du support navigateur au montage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupport(ok ? "supported" : "unsupported");
    if (ok) {
      setPermission(Notification.permission);
      // Vérifie si déjà abonné.
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }
  }, []);

  const handleSubscribe = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      // 1. Enregistrement du Service Worker.
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 2. Demande de permission.
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setError("Permission refusée. Activez les notifications dans les paramètres du navigateur.");
        return;
      }

      // 3. Vérification clé VAPID.
      if (!VAPID_KEY || VAPID_KEY === "placeholder") {
        setError("Clé VAPID manquante — notifications non disponibles en ce moment.");
        return;
      }

      // 4. Abonnement push.
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });

      // 5. Envoi à l'API.
      await subscribePush(subscription);
      setSubscribed(true);
      setMessage("Notifications activées ! Vous serez averti(e) des mises à jour de commande.");
    } catch (err) {
      setError(err?.message ?? "Impossible d'activer les notifications. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // Notification de test : affichée localement par le Service Worker déjà
  // enregistré (via registration.showNotification). Vérifie l'affichage et le
  // clic sans dépendre du serveur push — utile pour valider l'installation.
  const handleTest = async () => {
    setError("");
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Tchokos SARL", {
        body: "Ceci est une notification de test. Bravo, tout fonctionne !",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "tchokos-test",
        data: { url: "/compte/notifications" },
        lang: "fr",
      });
      setMessage("Notification de test envoyée. Vérifiez le centre de notifications.");
    } catch (err) {
      setError(err?.message ?? "Impossible d'afficher la notification de test.");
    }
  };

  const handleUnsubscribe = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMessage("Notifications désactivées.");
    } catch (err) {
      setError(err?.message ?? "Impossible de désactiver les notifications.");
    } finally {
      setLoading(false);
    }
  };

  if (support === "loading") {
    return <div className="h-24 animate-pulse rounded-card bg-sand/40" />;
  }

  if (support === "unsupported") {
    return (
      <div className="rounded-card border border-sand bg-offwhite p-5">
        <p className="font-body text-sm text-taupe">
          Votre navigateur ne prend pas en charge les notifications push. Essayez Chrome ou Firefox.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statut actuel */}
      <div className={`flex items-center gap-3 rounded-card border px-5 py-4 ${subscribed ? "border-sage/30 bg-sage/5" : "border-sand bg-offwhite"}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${subscribed ? "bg-sage/20" : "bg-sand/60"}`}>
          {subscribed ? <CheckCircleIcon className="h-5 w-5 text-sage" /> : <BellIcon className="h-5 w-5 text-taupe" />}
        </div>
        <div>
          <p className="font-body text-sm font-semibold text-espresso">
            {subscribed ? "Notifications activées" : "Notifications désactivées"}
          </p>
          <p className="font-body text-xs text-taupe">
            {subscribed
              ? "Vous recevrez une alerte à chaque mise à jour de vos commandes."
              : "Activez pour être alerté(e) dès l'expédition ou la confirmation de paiement."}
          </p>
        </div>
      </div>

      {/* Avertissement permission bloquée */}
      {permission === "denied" && (
        <div className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
          <p className="font-body text-xs text-bordeaux">
            Les notifications sont bloquées dans votre navigateur. Cliquez sur l&apos;icône de cadenas dans la barre d&apos;adresse pour les autoriser.
          </p>
        </div>
      )}

      {message && (
        <p className="font-body text-sm text-sage">{message}</p>
      )}
      {error && (
        <p className="font-body text-sm text-bordeaux" role="alert">{error}</p>
      )}

      {/* Bouton d'action */}
      {!subscribed ? (
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading || permission === "denied"}
          className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
        >
          {loading ? "Activation…" : "Activer les notifications"}
        </button>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading}
            className="w-full rounded-button border border-cognac px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
          >
            Envoyer une notification de test
          </button>
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full rounded-button border border-bordeaux/50 px-7 py-3.5 font-body font-medium text-bordeaux transition-colors hover:bg-bordeaux hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux disabled:opacity-60"
          >
            {loading ? "Désactivation…" : "Désactiver les notifications"}
          </button>
        </div>
      )}
    </div>
  );
}
