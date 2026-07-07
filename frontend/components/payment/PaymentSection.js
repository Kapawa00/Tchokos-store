"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@/components/icons";
import MethodSelector from "./MethodSelector";
import OmMomoPayment from "./OmMomoPayment";
import WhatsAppPayment from "./WhatsAppPayment";

const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === "true";

/** @typedef {"orange_money"|"momo"|"whatsapp"} PaymentMethod */

/**
 * Orchestrateur du tunnel de paiement.
 * Gère la sélection du moyen de paiement et délègue à OmMomoPayment
 * ou WhatsAppPayment selon le choix.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Order|null} props.order
 * @param {string} props.reference
 * @param {string|null} [props.phone] - Téléphone du client pour vérification invité.
 */
export default function PaymentSection({ order, reference, phone }) {
  const [method, setMethod] = useState(/** @type {PaymentMethod|null} */ (null));
  const [paid, setPaid] = useState(order?.status === "paid");

  // Statut déjà payé dès l'arrivée sur la page (webhook reçu avant).
  if (paid || order?.status === "paid") {
    return (
      <div className="rounded-card bg-sage/10 p-8 text-center">
        <CheckCircleIcon className="mx-auto mb-4 h-14 w-14 text-sage" />
        <p className="font-display text-xl font-semibold text-espresso">
          Paiement déjà confirmé
        </p>
        <p className="mt-2 font-body text-sm text-taupe">
          Votre commande <strong className="text-espresso">{reference}</strong>{" "}
          est en cours de traitement.
        </p>
      </div>
    );
  }

  // Commande annulée.
  if (order?.status === "cancelled") {
    return (
      <div className="rounded-card border border-bordeaux/30 bg-bordeaux/5 p-6 text-center">
        <p className="font-body text-sm font-semibold text-bordeaux">
          Cette commande a été annulée.
        </p>
        <p className="mt-1 font-body text-xs text-taupe">
          Contactez-nous si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-sand bg-offwhite p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-espresso">
          Paiement
        </h2>
        {IS_SANDBOX && (
          <span className="rounded-full border border-camel/50 bg-camel/10 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wider text-camel">
            Mode test
          </span>
        )}
      </div>

      {/* Sélecteur de méthode (affiché tant qu'aucune méthode n'est choisie) */}
      {!method && (
        <MethodSelector value={method} onChange={setMethod} />
      )}

      {/* Flux OM / MoMo */}
      {(method === "orange_money" || method === "momo") && (
        <OmMomoPayment
          reference={reference}
          method={method}
          phone={phone ?? null}
          onPaid={() => setPaid(true)}
          onBack={() => setMethod(null)}
        />
      )}

      {/* Flux WhatsApp */}
      {method === "whatsapp" && (
        <WhatsAppPayment
          reference={reference}
          order={order}
          onBack={() => setMethod(null)}
        />
      )}
    </div>
  );
}
