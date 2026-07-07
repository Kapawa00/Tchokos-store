"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWholesaleStatus } from "@/lib/account";
import { WholesaleForm, WholesaleStatus } from "@/components/account";
import { BuildingStorefrontIcon, CheckCircleIcon } from "@/components/icons";

/**
 * Page de l'espace grossiste.
 * - Si pas encore de demande → affiche WholesaleForm.
 * - Si demande en cours / refusée → affiche WholesaleStatus + option renouvellement.
 * - Si approuvé → panneau de félicitations.
 */
export default function GrossistePage() {
  const [account, setAccount] = useState(/** @type {import("@/lib/types").WholesaleAccount|null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getWholesaleStatus()
      .then(setAccount)
      .catch(() => setError("Impossible de charger les informations grossiste."))
      .finally(() => setLoading(false));
  }, []);

  const status = account?.status ?? "none";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/20">
          <BuildingStorefrontIcon className="h-5 w-5 text-espresso" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-espresso">Espace grossiste</h1>
          <p className="font-body text-xs text-taupe">
            Accédez aux tarifs de gros et aux conditions spéciales pour les professionnels.
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-card bg-sand/40" />)}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
          <p className="font-body text-sm text-bordeaux">{error}</p>
        </div>
      )}

      {/* ── Approuvé ── */}
      {!loading && status === "approved" && (
        <div className="space-y-5">
          <div className="rounded-card border border-brass/40 bg-brass/5 p-6 text-center">
            <CheckCircleIcon className="mx-auto mb-3 h-12 w-12 text-brass" />
            <p className="font-display text-lg font-bold text-espresso">Compte grossiste actif</p>
            <p className="mt-2 font-body text-sm text-taupe">
              Vous bénéficiez des prix de gros sur toute la boutique. Connectez-vous et parcourez les produits pour voir les tarifs spéciaux.
            </p>
          </div>
          <WholesaleStatus account={account} />
          <div className="text-center">
            <Link
              href="/boutique"
              className="inline-block rounded-button bg-espresso px-8 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac"
            >
              Voir les prix grossiste →
            </Link>
          </div>
        </div>
      )}

      {/* ── Refusé : option de renouvellement ── */}
      {!loading && status === "rejected" && (
        <div className="space-y-5">
          <WholesaleStatus account={account} />
          <div className="rounded-card border border-sand bg-offwhite p-6">
            <h2 className="mb-2 font-body text-sm font-semibold text-espresso">Soumettre une nouvelle demande</h2>
            <p className="mb-4 font-body text-xs text-taupe">
              Vous pouvez déposer une nouvelle demande en précisant des informations complémentaires.
            </p>
            <WholesaleForm onSubmitted={setAccount} />
          </div>
        </div>
      )}

      {/* ── En attente ── */}
      {!loading && status === "pending" && (
        <WholesaleStatus account={account} />
      )}

      {/* ── Aucune demande ── */}
      {!loading && status === "none" && (
        <div className="space-y-5">
          {/* Avantages */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Prix de gros", desc: "Tarifs préférentiels directement sur les fiches produit." },
              { title: "Volume & régularité", desc: "Commandes récurrentes simplifiées avec votre interlocuteur dédié." },
              { title: "Priorité de stock", desc: "Accès prioritaire aux nouveautés et aux gros lots." },
            ].map((adv) => (
              <div key={adv.title} className="rounded-card border border-brass/30 bg-brass/5 p-4">
                <p className="mb-1 font-body text-xs font-bold text-espresso">{adv.title}</p>
                <p className="font-body text-xs text-taupe">{adv.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-card border border-sand bg-offwhite p-6">
            <h2 className="mb-4 font-display text-base font-semibold text-espresso">Déposer une demande</h2>
            <WholesaleForm onSubmitted={setAccount} />
          </div>
        </div>
      )}
    </div>
  );
}
